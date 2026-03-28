/**
 * @author Jayden Hunt
 * @Date 2026-03-28
 * 
 * Desc: Contains database functions for messaging service.
 */

import { supabase } from "./supabaseClient";

// Send a message
export const sendMessage = async ({ sender_id, recipient_id, message }) => {
  const { data, error } = await supabase
    .from("messages")
    .insert([{ sender_id, recipient_id, message }]);
  if (error) throw error;
  return data[0];
};

// Get messages between two users
export const getMessages = async (userA, userB) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${userA},recipient_id.eq.${userB}),and(sender_id.eq.${userB},recipient_id.eq.${userA})`)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
};