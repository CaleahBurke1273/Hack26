/**
 * @author Jayden Hunt
 * @Date 2026-03-28
 * 
 * Desc: Acts as the central connection between supabase, stores URL and API keys
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nidbkvaquyujxcpmfaqi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZGJrdmFxdXl1anhjcG1mYXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjAzMDQsImV4cCI6MjA5MDI5NjMwNH0.0lyAE2sz0bQB13Qzing-wpcCiba3yaa0EkX33EU45pg"; // use the anon key for frontend-safe access

export const supabase = createClient(supabaseUrl, supabaseKey);