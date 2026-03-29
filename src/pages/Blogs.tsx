import { useState } from "react";
import type React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Plus,
  BookOpen,
  FlaskConical,
  Palette,
  Leaf,
} from "lucide-react";

import { toast } from "sonner";
import { format } from "date-fns";

import type { Database } from "@/integrations/supabase/types";

type BlogPost = Database["public"]["Tables"]["posts"]["Row"];
type BlogCategory = Database["public"]["Enums"]["post_category"];

const categories = [
  { name: "Blog", value: "blog", icon: BookOpen },
  { name: "Academic", value: "academic", icon: FlaskConical },
  { name: "Campus", value: "campus", icon: Leaf },
  { name: "General", value: "general", icon: Palette },
] as const;

const Blogs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "general" as BlogCategory,
  });

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<BlogCategory | null>(null);

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["blog-posts", selectedCategory],
    queryFn: async () => {
      let query = supabase.from("posts").select("*");

      if (selectedCategory) query = query.eq("category", selectedCategory);

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        toast.error("Failed to load blog posts.");
        return [];
      }

      return data as BlogPost[];
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in to post.");

    setCreating(true);

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      title: form.title,
      content: form.content,
      category: form.category,
    });

    setCreating(false);

    if (error) return toast.error("Failed to create post.");

    toast.success("Blog post created!");
    setOpen(false);
    setForm({ title: "", content: "", category: "general" });

    queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
  };

  const filteredPosts = posts.filter((p) =>
    (p.title + p.content).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">School Blogs</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={!user}>
              <Plus className="h-4 w-4 mr-1" />
              New Post
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Blog Post</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              <Textarea
                placeholder="Share your thoughts..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                required
              />

              <select
                className="w-full border rounded-md p-2"
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: (e.target as HTMLSelectElement)
                      .value as BlogCategory,
                  })
                }
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.name}
                  </option>
                ))}
              </select>

              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? "Posting..." : "Publish"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Search blog posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.value ? null : cat.value
                )
              }
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {cat.name}
            </Button>
          );
        })}
      </div>

      <h2 className="text-lg font-semibold text-muted-foreground">
        All Posts
      </h2>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">
          Loading posts...
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((p) => (
            <Link to={`/blogs/${p.id}`} key={p.id}>
              <Card className="cursor-pointer hover:bg-accent transition">
                <CardContent className="p-5 space-y-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-muted inline-block">
                    {p.category}
                  </span>

                  <h3 className="text-lg font-semibold">{p.title}</h3>

                  <p className="text-sm whitespace-pre-wrap line-clamp-3">
                    {p.content}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {format(new Date(p.created_at), "MMM d, yyyy")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No matching posts found.</p>
        </div>
      )}
    </div>
  );
};

export default Blogs;
