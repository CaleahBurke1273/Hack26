/**
 * @author Jayden Hunt
 * @Date 2026-03-28
 * 
 * Desc: Contains database functions for account creation and verification service.
 */

import { supabase } from "./supabaseClient";

// Create a new user
export const createUser = async ({ id, username, email }) => {
  const { data, error } = await supabase
    .from("users")
    .insert([{ id, username, email, is_verified: false }]);
  if (error) throw error;
  return data[0];
};

// Mark user as verified
export const verifyUser = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .update({ is_verified: true })
    .eq("id", userId);
  if (error) throw error;
  return data[0];
};