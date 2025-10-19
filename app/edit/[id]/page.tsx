"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Keys",
  "Wallet/Purse",
  "ID/Cards",
  "Jewelry",
  "Bags/Backpacks",
  "Other",
]

const campuses = [
  "Baruch College",
  "Brooklyn College",
  "City College",
  "College of Staten Island",
  "Hunter College",
  "John Jay College",
  "Lehman College",
  "Medgar Evers College",
  "NYC College of Technology",
  "Queens College",
  "York College",
  "Other CUNY Campus",
]

interface Item {
  id: string
  type: string
  title: string
  description: string
  category: string
  campus: string
  location: string
  date_occurred: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  image_url: string | null
  status: string
}

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const [item, setItem] = useState<Item | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState<string>("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    async function fetchItem() {
      const { data } = await supabase.from("items").select("*").eq("id", params.id).single()

      if (data) {
        setItem(data)
        if (data.image_url) {
          setImagePreview(data.image_url)
        }
      } else {
        setError("Item not found")
      }
      setLoading(false)
    }

    fetchItem()
  }, [params.id])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)

    const updatedData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      campus: formData.get("campus") as string,
      location: formData.get("location") as string,
      date_occurred: formData.get("date") as string,
      contact_name: formData.get("name") as string,
      contact_email: formData.get("email") as string,
      contact_phone: (formData.get("phone") as string) || null,
      image_url: imagePreview || null,
    }

    const { error: updateError } = await supabase.from("items").update(updatedData).eq("id", params.id)

    if (updateError) {
      setError("Failed to update item. Please try again.")
      setIsSubmitting(false)
      return
    }

    router.push("/dashboard?success=updated")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Item Not Found</h2>
            <p className="text-muted-foreground mb-4">The item you're trying to edit doesn't exist.</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              {item.type === "lost" ? (
                <AlertCircle className="h-8 w-8 text-destructive" />
              ) : (
                <CheckCircle className="h-8 w-8 text-primary" />
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2 text-balance">
              Edit {item.type === "lost" ? "Lost" : "Found"} Item
            </h1>
            <p className="text-muted-foreground text-pretty">Update the details of your item</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>Make changes to your item information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="image">Item Photo (Optional)</Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden border">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Item Name *</Label>
                  <Input id="title" name="title" defaultValue={item.title} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" defaultValue={item.category} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campus">Campus *</Label>
                  <Select name="campus" defaultValue={item.campus} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {campuses.map((campus) => (
                        <SelectItem key={campus} value={campus}>
                          {campus}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" name="description" defaultValue={item.description} rows={4} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" name="location" defaultValue={item.location} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date {item.type === "lost" ? "Lost" : "Found"} *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={item.date_occurred}
                    max={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input id="name" name="name" defaultValue={item.contact_name} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" name="email" type="email" defaultValue={item.contact_email} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input id="phone" name="phone" type="tel" defaultValue={item.contact_phone || ""} />
                    </div>
                  </div>
                </div>

                {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">{error}</div>}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
