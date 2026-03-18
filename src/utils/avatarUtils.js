/**
 * Utility functions for generating avatar images
 * 
 * Avatars are stored as static assets in the /public/avatars folder
 * Format: Gender_Number.webp (e.g., Male_1.webp, Female_5.webp)
 */

/**
 * Get the public URL for an avatar
 * @param {string} filename - Avatar filename (e.g., 'Female_1.webp')
 * @returns {string} Public URL to the avatar image
 */
export function getAvatarUrl(filename) {
  if (!filename) {
    return getAvatarUrl('Male_1.webp'); // Default fallback
  }

  // Avatars are stored in /public/avatars/
  return `/avatars/${filename}`;
}

/**
 * Get avatar URL for a user (uses their assigned avatar_url or generates one)
 * @param {Object} user - User object with avatar_url, gender, and id properties
 * @returns {string} Avatar image URL
 */
export function getGenderAvatar(user) {
  if (!user) {
    return getAvatarUrl('Male_1.webp');
  }

  // If user has a specific avatar_url assigned, use it
  if (user.avatar_url) {
    return getAvatarUrl(user.avatar_url);
  }

  // Fallback: generate based on gender and ID if no avatar_url
  const gender = user.gender || 'Male';
  const userId = user.id || 1;

  // Use user ID to consistently assign avatar (9 available per gender)
  const avatarNumber = ((userId - 1) % 9) + 1; // Maps to 1-9
  const filename = `${gender}_${avatarNumber}.webp`;

  return getAvatarUrl(filename);
}

/**
 * Get a random avatar for a specific gender (used for new users)
 * @param {string} gender - 'Male' or 'Female'
 * @returns {string} Avatar image URL
 */
export function getRandomGenderAvatar(gender = 'Male') {
  const avatarNumber = Math.floor(Math.random() * 9) + 1; // Random 1-9
  const filename = `${gender}_${avatarNumber}.webp`;
  return getAvatarUrl(filename);
}
