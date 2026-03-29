import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, User, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [selectedConvo]);

  // ============================
  // FETCH CONVERSATIONS
  // ============================
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          "*, p1:profiles!conversations_participant_1_fkey(full_name, user_id), p2:profiles!conversations_participant_2_fkey(full_name, user_id)"
        )
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`)
        .order("last_message_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Failed to load conversations");
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  // ============================
  // FETCH MESSAGES
  // ============================
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedConvo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConvo!)
        .order("sent_at", { ascending: true });

      if (error) {
        console.error(error);
        toast.error("Failed to load messages");
        return [];
      }

      return data || [];
    },
    enabled: !!selectedConvo,
  });

  // ============================
  // REALTIME SUBSCRIPTION
  // ============================
  useEffect(() => {
    if (!selectedConvo) return;

    const channel = supabase
      .channel(`messages-${selectedConvo}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConvo}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", selectedConvo] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvo, queryClient]);

  // ============================
  // SEND MESSAGE
  // ============================
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedConvo) return;

    setSending(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConvo,
      sender_id: user.id,
      text: newMessage.trim(),
    });

    if (error) {
      console.error(error);
      toast.error("Failed to send message");
      setSending(false);
      return;
    }

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", selectedConvo);

    setNewMessage("");
    setSending(false);
  };

  // ============================
  // DELETE MESSAGE
  // ============================
  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (error) {
      console.error(error);
      toast.error("Failed to delete message");
      return;
    }

    toast.success("Message deleted");
    queryClient.invalidateQueries({ queryKey: ["messages", selectedConvo] });
  };

  const getOtherName = (convo: any) => {
    if (convo.p1?.user_id === user?.id) return convo.p2?.full_name || "Student";
    return convo.p1?.full_name || "Student";
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Messages</h1>

      <div className="grid md:grid-cols-3 gap-4" style={{ minHeight: "60vh" }}>
        {/* Conversation list */}
        <div className="space-y-2 md:border-r md:pr-4">
          {conversations.length > 0 ? (
            conversations.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedConvo(c.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedConvo === c.id ? "bg-primary/10" : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getOtherName(c)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(c.last_message_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-10">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Search for students and start chatting!
              </p>
            </div>
          )}
        </div>

        {/* Chat view */}
        <div className="md:col-span-2 flex flex-col">
          {selectedConvo ? (
            <>
              <div
                ref={chatRef}
                className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-[50vh]"
              >
                {messages.map((m: any) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.sender_id === user?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative max-w-[70%] px-3 py-2 rounded-xl text-sm ${
                        m.sender_id === user?.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p>{m.text}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          m.sender_id === user?.id
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {format(new Date(m.sent_at), "h:mm a")}
                      </p>

                      {/* Delete button */}
                      {m.sender_id === user?.id && (
                        <button
                          onClick={() => deleteMessage(m.id)}
                          className="absolute -right-6 top-1 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" size="icon" disabled={sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;