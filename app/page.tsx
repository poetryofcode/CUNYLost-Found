"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, AlertCircle, CheckCircle, User } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"

interface Item {
  id: string
  title: string
  category: string
  campus: string
  date_occurred: string
  created_at: string
}

export default function HomePage() {
  const [recentItems, setRecentItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabaseBrowserClient()

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)

      const { data } = await supabase
        .from("items")
        .select("id, title, category, campus, date_occurred, created_at")
        .eq("type", "lost")
        .in("status", ["active", "at_security"])
        .order("created_at", { ascending: false })
        .limit(6)

      if (data) {
        setRecentItems(data)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="CUNY Lost & Found Logo" className="h-12 w-auto object-contain" />
            </Link>
            <nav className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/browse">
                    <Button variant="ghost">Browse Items</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="ghost">
                      <User className="h-4 w-4 mr-2" />
                      My Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/browse">
                    <Button variant="ghost">Browse Items</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost">Log In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Lost Something? Found Something?</h2>
          <p className="text-lg md:text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto text-pretty">
            Connect with your CUNY community to reunite lost items with their owners. Report what you've lost or found
            to help fellow students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/report-lost">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <AlertCircle className="mr-2 h-5 w-5" />
                Report Lost Item
              </Button>
            </Link>
            <Link href="/report-found">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <CheckCircle className="mr-2 h-5 w-5" />
                Report Found Item
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-balance">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Report</CardTitle>
                <CardDescription>
                  Lost or found something? Create a detailed report with description, location, and date.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Search</CardTitle>
                <CardDescription>
                  Browse through reported items and search by category, location, or date to find matches.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Connect</CardTitle>
                <CardDescription>
                  Found a match? Use the contact information to connect and arrange the return.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-accent text-accent-foreground">
            <CardContent className="p-8 md:p-12 text-center">
              <h3 className="text-3xl font-bold mb-4 text-balance">Ready to Get Started?</h3>
              <p className="text-lg mb-6 text-accent-foreground/90 max-w-2xl mx-auto text-pretty">
                Join the CUNY community in helping each other recover lost belongings.
              </p>
              <Link href="/browse">
                <Button size="lg" variant="secondary">
                  <Search className="mr-2 h-5 w-5" />
                  Browse All Items
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recently Lost Items */}
      {!loading && recentItems.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-balance">Recently Lost Items</h3>
                <p className="text-muted-foreground mt-2">Help reunite these items with their owners</p>
              </div>
              <Link href="/browse?tab=lost">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-balance">{item.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {item.category}
                          {item.campus && ` • ${item.campus}`}
                        </CardDescription>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Lost on {new Date(item.date_occurred).toLocaleDateString()}
                    </p>
                    <Link href={`/browse?search=${encodeURIComponent(item.title)}`}>
                      <Button variant="secondary" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-8 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>CUNY Lost & Found - Helping CUNY community reconnect with their belongings</p>
        </div>
      </footer>
    </div>
  )
}
