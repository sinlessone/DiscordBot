/**
 * Parse a duration string (e.g., "10m", "2h") into milliseconds.
 * Supports seconds (s), minutes (m), hours (h), and days (d).
 * @param {string} duration - The duration string to parse.
 * @returns {number} - The duration in milliseconds, or null if invalid.
 */
export const parseDuration = (duration) => {
  const match = duration.match(/(\d+)([smhd])/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 1000 * 60;
    case 'h':
      return value * 1000 * 60 * 60;
    case 'd':
      return value * 1000 * 60 * 60 * 24;
    default:
      return 1000 * 60; // Default to 1 minute
  }
};
