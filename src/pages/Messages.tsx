import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, User } from "lucide-react";
import { format } from "date-fns";

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null); // user we are chatting with
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to latest message
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Fetch all other users
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", user?.id);
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch conversations
  const { data: conversations } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`)
        .order("last_message_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch messages for selected conversation
  const { data: messages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("sent_at", { ascending: true });
      return data || [];
    },
    enabled: !!conversationId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        () => queryClient.invalidateQueries({ queryKey: ["messages", conversationId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  // Scroll when messages update
  useEffect(scrollToBottom, [messages]);

  // Open or create a conversation with selected user
  const openConversation = async (u: any) => {
    setSelectedUser(u);
    const convo = conversations?.find(
      (c: any) =>
        (c.participant_1 === user!.id && c.participant_2 === u.user_id) ||
        (c.participant_2 === user!.id && c.participant_1 === u.user_id)
    );
    if (convo) {
      setConversationId(convo.id);
    } else {
      // Create new conversation
      const { data: newConvo } = await supabase
        .from("conversations")
        .insert({
          participant_1: user!.id,
          participant_2: u.user_id,
          last_message_at: new Date().toISOString(),
        })
        .select("*")
        .single();
      setConversationId(newConvo.id);
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
    }
  };

  // Send a message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;
    setSending(true);
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user!.id,
      text: newMessage.trim(),
      sent_at: new Date().toISOString(),
    });
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);
    setNewMessage("");
    setSending(false);
  };

  return (
    <div className="space-y-4 h-[80vh]">
      <h1 className="text-2xl font-bold text-foreground">Messages</h1>
      <div className="grid md:grid-cols-3 gap-4 h-full">
        {/* Left panel: user list */}
        <div className="space-y-2 md:border-r md:pr-4 overflow-y-auto">
          {users && users.length > 0 ? (
            users
              .sort((a, b) => {
                const convoA = conversations?.find(
                  (c: any) => c.participant_1 === a.user_id || c.participant_2 === a.user_id
                );
                const convoB = conversations?.find(
                  (c: any) => c.participant_1 === b.user_id || c.participant_2 === b.user_id
                );
                const dateA = convoA?.last_message_at ? new Date(convoA.last_message_at).getTime() : 0;
                const dateB = convoB?.last_message_at ? new Date(convoB.last_message_at).getTime() : 0;
                return dateB - dateA;
              })
              .map((u: any) => (
                <button
                  key={u.user_id}
                  onClick={() => openConversation(u)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedUser?.user_id === u.user_id ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{u.full_name}</p>
                      {(() => {
                        const convo = conversations?.find(
                          (c: any) => c.participant_1 === u.user_id || c.participant_2 === u.user_id
                        );
                        return convo?.last_message_at ? (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(convo.last_message_at), "MMM d, h:mm a")}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </button>
              ))
          ) : (
            <div className="text-center py-10">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No users found.</p>
            </div>
          )}
        </div>

        {/* Right panel: chat */}
        <div className="md:col-span-2 flex flex-col h-full">
          {conversationId ? (
            <>
              <div className="flex-1 overflow-y-auto space-y-2 p-2">
                {messages?.map((m: any) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_id === user!.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${
                        m.sender_id === user!.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p>{m.text}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          m.sender_id === user!.id ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {format(new Date(m.sent_at), "h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat input at bottom */}
              <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t bg-background mt-auto">
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
              Select a user to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;