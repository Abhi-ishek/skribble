const AVATAR_COLORS = [
  "#ff4757", // Red
  "#2ed573", // Green
  "#1e90ff", // Blue
  "#eccc68", // Yellow
  "#ffa502", // Orange
  "#a29bfe", // Purple
  "#747d8c", // Gray
  "#00d2ff", // Cyan
];

/**
 * Formats a score with commas for readability.
 * @param {number} score 
 * @returns {string}
 */
export const formatScore = (score) => {
  return score.toLocaleString();
};

/**
 * Returns a deterministic color based on the input name.
 * @param {string} name 
 * @returns {string}
 */
export const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  
  const charCodeSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_COLORS[charCodeSum % AVATAR_COLORS.length];
};

/**
 * Truncates a string if it exceeds the maximum length.
 * @param {string} name 
 * @param {number} max 
 * @returns {string}
 */
export const truncateName = (name, max = 15) => {
  if (!name) return "";
  return name.length > max ? `${name.slice(0, max)}…` : name;
};
