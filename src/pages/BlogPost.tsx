import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

import type { Database } from "@/integrations/supabase/types";

type BlogPost = Database["public"]["Tables"]["posts"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type CommentRow = Database["public"]["Tables"]["comments"]["Row"];

type Comment = CommentRow & {
  user: Profile | null;
};

const BlogPostPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState("");

  const { data: post } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
  });

  const { data: author } = useQuery({
    queryKey: ["post-author", post?.user_id],
    enabled: !!post,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", post!.user_id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data: rawComments, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const userIds = rawComments.map((c) => c.user_id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      return rawComments.map((c) => ({
        ...c,
        user: profiles?.find((p) => p.user_id === c.user_id) || null,
      })) as Comment[];
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase.from("comments").insert({
        post_id: id,
        user_id: user.id,
        content: commentText,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      toast.success("Comment added!");
    },
  });

  if (!post) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <Card>
        <CardContent className="p-6 space-y-3">
          <h1 className="text-3xl font-bold">{post.title}</h1>

          <p className="text-muted-foreground">
            Posted by {author?.full_name || "Unknown"} on{" "}
            {format(new Date(post.created_at), "MMM d, yyyy")}
          </p>

          <p className="whitespace-pre-wrap">{post.content}</p>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold">Comments</h2>

      <div className="space-y-4">
        {comments.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4 space-y-1">
              <p className="font-semibold">{c.user?.full_name || "Unknown"}</p>
              <p className="text-sm whitespace-pre-wrap">{c.content}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(c.created_at), "MMM d, yyyy h:mm a")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {user && (
        <div className="space-y-3">
          <Textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />

          <Button onClick={() => addComment.mutate()} disabled={!commentText}>
            Post Comment
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogPostPage;