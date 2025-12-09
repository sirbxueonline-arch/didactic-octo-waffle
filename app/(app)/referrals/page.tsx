"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const generateCode = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Simple referral code based on user ID
        const code = user.id.slice(0, 8).toUpperCase()
        setReferralCode(code)
      }
      setLoading(false)
    }
    generateCode()
  }, [])

  const handleCopy = () => {
    const url = `${window.location.origin}/auth/signup?ref=${referralCode}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/signup?ref=${referralCode}`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referrals</h1>
        <p className="text-muted-foreground mt-2">
          Invite friends and earn rewards
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>Share this code with friends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={referralCode} readOnly />
            <Button onClick={handleCopy}>Copy</Button>
          </div>
          <div className="space-y-2">
            <Label>Referral Link</Label>
            <div className="flex gap-2">
              <Input value={referralUrl} readOnly />
              <Button onClick={handleCopy}>Copy Link</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rewards Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We&apos;re working on a rewards program. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

