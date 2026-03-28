import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { GraduationCap, Search, MessageSquare, ShoppingBag, BookOpen } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-primary tracking-tight">SU</span>
          <span className="text-xs font-medium text-muted-foreground mt-1">Laurier</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild><Link to="/login">Log In</Link></Button>
          <Button asChild><Link to="/signup">Sign Up</Link></Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <GraduationCap className="h-4 w-7" />
          For Wilfrid Laurier Students bby 
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-foreground leading-tight mb-6">
          Your Campus.<br />
          <span className="text-primary">Connected.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          SU is the student platform where Laurier students connect, share, sell, and discover everything happening on campus.
        </p>
        <div className="flex gap-3 justify-center">
          <Button size="lg" asChild><Link to="/signup">Get Started</Link></Button>
          <Button size="lg" variant="outline" asChild><Link to="/login">Log In</Link></Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Search, title: "Search & Discover", desc: "Find posts, listings, and students across campus." },
            { icon: MessageSquare, title: "Direct Messages", desc: "Chat with other verified Laurier students." },
            { icon: ShoppingBag, title: "Marketplace", desc: "Buy and sell textbooks, furniture, and more." },
            { icon: BookOpen, title: "Blogs & Academic", desc: "Share school tips, class advice, and campus stories." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card rounded-xl border p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 SU — Built for Wilfrid Laurier University students.</p>
      </footer>
    </div>
  );
};

export default Index;
