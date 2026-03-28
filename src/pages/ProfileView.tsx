import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User, GraduationCap, BookOpen, Edit } from "lucide-react";

const ProfileView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isOwn = user?.id === id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", id!)
        .single();
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!profile) return <p className="text-center text-muted-foreground py-20">Profile not found.</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            {profile.profile_image ? (
              <img src={profile.profile_image} className="h-16 w-16 rounded-full object-cover" alt="" />
            ) : (
              <User className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">{profile.full_name || "Student"}</h1>
            <p className="text-sm text-muted-foreground">{profile.student_email}</p>
          </div>
          {isOwn && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/profile/edit"><Edit className="h-4 w-4 mr-1" /> Edit</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            {profile.program && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" /> {profile.program}
              </div>
            )}
            {profile.year_of_study && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" /> Year {profile.year_of_study}
              </div>
            )}
          </div>
          {profile.bio && <p className="text-sm text-foreground">{profile.bio}</p>}
          <div className="flex items-center gap-2">
            {profile.is_verified && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">✓ Verified Student</span>
            )}
            {profile.is_premium && (
              <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full">★ Premium</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileView;
