import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Star, TrendingUp } from "lucide-react";

const Premium = () => {
  const features = [
    { icon: TrendingUp, title: "Boosted Listings", desc: "Get your marketplace posts seen by more students." },
    { icon: Star, title: "Featured Profile", desc: "Stand out with a highlighted profile badge." },
    { icon: Zap, title: "Better Visibility", desc: "Your posts appear higher in search results." },
    { icon: Crown, title: "Extra Customization", desc: "Unlock profile themes and custom bio sections." },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <div className="h-14 w-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
          <Crown className="h-7 w-7 text-secondary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">SU Premium</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Unlock premium features to boost your campus presence and get the most out of SU.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <Card key={title}>
            <CardContent className="p-5 space-y-2">
              <Icon className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-secondary/30 bg-secondary/5">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Premium features are being built. Stay tuned for updates!</p>
          <Button disabled className="opacity-60">Upgrade — Coming Soon</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Premium;
