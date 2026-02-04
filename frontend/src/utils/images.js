/**
 * Utility for fetching destination images
 * Uses Lorem Picsum for reliable, high-quality images
 * Each destination gets a consistent image based on its name hash
 */

// Generate a consistent numeric seed from destination name
function getDestinationSeed(destination) {
  let hash = 0;
  for (let i = 0; i < destination.length; i++) {
    const char = destination.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 1000; // Return a number between 0-999
}

/**
 * Get a destination image URL from Lorem Picsum
 * Uses a seed based on destination name for consistent images
 * @param {string} destination - The destination name
 * @param {number} width - Image width (default: 800)
 * @param {number} height - Image height (default: 600)
 * @returns {string} Picsum image URL
 */
export function getDestinationImage(destination, width = 800, height = 600) {
  const seed = getDestinationSeed(destination);
  // Using Lorem Picsum with seed for consistent images per destination
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/**
 * Get a smaller thumbnail image for destination cards
 * @param {string} destination - The destination name
 * @returns {string} Picsum thumbnail URL
 */
export function getDestinationThumbnail(destination) {
  return getDestinationImage(destination, 400, 300);
}

/**
 * Get a larger hero image for destination details
 * @param {string} destination - The destination name
 * @returns {string} Picsum hero image URL
 */
export function getDestinationHeroImage(destination) {
  return getDestinationImage(destination, 1200, 800);
}

export default {
  getDestinationImage,
  getDestinationThumbnail,
  getDestinationHeroImage,
};
