import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ShoppingBag, BookOpen, GraduationCap, CalendarDays, MessageSquare, Search } from "lucide-react";
import { format } from "date-fns";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: recentPosts } = useQuery({
    queryKey: ["recent-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("*, profiles!posts_user_id_fkey(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const quickLinks = [
    { to: "/search", label: "Search", icon: Search, color: "bg-primary/10 text-primary" },
    { to: "/messages", label: "Messages", icon: MessageSquare, color: "bg-secondary/20 text-secondary-foreground" },
    { to: "/marketplace", label: "Marketplace", icon: ShoppingBag, color: "bg-primary/10 text-primary" },
    { to: "/blogs", label: "Blogs", icon: BookOpen, color: "bg-secondary/20 text-secondary-foreground" },
    { to: "/academic", label: "Academic", icon: GraduationCap, color: "bg-primary/10 text-primary" },
    { to: "/calendar", label: "Calendar", icon: CalendarDays, color: "bg-secondary/20 text-secondary-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Hey{profile?.full_name ? `, ${profile.full_name}` : ""}! 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome to SU — here's what's happening on campus.</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {quickLinks.map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-foreground">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPosts && recentPosts.length > 0 ? (
            <div className="space-y-3">
              {recentPosts.map((post: any) => (
                <div key={post.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {post.profiles?.full_name || "Anonymous"} · {format(new Date(post.created_at), "MMM d")}
                    </p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap capitalize">
                    {post.category}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No posts yet. Be the first to share something!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
