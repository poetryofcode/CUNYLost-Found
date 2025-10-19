"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Package, MapPin, Calendar, Building2 } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface Item {
  id: string
  type: "lost" | "found"
  title: string
  description: string
  category: string
  campus: string // Added campus field
  location: string
  date_occurred: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  image_url: string | null // Added image_url field
  status: string
  created_at: string
}

const categories = [
  "All Categories",
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
  "All Campuses",
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

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedCampus, setSelectedCampus] = useState("All Campuses") // Added campus filter state
  const [dateFrom, setDateFrom] = useState("") // Added date range filter
  const [dateTo, setDateTo] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "lost" | "found">("all")
  const [showSuccess, setShowSuccess] = useState(false)
  const [successType, setSuccessType] = useState<"lost" | "found" | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const success = searchParams.get("success")
    const tab = searchParams.get("tab")
    const search = searchParams.get("search")

    if (success === "lost" || success === "found") {
      setShowSuccess(true)
      setSuccessType(success)
      setTimeout(() => setShowSuccess(false), 5000)
    }

    if (tab === "found" || tab === "lost") {
      setActiveTab(tab)
    }

    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .in("status", ["active", "at_security"]) // Include items at security
        .order("created_at", { ascending: false })

      if (!error && data) {
        setItems(data)
        setFilteredItems(data)
      }
      setIsLoading(false)
    }

    fetchItems()
  }, [supabase])

  useEffect(() => {
    let filtered = items

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.type === activeTab)
    }

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (selectedCampus !== "All Campuses") {
      filtered = filtered.filter((item) => item.campus === selectedCampus)
    }

    if (dateFrom) {
      filtered = filtered.filter((item) => new Date(item.date_occurred) >= new Date(dateFrom))
    }
    if (dateTo) {
      filtered = filtered.filter((item) => new Date(item.date_occurred) <= new Date(dateTo))
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query),
      )
    }

    setFilteredItems(filtered)
  }, [items, activeTab, selectedCategory, selectedCampus, dateFrom, dateTo, searchQuery])

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

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-primary text-primary-foreground py-3">
          <div className="container mx-auto px-4 text-center">
            <p className="font-medium">
              {successType === "lost"
                ? "Your lost item report has been submitted successfully!"
                : "Thank you for reporting the found item!"}
            </p>
          </div>
        </div>
      )}

      {/* Browse Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-balance">Browse Items</h1>
            <p className="text-muted-foreground text-pretty">
              Search through reported lost and found items to find what you're looking for.
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by title, description, or location..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                  <Label htmlFor="campus">Campus</Label>
                  <Select value={selectedCampus} onValueChange={setSelectedCampus}>
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
                  <Label htmlFor="dateFrom">Date From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateTo">Date To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "lost" | "found")}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Items ({items.length})</TabsTrigger>
              <TabsTrigger value="lost">Lost ({items.filter((i) => i.type === "lost").length})</TabsTrigger>
              <TabsTrigger value="found">Found ({items.filter((i) => i.type === "found").length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading items...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No items found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="flex flex-col">
                      {item.image_url && (
                        <div className="w-full h-48 overflow-hidden rounded-t-lg">
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-lg text-balance">{item.title}</CardTitle>
                          <div className="flex flex-col gap-1">
                            <Badge variant={item.type === "lost" ? "destructive" : "default"}>
                              {item.type === "lost" ? "Lost" : "Found"}
                            </Badge>
                            {item.status === "at_security" && (
                              <Badge variant="secondary" className="text-xs">
                                At Security
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Package className="h-4 w-4 flex-shrink-0" />
                            <span>{item.category}</span>
                          </div>
                          {item.campus && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building2 className="h-4 w-4 flex-shrink-0" />
                              <span className="line-clamp-1">{item.campus}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-1">{item.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{new Date(item.date_occurred).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="border-t pt-3">
                          <p className="text-sm text-muted-foreground text-center">Posted by {item.contact_name}</p>
                          <p className="text-xs text-muted-foreground text-center mt-1">
                            Contact: {item.contact_email}
                            {item.contact_phone && ` • ${item.contact_phone}`}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
