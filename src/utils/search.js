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

  if (userIdFromMention || /^\d+$/.test(query)) {
    try {
      const id = userIdFromMention || query;
      return await guild.members.fetch(id);
    } catch (err) {
    }
  }

  const members = await guild.members.fetch();
  const normalizedQuery = query.toLowerCase();
  const exactMatch = members.find((member) => {
    const displayName = member.displayName.toLowerCase();
    const username = member.user.username.toLowerCase();
    const globalName = member.user.globalName?.toLowerCase();

    return (
      displayName === normalizedQuery ||
      username === normalizedQuery ||
      globalName === normalizedQuery
    );
  });

  if (exactMatch) return exactMatch;

  const partialMatch = members.find((member) => {
    const displayName = member.displayName.toLowerCase();
    const username = member.user.username.toLowerCase();
    const globalName = member.user.globalName?.toLowerCase();

    return (
      displayName.includes(normalizedQuery) ||
      username.includes(normalizedQuery) ||
      (globalName && globalName.includes(normalizedQuery))
    );
  });

  return partialMatch || null;
};

/**
 * Search for a role in a guild by name, ID, or mention.
 * Returns the first match or null.
 * @param {Guild} guild - The Discord guild (server) object.
 * @param {string} query - The search query string.
 * @returns {Promise<Role>} - The first matching role or null.
 */
export const searchRole = async (guild, query) => {
  const mentionRegex = /^<@&(\d+)>$/;
  const mentionMatch = query.match(mentionRegex);
  const roleIdFromMention = mentionMatch ? mentionMatch[1] : null;
  const roles = await guild.roles.fetch();
  const normalizedQuery = query.toLowerCase();

  for (const role of roles.values()) {
    const name = role.name.toLowerCase();
    const roleId = role.id;

    const isMatch =
      name === normalizedQuery ||
      name.includes(normalizedQuery) ||
      roleId === query ||
      roleId === roleIdFromMention;

    if (isMatch) {
      return role;
    }
  }

  return null;
};

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
