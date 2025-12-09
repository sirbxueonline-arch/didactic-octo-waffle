-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  grade TEXT,
  subjects JSONB DEFAULT '[]',
  default_language TEXT DEFAULT 'en',
  explanation_style_default TEXT DEFAULT 'detailed',
  hint_mode_default BOOLEAN DEFAULT true,
  theme_preference TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage monthly tracking
CREATE TABLE IF NOT EXISTS usage_monthly (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_key TEXT NOT NULL,
  resources_used INT NOT NULL DEFAULT 0,
  resource_limit INT NOT NULL DEFAULT 20,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_key)
);

-- Library items
CREATE TABLE IF NOT EXISTS library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('EXPLAIN','FLASHCARDS','QUIZ','PLAN')),
  title TEXT NOT NULL,
  subject TEXT,
  tags JSONB DEFAULT '[]',
  payload JSONB NOT NULL,
  favorite BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collections
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Library item collections (join table)
CREATE TABLE IF NOT EXISTS library_item_collections (
  library_item_id UUID REFERENCES library_items(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (library_item_id, collection_id)
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  library_item_id UUID REFERENCES library_items(id) ON DELETE SET NULL,
  score INT NOT NULL,
  total INT NOT NULL,
  answers JSONB DEFAULT '[]',
  weak_topics JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flashcard progress (Leitner system)
CREATE TABLE IF NOT EXISTS flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  set_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  card_key TEXT NOT NULL,
  box_level INT NOT NULL DEFAULT 1,
  last_reviewed_at TIMESTAMPTZ,
  next_due_at TIMESTAMPTZ,
  UNIQUE(user_id, set_id, card_key)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback requests
CREATE TABLE IF NOT EXISTS feedback_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('feedback','feature_request','limit_increase')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_library_items_user_id ON library_items(user_id);
CREATE INDEX IF NOT EXISTS idx_library_items_type ON library_items(type);
CREATE INDEX IF NOT EXISTS idx_library_items_status ON library_items(status);
CREATE INDEX IF NOT EXISTS idx_usage_monthly_user_month ON usage_monthly(user_id, month_key);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_set ON flashcard_progress(user_id, set_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- RLS Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_item_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Usage monthly policies (read-only for users)
CREATE POLICY "Users can view own usage" ON usage_monthly
  FOR SELECT USING (auth.uid() = user_id);

-- Library items policies
CREATE POLICY "Users can view own library items" ON library_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own library items" ON library_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own library items" ON library_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own library items" ON library_items
  FOR DELETE USING (auth.uid() = user_id);

-- Collections policies
CREATE POLICY "Users can view own collections" ON collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON collections
  FOR DELETE USING (auth.uid() = user_id);

-- Library item collections policies
CREATE POLICY "Users can manage own item collections" ON library_item_collections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM library_items
      WHERE library_items.id = library_item_collections.library_item_id
      AND library_items.user_id = auth.uid()
    )
  );

-- Quiz attempts policies
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Flashcard progress policies
CREATE POLICY "Users can manage own flashcard progress" ON flashcard_progress
  FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Feedback requests policies
CREATE POLICY "Users can insert own feedback" ON feedback_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback" ON feedback_requests
  FOR SELECT USING (auth.uid() = user_id);

-- RPC Function: Atomic save with limit enforcement
CREATE OR REPLACE FUNCTION save_library_item_with_limit(
  p_type TEXT,
  p_title TEXT,
  p_subject TEXT,
  p_tags JSONB,
  p_payload JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_month_key TEXT;
  v_current_usage INT;
  v_limit INT;
  v_new_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get current month key (UTC)
  v_month_key := TO_CHAR((NOW() AT TIME ZONE 'UTC'), 'YYYY-MM');

  -- Upsert usage_monthly record
  INSERT INTO usage_monthly (user_id, month_key, resources_used, resource_limit)
  VALUES (v_user_id, v_month_key, 0, 20)
  ON CONFLICT (user_id, month_key)
  DO UPDATE SET updated_at = NOW()
  RETURNING resources_used, resource_limit INTO v_current_usage, v_limit;

  -- Check limit
  IF v_current_usage >= v_limit THEN
    RAISE EXCEPTION 'RESOURCE_LIMIT' USING
      ERRCODE = 'P0001',
      MESSAGE = 'Monthly resource limit reached',
      HINT = format('Limit: %s, Used: %s, Month: %s', v_limit, v_current_usage, v_month_key);
  END IF;

  -- Increment usage atomically
  UPDATE usage_monthly
  SET resources_used = resources_used + 1,
      updated_at = NOW()
  WHERE user_id = v_user_id AND month_key = v_month_key;

  -- Insert library item
  INSERT INTO library_items (user_id, type, title, subject, tags, payload)
  VALUES (v_user_id, p_type, p_title, p_subject, p_tags, p_payload)
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

