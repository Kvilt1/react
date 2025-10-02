/**
 * Color assignment system for message senders
 * - Account owner (Me) is always red
 * - Other users get consistent colors based on username + context (individual/group)
 * - Colors are generated dynamically using HSL color space for harmony
 * - Uses golden angle (137.5°) for optimal color distribution
 * 
 * Benefits of this approach:
 * - Infinite palette: Can generate unique colors for unlimited users
 * - Harmonious: All colors share the same saturation/lightness for visual consistency
 * - Well-distributed: Golden angle ensures maximum separation between colors
 * - Deterministic: Same user+context always produces the same color
 * - Accessible: 65% saturation and 55% lightness provide good contrast
 */

// Red is always for "Me"
const ME_COLOR = '#ff4757';

// Golden angle in degrees for optimal color distribution
const GOLDEN_ANGLE = 137.508;

// Color generation parameters for harmonious palette
const COLOR_CONFIG = {
  saturation: 65, // 65% saturation for vibrant but not overwhelming colors
  lightness: 55,  // 55% lightness for good contrast on dark backgrounds
  minHue: 20,     // Start after red range
  maxHue: 340,    // End before red range (0-20 reserved for "Me")
};

/**
 * Generate a consistent hash for a string
 * Uses a simple hash function to ensure the same string always gets the same hash
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Convert HSL to Hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  const hue = h / 360;
  const sat = s / 100;
  const light = l / 100;

  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (sat === 0) {
    r = g = b = light;
  } else {
    const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
    const p = 2 * light - q;
    r = hueToRgb(p, q, hue + 1 / 3);
    g = hueToRgb(p, q, hue);
    b = hueToRgb(p, q, hue - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generate a harmonious color using golden angle distribution
 * @param index - The index to generate color for (derived from hash)
 * @returns Hex color string
 */
function generateHarmoniousColor(index: number): string {
  // Use golden angle to distribute hues evenly across the spectrum
  // This creates visually pleasing, well-separated colors
  const hueRange = COLOR_CONFIG.maxHue - COLOR_CONFIG.minHue;
  const hue = ((index * GOLDEN_ANGLE) % hueRange) + COLOR_CONFIG.minHue;

  return hslToHex(hue, COLOR_CONFIG.saturation, COLOR_CONFIG.lightness);
}

/**
 * Get color for a user in a specific conversation context
 * @param username - The username to get color for
 * @param accountUsername - The account owner's username (always gets red)
 * @param conversationId - The conversation ID for context (group vs individual)
 * @returns Hex color string
 */
export function getUserColor(
  username: string,
  accountUsername: string | null,
  conversationId: string
): string {
  // Account owner always gets red
  if (username === accountUsername) {
    return ME_COLOR;
  }

  // Generate a consistent color based on username + conversation context
  // This ensures the same user has the same color in the same conversation
  const contextString = `${username}-${conversationId}`;
  const hash = hashString(contextString);
  
  // Use hash as index for color generation
  // This creates a large virtual palette with consistent assignment
  return generateHarmoniousColor(hash);
}

/**
 * Get a lighter version of a color for backgrounds/highlights
 */
export function getLighterColor(color: string, amount: number = 0.3): string {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Lighten by mixing with white
  const newR = Math.round(r + (255 - r) * amount);
  const newG = Math.round(g + (255 - g) * amount);
  const newB = Math.round(b + (255 - b) * amount);

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

