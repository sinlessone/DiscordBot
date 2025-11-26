/**
 * Search for a member in a guild by display name, user ID, username, or mention.
 * Returns the first match or null.
 * @param {import("discord.js").Guild} guild - The Discord guild (server) object.
 * @param {string} query - The search query string.
 * @returns {Promise<import("discord.js").GuildMember>} - The first matching member or null.
 */
export const searchMember = async (guild, query) => {
  const mentionRegex = /^<@!?(\d+)>$/;
  const mentionMatch = query.match(mentionRegex);
  const id = mentionMatch ? mentionMatch[1] : null;

  if (id || /^\d+$/.test(query)) {
    const userId = id || query;
    const cached = guild.members.cache.get(userId);
    if (cached) return cached;
    try {
      return await guild.members.fetch(userId);
    } catch {
      return null;
    }
  }

  const normalized = query.toLowerCase();

  const exact = guild.members.cache.find((member) => {
    const display = member.displayName.toLowerCase();
    const user = member.user.username.toLowerCase();
    const global = member.user.globalName?.toLowerCase();
    return (
      display === normalized ||
      user === normalized ||
      global === normalized
    );
  });
  if (exact) return exact;

  const partial = guild.members.cache.find((member) => {
    const display = member.displayName.toLowerCase();
    const user = member.user.username.toLowerCase();
    const global = member.user.globalName?.toLowerCase();
    return (
      display.includes(normalized) ||
      user.includes(normalized) ||
      (global && global.includes(normalized))
    );
  });

  return partial || null;
};

/**
 * Search for a role in a guild by name, ID, or mention.
 * Returns the first match or null.
 * @param {import("discord.js").Guild} guild - The Discord guild (server) object.
 * @param {string} query - The search query string.
 * @returns {Promise<import("discord.js").Role>} - The first matching role or null.
 */
export const searchRole = async (guild, query) => {
  const mentionRegex = /^<@&(\d+)>$/;
  const mentionMatch = query.match(mentionRegex);
  const roleIdFromMention = mentionMatch ? mentionMatch[1] : null;
  const normalized = query.toLowerCase();

  const roles = guild.roles.cache.size
    ? guild.roles.cache
    : await guild.roles.fetch();

  for (const role of roles.values()) {
    const name = role.name.toLowerCase();
    if (
      name === normalized ||
      name.includes(normalized) ||
      role.id === query ||
      role.id === roleIdFromMention
    ) {
      return role;
    }
  }

  return null;
};

/**
 * Search for a channel in a guild by name, ID, or mention.
 * Returns the first match or null.
 *
 * @param {import("discord.js").Guild} guild - The Discord guild object.
 * @param {string} query - The search query (name, ID, or mention).
 * @returns {Promise<import("discord.js").GuildChannel | null>}
 */
export const searchChannel = async (guild, query) => {
  if (!guild || !query) return null;

  const mentionRegex = /^<#(\d+)>$/;
  const mentionMatch = query.match(mentionRegex);
  const channelIdFromMention = mentionMatch ? mentionMatch[1] : null;

  const normalized = query.toLowerCase();

  const channels = guild.channels.cache.size
    ? guild.channels.cache
    : await guild.channels.fetch();

  for (const channel of channels.values()) {
    const name = channel.name.toLowerCase();

    if (
      name === normalized ||
      name.includes(normalized) ||
      channel.id === query ||
      channel.id === channelIdFromMention
    ) {
      return channel;
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
