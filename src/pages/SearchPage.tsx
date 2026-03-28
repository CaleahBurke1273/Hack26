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

  const { data: posts } = useQuery({
    queryKey: ["search-posts", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const { data } = await supabase
        .from("posts")
        .select("*, profiles!posts_user_id_fkey(full_name)")
        .ilike("title", `%${searchTerm}%`)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: (category === "all" || category === "posts") && !!searchTerm,
  });

  const { data: listings } = useQuery({
    queryKey: ["search-listings", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const { data } = await supabase
        .from("marketplace_listings")
        .select("*, profiles!marketplace_listings_seller_id_fkey(full_name)")
        .ilike("title", `%${searchTerm}%`)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: (category === "all" || category === "marketplace") && !!searchTerm,
  });

  const { data: students } = useQuery({
    queryKey: ["search-students", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .ilike("full_name", `%${searchTerm}%`)
        .limit(20);
      return data || [];
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
          {(category === "all" || category === "posts") && posts && posts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Posts</h2>
              <div className="space-y-2">
                {posts.map((p: any) => (
                  <Card key={p.id}><CardContent className="p-4">
                    <p className="font-medium text-sm text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.profiles?.full_name} · {format(new Date(p.created_at), "MMM d")} · {p.category}</p>
                  </CardContent></Card>
                ))}
              </div>
            </div>
          )}

          {(category === "all" || category === "marketplace") && listings && listings.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Marketplace</h2>
              <div className="space-y-2">
                {listings.map((l: any) => (
                  <Card key={l.id}><CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm text-foreground">{l.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{l.profiles?.full_name} · {l.category}</p>
                    </div>
                    <span className="font-semibold text-primary">${Number(l.price).toFixed(2)}</span>
                  </CardContent></Card>
                ))}
              </div>
            </div>
          )}

          {(category === "all" || category === "students") && students && students.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Students</h2>
              <div className="space-y-2">
                {students.map((s: any) => (
                  <Link key={s.user_id} to={`/profile/${s.user_id}`}>
                    <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{s.full_name || "Student"}</p>
                        <p className="text-xs text-muted-foreground">{s.program} · Year {s.year_of_study}</p>
                      </div>
                    </CardContent></Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
