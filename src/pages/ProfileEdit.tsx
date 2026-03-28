import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ProfileEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    program: "",
    year_of_study: 1,
    bio: "",
    profile_image: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            full_name: data.full_name || "",
            program: data.program || "",
            year_of_study: data.year_of_study || 1,
            bio: data.bio || "",
            profile_image: data.profile_image || "",
          });
        }
      });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update(form)
      .eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast.error("Failed to update profile.");
    } else {
      toast.success("Profile updated!");
      navigate(`/profile/${user.id}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Program / Faculty</label>
              <Input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} placeholder="e.g. Computer Science" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Year of Study</label>
              <Input type="number" min={1} max={6} value={form.year_of_study} onChange={(e) => setForm({ ...form, year_of_study: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Bio</label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell other students about yourself..." rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Profile Image URL</label>
              <Input value={form.profile_image} onChange={(e) => setForm({ ...form, profile_image: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEdit;
