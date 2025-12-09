"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [items, setItems] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (!open || !search) {
      setItems([])
      return
    }

    const fetchItems = async () => {
      const { data } = await supabase
        .from("library_items")
        .select("id, title, type, tags")
        .ilike("title", `%${search}%`)
        .limit(10)

      if (data) {
        setItems(data)
      }
    }

    fetchItems()
  }, [search, open])

  const quickActions = [
    { label: "New Quiz", action: () => router.push("/generate?tab=quiz") },
    { label: "New Flashcards", action: () => router.push("/generate?tab=flashcards") },
    { label: "Go to Settings", action: () => router.push("/settings") },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <Command.Input
            placeholder="Search library or type a command..."
            value={search}
            onValueChange={setSearch}
          />
          <Command.List>
            {search && items.length > 0 && (
              <Command.Group heading="Library Items">
                {items.map((item) => (
                  <Command.Item
                    key={item.id}
                    onSelect={() => {
                      router.push(`/library/${item.id}`)
                      setOpen(false)
                    }}
                  >
                    {item.title}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            <Command.Group heading="Quick Actions">
              {quickActions.map((action) => (
                <Command.Item
                  key={action.label}
                  onSelect={() => {
                    action.action()
                    setOpen(false)
                  }}
                >
                  {action.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

