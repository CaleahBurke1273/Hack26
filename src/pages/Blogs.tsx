import { useState } from "react";
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
import { Plus, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const Blogs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [creating, setCreating] = useState(false);

  // ============================
  // FETCH BLOG POSTS
  // ============================
  const {
    data: posts = [],
    isLoading,
  } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("category", "blog")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch blog posts error:", error);
        toast.error("Failed to load blog posts.");
        return [];
      }

      return data || [];
    },
  });

  // ============================
  // CREATE BLOG POST
  // ============================
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to create a post.");
      return;
    }

    setCreating(true);

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        title: form.title,
        content: form.content,
        category: "blog",
      })
      .select();

    setCreating(false);

    if (error) {
      console.error("Create post error:", error);
      toast.error("Failed to create post.");
      return;
    }

    toast.success("Blog post created!");
    setOpen(false);
    setForm({ title: "", content: "" });

    // Refresh posts
    queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">School Blogs</h1>

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
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                required
              />

              <Textarea
                placeholder="Share your thoughts..."
                value={form.content}
                onChange={(e) =>
                  setForm({ ...form, content: e.target.value })
                }
                rows={6}
                required
              />

              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? "Posting..." : "Publish"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-20 text-muted-foreground">
          Loading posts...
        </div>
      )}

      {/* Posts */}
      {!isLoading && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-5 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {p.title}
                </h3>

                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {p.content}
                </p>

                <p className="text-xs text-muted-foreground">
                  {format(new Date(p.created_at), "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-20">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No blog posts yet. Share your first campus story!
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default Blogs;