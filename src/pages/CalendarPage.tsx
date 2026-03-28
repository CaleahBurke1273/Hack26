import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const CalendarPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", event_date: "", event_time: "" });
  const [creating, setCreating] = useState(false);

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*, profiles!events_created_by_fkey(full_name)")
        .order("event_date", { ascending: true });
      return data || [];
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    const { error } = await supabase.from("events").insert({
      created_by: user.id,
      title: form.title,
      description: form.description,
      event_date: form.event_date,
      event_time: form.event_time || null,
    });
    setCreating(false);
    if (error) { toast.error("Failed to create event."); return; }
    toast.success("Event created!");
    setOpen(false);
    setForm({ title: "", description: "", event_date: "", event_time: "" });
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
              <Input type="time" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} />
              <Button type="submit" className="w-full" disabled={creating}>{creating ? "Creating..." : "Create Event"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {events && events.length > 0 ? (
        <div className="space-y-3">
          {events.map((ev: any) => (
            <Card key={ev.id}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{format(new Date(ev.event_date), "MMM")}</span>
                  <span className="text-lg font-bold text-primary leading-none">{format(new Date(ev.event_date), "d")}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{ev.title}</h3>
                  {ev.event_time && <p className="text-xs text-muted-foreground">{ev.event_time}</p>}
                  {ev.description && <p className="text-sm text-muted-foreground mt-1">{ev.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">by {ev.profiles?.full_name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No events yet. Add the first one!</p>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
