import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const Academic = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [creating, setCreating] = useState(false);

  const { data: posts } = useQuery({
    queryKey: ["academic-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("*, profiles!posts_user_id_fkey(full_name)")
        .eq("category", "academic")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      title: form.title,
      content: form.content,
      category: "academic" as any,
    });
    setCreating(false);
    if (error) { toast.error("Failed to create post."); return; }
    toast.success("Academic post created!");
    setOpen(false);
    setForm({ title: "", content: "" });
    queryClient.invalidateQueries({ queryKey: ["academic-posts"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Academic</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New Post</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Share Academic Content</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input placeholder="Title (e.g. Study tips for BU111)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Share class tips, study advice, resources..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} required />
              <Button type="submit" className="w-full" disabled={creating}>{creating ? "Posting..." : "Publish"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-5 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{p.title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{p.content}</p>
                <p className="text-xs text-muted-foreground">{p.profiles?.full_name} · {format(new Date(p.created_at), "MMM d, yyyy")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No academic posts yet. Share study tips or class advice!</p>
        </div>
      )}
    </div>
  );
};

export default Academic;
