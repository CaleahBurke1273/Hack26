import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const Verify = () => (
  <div className="min-h-screen flex items-center justify-center px-4 bg-background">
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <MailCheck className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-xl">Check your email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          We've sent a verification link to your @mylaurier.ca email. Click the link to verify your account and get started.
        </p>
        <Button variant="outline" asChild>
          <Link to="/login">Back to Login</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default Verify;
