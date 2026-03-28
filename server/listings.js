/**
 * @author Jayden Hunt
 * @Date 2026-03-28
 * 
 * Desc: Contains database functions for creating/deleting/editing marketplace listings.
 */

import { createClient } from '@supabase/supabase-js'

// Creates a new listing
export async function createListing(listing) {
  const { data, error } = await supabase
    .from("marketplace_listings")
    .insert([listing])
    .select();

  if (error) throw error;
  return data;
}

// call to createlisting function
await createListing({
  seller_id: user.id,
  title: "Textbook - Calculus",
  description: "Used for one semester",
  price: 40,
  category: "Books",
  image_url: "https://..."
});

// Retrieve current listings
export async function getListings() {
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Update an exisiting listing
export async function updateListing(id, updates) {
  const { data, error } = await supabase
    .from("marketplace_listings")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}

// Delete a listing
export async function deleteListing(id) {
  const { error } = await supabase
    .from("marketplace_listings")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
