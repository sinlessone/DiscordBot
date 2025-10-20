/**
 * Search for a member in a guild by display name, user ID, username, or mention.
 * Returns the first match or null.
 * @param {Guild} guild - The Discord guild (server) object.
 * @param {string} query - The search query string.
 * @returns {Promise<GuildMember>} - The first matching member or null.
 */
export const searchMember = async (guild, query) => {
  const mentionRegex = /^<@!?(\d+)>$/;
  const mentionMatch = query.match(mentionRegex);
  const userIdFromMention = mentionMatch ? mentionMatch[1] : null;
  const members = await guild.members.fetch();
  const normalizedQuery = query.toLowerCase();

  for (const member of members.values()) {
    const displayName = member.displayName.toLowerCase();
    const username = member.user.username.toLowerCase();
    const userId = member.user.id;

    const isMatch =
      displayName.includes(normalizedQuery) ||
      username.includes(normalizedQuery) ||
      userId === query ||
      userId === userIdFromMention;

    if (isMatch) {
      return member;
    }
  }

  return null;
}

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
}