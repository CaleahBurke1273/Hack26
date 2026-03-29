import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

type Category = "all" | "posts" | "marketplace" | "students";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: posts = [] } = useQuery({
    queryKey: ["search-posts", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) return [];

        // Client-side filtering for multiple fields
        const needle = searchTerm.toLowerCase();
        return (data || []).filter(
          (post: any) =>
            post.title.toLowerCase().includes(needle) ||
            post.content.toLowerCase().includes(needle) ||
            post.category.toLowerCase().includes(needle)
        );
      } catch (err) {
        console.error("Post search error:", err);
        return [];
      }
    },
    enabled: (category === "all" || category === "posts") && !!searchTerm,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["search-listings", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      try {
        const { data, error } = await supabase
          .from("marketplace_listings")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) return [];

        // Client-side filtering for multiple fields
        const needle = searchTerm.toLowerCase();
        return (data || []).filter(
          (listing: any) =>
            listing.title.toLowerCase().includes(needle) ||
            listing.description.toLowerCase().includes(needle) ||
            listing.category.toLowerCase().includes(needle)
        );
      } catch (err) {
        console.error("Listing search error:", err);
        return [];
      }
    },
    enabled: (category === "all" || category === "marketplace") && !!searchTerm,
  });

  const { data: students = [] } = useQuery({
    queryKey: ["search-students", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .limit(20);

        if (error) return [];

        // Client-side filtering for multiple fields
        const needle = searchTerm.toLowerCase();
        return (data || []).filter(
          (profile: any) =>
            profile.full_name.toLowerCase().includes(needle) ||
            (profile.bio && profile.bio.toLowerCase().includes(needle)) ||
            (profile.program && profile.program.toLowerCase().includes(needle))
        );
      } catch (err) {
        console.error("Student search error:", err);
        return [];
      }
    },
    enabled: (category === "all" || category === "students") && !!searchTerm,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  const categories: { value: Category; label: string }[] = [
    { value: "all", label: "All" },
    { value: "posts", label: "Posts" },
    { value: "marketplace", label: "Marketplace" },
    { value: "students", label: "Students" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Search</h1>
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search posts, listings, students..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="flex gap-2">
        {categories.map((c) => (
          <Button key={c.value} variant={category === c.value ? "default" : "outline"} size="sm" onClick={() => setCategory(c.value)}>
            {c.label}
          </Button>
        ))}
      </div>

      {!searchTerm && <p className="text-muted-foreground text-sm text-center py-10">Start typing to search across SU.</p>}

      {searchTerm && (
        <div className="space-y-6">
          {(category === "all" || category === "posts") && posts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Blog Posts</h2>
              <div className="space-y-2">
                {posts.map((p: any) => (
                  <Link key={p.id} to={`/blogs/${p.id}`}>
                    <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
                      <p className="font-medium text-sm text-foreground">{p.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(p.created_at), "MMM d")} · {p.category}</p>
                    </CardContent></Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(category === "all" || category === "marketplace") && listings.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Marketplace</h2>
              <div className="space-y-2">
                {listings.map((l: any) => (
                  <Card key={l.id}><CardContent className="p-4 flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{l.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{l.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{l.category}</p>
                    </div>
                    <span className="font-semibold text-primary whitespace-nowrap">${Number(l.price).toFixed(2)}</span>
                  </CardContent></Card>
                ))}
              </div>
            </div>
          )}

          {(category === "all" || category === "students") && students.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Students</h2>
              <div className="space-y-2">
                {students.map((s: any) => (
                  <Link key={s.user_id} to={`/profile/${s.user_id}`}>
                    <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground">{s.full_name || "Student"}</p>
                        <p className="text-xs text-muted-foreground truncate">{s.program || "No program"} · Year {s.year_of_study || "N/A"}</p>
                        {s.bio && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{s.bio}</p>}
                      </div>
                    </CardContent></Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {searchTerm && posts.length === 0 && listings.length === 0 && students.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-10">No results found for \"{searchTerm}\"</p>
      )}
    </div>
  );
};

export default SearchPage;
