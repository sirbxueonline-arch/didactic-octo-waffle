import { HeaderNav } from "@/components/header-nav"
import { CommandPalette } from "@/components/command-palette"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HeaderNav />
      <CommandPalette />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </>
  )
}

