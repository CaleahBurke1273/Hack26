/**
 * @author Jayden Hunt
 * @Date 2026-03-28
 * 
 * Desc: Acts as the central connection between supabase, stores URL and API keys
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_ANON_KEY"; // use the anon key for frontend-safe access

export const supabase = createClient(supabaseUrl, supabaseKey);