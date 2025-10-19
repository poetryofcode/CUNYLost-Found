"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"

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

export default function ReportLostPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [imagePreview, setImagePreview] = useState<string>("")
  const [user, setUser] = useState<any>(null)

  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

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

    const itemData = {
      type: "lost",
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      campus: formData.get("campus") as string,
      location: formData.get("location") as string,
      date_occurred: formData.get("date") as string,
      contact_name: formData.get("name") as string,
      contact_email: user?.email || (formData.get("email") as string),
      contact_phone: (formData.get("phone") as string) || null,
      image_url: imagePreview || null,
      status: "active",
    }

    const { error: insertError } = await supabase.from("items").insert([itemData])

    if (insertError) {
      setError("Failed to submit report. Please try again.")
      setIsSubmitting(false)
      return
    }

    router.push("/dashboard?success=lost")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-balance">Report Lost Item</h1>
            <p className="text-muted-foreground text-pretty">
              Fill out the form below to report your lost item. We'll help you connect with anyone who may have found
              it.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>Provide as much detail as possible to help identify your item</CardDescription>
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
                  <p className="text-sm text-muted-foreground">Upload a photo to help identify your item</p>
                </div>

                {/* Item Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Item Name *</Label>
                  <Input id="title" name="title" placeholder="e.g., Black iPhone 13" required />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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
                  <Select name="campus" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your campus" />
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

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your item in detail (color, brand, distinguishing features, etc.)"
                    rows={4}
                    required
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Last Seen Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Library 3rd Floor, Student Center Cafeteria"
                    required
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date Lost *</Label>
                  <Input id="date" name="date" type="date" max={new Date().toISOString().split("T")[0]} required />
                </div>

                {/* Contact Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input id="name" name="name" placeholder="Full name" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@cuny.edu"
                        defaultValue={user?.email || ""}
                        disabled={!!user}
                        readOnly={!!user}
                        required
                      />
                      {user && <p className="text-sm text-muted-foreground">Using your account email</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" />
                    </div>
                  </div>
                </div>

                {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">{error}</div>}

                {/* Submit Button */}
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
                    {isSubmitting ? "Submitting..." : "Submit Report"}
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
