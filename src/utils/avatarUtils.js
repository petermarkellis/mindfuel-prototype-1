/**
 * Utility functions for generating avatar images from Supabase storage
 */

import { supabase } from '../lib/supabase.js';

/**
 * Get the Supabase storage URL for an avatar
 * @param {string} filename - Avatar filename (e.g., 'Female_1.webp')
 * @returns {string} Full Supabase storage URL
 */
export function getSupabaseAvatarUrl(filename) {
  if (!filename) {
    return getSupabaseAvatarUrl('Male_1.webp'); // Default fallback
  }
  
  const { data } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(filename);
    
  return data.publicUrl;
}

/**
 * Get avatar URL for a user (uses their assigned avatar_url or generates one)
 * @param {Object} user - User object with avatar_url, gender, and id properties
 * @returns {string} Avatar image URL from Supabase storage
 */
export function getGenderAvatar(user) {
  if (!user) {
    return getSupabaseAvatarUrl('Male_1.webp');
  }

  // If user has a specific avatar_url assigned, use it
  if (user.avatar_url) {
    return getSupabaseAvatarUrl(user.avatar_url);
  }

  // Fallback: generate based on gender and ID if no avatar_url
  const gender = user.gender || 'Male';
  const userId = user.id || 1;
  
  // Use user ID to consistently assign avatar (9 available per gender)
  const avatarNumber = ((userId - 1) % 9) + 1; // Maps to 1-9
  const filename = `${gender}_${avatarNumber}.webp`;
  
  return getSupabaseAvatarUrl(filename);
}

/**
 * Get a random avatar for a specific gender (used for new users)
 * @param {string} gender - 'Male' or 'Female'
 * @returns {string} Avatar image URL from Supabase storage
 */
export function getRandomGenderAvatar(gender = 'Male') {
  const avatarNumber = Math.floor(Math.random() * 9) + 1; // Random 1-9
  const filename = `${gender}_${avatarNumber}.webp`;
  return getSupabaseAvatarUrl(filename);
}
