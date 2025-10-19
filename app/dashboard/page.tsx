"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Package, Edit, Trash2, CheckCircle, ArrowLeft, LogOut } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Item {
  id: string
  type: string
  title: string
  description: string
  category: string
  campus: string
  location: string
  date_occurred: string
  status: string
  image_url: string | null
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [markRecoveredId, setMarkRecoveredId] = useState<string | null>(null)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (currentUser) {
        setUser(currentUser)
        fetchItems(currentUser.email!)
      } else {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  async function fetchItems(email: string) {
    setLoading(true)
    const { data } = await supabase
      .from("items")
      .select("*")
      .eq("contact_email", email)
      .order("created_at", { ascending: false })

    if (data) {
      setItems(data)
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true)

    await supabase.from("items").delete().eq("contact_email", user.email)

    const { error } = await supabase.auth.admin.deleteUser(user.id)

    if (!error) {
      await supabase.auth.signOut()
      router.push("/")
    } else {
      await supabase.auth.signOut()
      router.push("/")
    }

    setDeletingAccount(false)
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("items").delete().eq("id", id)
    if (!error) {
      setItems(items.filter((item) => item.id !== id))
    }
    setDeleteId(null)
  }

  async function handleMarkRecovered(id: string) {
    const { error } = await supabase.from("items").update({ status: "returned" }).eq("id", id)
    if (!error) {
      setItems(items.map((item) => (item.id === id ? { ...item, status: "returned" } : item)))
    }
    setMarkRecoveredId(null)
  }

  const lostItems = items.filter((item) => item.type === "lost")
  const foundItems = items.filter((item) => item.type === "found")

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16 max-w-md">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-center">Access Your Dashboard</CardTitle>
              <CardDescription className="text-center">
                Enter your email address to view and manage your posted items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading user...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowDeleteAccount(true)} className="text-destructive">
              Delete Account
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your items...</p>
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Items Yet</h3>
              <p className="text-muted-foreground mb-6">You haven't reported any lost or found items</p>
              <div className="flex gap-4 justify-center">
                <Link href="/report-lost">
                  <Button>Report Lost Item</Button>
                </Link>
                <Link href="/report-found">
                  <Button variant="outline">Report Found Item</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Items ({items.length})</TabsTrigger>
              <TabsTrigger value="lost">Lost ({lostItems.length})</TabsTrigger>
              <TabsTrigger value="found">Found ({foundItems.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onDelete={() => setDeleteId(item.id)}
                  onMarkRecovered={() => setMarkRecoveredId(item.id)}
                />
              ))}
            </TabsContent>

            <TabsContent value="lost" className="space-y-4">
              {lostItems.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">No lost items reported</CardContent>
                </Card>
              ) : (
                lostItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onDelete={() => setDeleteId(item.id)}
                    onMarkRecovered={() => setMarkRecoveredId(item.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="found" className="space-y-4">
              {foundItems.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">No found items reported</CardContent>
                </Card>
              ) : (
                foundItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onDelete={() => setDeleteId(item.id)}
                    onMarkRecovered={() => setMarkRecoveredId(item.id)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this item from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark Recovered Dialog */}
      <AlertDialog open={!!markRecoveredId} onOpenChange={() => setMarkRecoveredId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Returned?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the item as returned and remove it from public listings. You can still view it in your
              dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => markRecoveredId && handleMarkRecovered(markRecoveredId)}>
              Mark as Returned
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and all your posted items from the
              database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingAccount ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ItemCard({
  item,
  onDelete,
  onMarkRecovered,
}: {
  item: Item
  onDelete: () => void
  onMarkRecovered: () => void
}) {
  const router = useRouter()

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {item.image_url && (
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border">
              <img src={item.image_url || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-balance">{item.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={item.type === "lost" ? "destructive" : "default"}>
                    {item.type === "lost" ? "Lost" : "Found"}
                  </Badge>
                  <Badge variant="outline">{item.category}</Badge>
                  {item.status === "returned" && <Badge variant="secondary">Returned</Badge>}
                  {item.status === "at_security" && <Badge variant="secondary">At Security</Badge>}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
            <div className="text-sm text-muted-foreground space-y-1 mb-4">
              <p>
                <strong>Campus:</strong> {item.campus}
              </p>
              <p>
                <strong>Location:</strong> {item.location}
              </p>
              <p>
                <strong>Date:</strong> {new Date(item.date_occurred).toLocaleDateString()}
              </p>
              <p>
                <strong>Posted:</strong> {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => router.push(`/edit/${item.id}`)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              {item.status !== "returned" && (
                <Button size="sm" variant="outline" onClick={onMarkRecovered}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Returned
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={onDelete}
                className="text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
