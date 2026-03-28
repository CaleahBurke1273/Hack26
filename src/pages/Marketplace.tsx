import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const Marketplace = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "", category: "other", image_url: "" });
  const [creating, setCreating] = useState(false);

  const { data: listings } = useQuery({
    queryKey: ["marketplace"],
    queryFn: async () => {
      const { data } = await supabase
        .from("marketplace_listings")
        .select("*, profiles!marketplace_listings_seller_id_fkey(full_name)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    const { error } = await supabase.from("marketplace_listings").insert({
      seller_id: user.id,
      title: form.title,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      image_url: form.image_url || null,
    });
    setCreating(false);
    if (error) { toast.error("Failed to create listing."); return; }
    toast.success("Listing created!");
    setOpen(false);
    setForm({ title: "", description: "", price: "", category: "other", image_url: "" });
    queryClient.invalidateQueries({ queryKey: ["marketplace"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New Listing</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Listing</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              <Input type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              <Input placeholder="Category (e.g. textbooks, furniture)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <Input placeholder="Image URL (optional)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              <Button type="submit" className="w-full" disabled={creating}>{creating ? "Creating..." : "Create Listing"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {listings && listings.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l: any) => (
            <Card key={l.id} className="overflow-hidden">
              {l.image_url && <img src={l.image_url} className="w-full h-40 object-cover" alt={l.title} />}
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground">{l.title}</h3>
                  <span className="text-primary font-bold">${Number(l.price).toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{l.description}</p>
                <p className="text-xs text-muted-foreground">{l.profiles?.full_name} · {format(new Date(l.created_at), "MMM d")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No listings yet. Be the first to sell something!</p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
