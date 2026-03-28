/**
 * @author Jayden Hunt
 * @Date 2026-03-28
 * 
 * Desc: Contains database functions for posting service.
 */

import { supabase } from "./supabaseClient";

// Get all posts for a subreddit
export const getPostsBySubreddit = async (subreddit) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("subreddit", subreddit);
  if (error) throw error;
  return data;
};

// Create a new post
export const createPost = async ({ user_id, subreddit, title, content }) => {
  const { data, error } = await supabase
    .from("posts")
    .insert([{ user_id, subreddit, title, content }]);
  if (error) throw error;
  return data[0];
};