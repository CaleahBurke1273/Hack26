/**
 * @author Jayden Hunt
 * @Date 2026-03-28
 * 
 * Desc: Testing function for supabase client connection.
 */

import { supabase } from "./supabaseClient.js";

const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Supabase connection failed:", error.message);
    } else {
      console.log("Supabase connection working! Data:", data);
    }
  } catch (err) {
    console.error("Unexpected error:", err.message);
  }
};

testConnection();