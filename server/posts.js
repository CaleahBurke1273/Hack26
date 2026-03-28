/**
 * @author Jayden Hunt
 * @Date 2026-03-28
 * 
 * Desc: Contains database functions for posting service.
 */

import { supabase } from "./supabaseClient.js";

// Create a post
export const createPost = async ({ user_id, subreddit, title, content }) => {
  const { data, error } = await supabase
    .from("posts")
    .insert([{ user_id, subreddit, title, content }]);
  if (error) throw error;
  return data[0];
};

// Get posts by subreddit
export const getPostsBySubreddit = async (subreddit) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("subreddit", subreddit)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// Edit a post
export const editPost = async (postId, userId, newTitle, newContent) => {
  const { data, error } = await supabase
    .from("posts")
    .update({ title: newTitle, content: newContent })
    .eq("id", postId)
    .eq("user_id", userId); // only allow owner to edit
  if (error) throw error;
  return data[0];
};

// Delete a post
export const deletePost = async (postId, userId) => {
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", userId); // only allow owner to delete
  if (error) throw error;
  return data[0];
};