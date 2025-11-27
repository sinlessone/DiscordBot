import { PermissionFlagsBits } from 'discord.js';
import { infoEmbed, successEmbed } from '../../utils/embeds.js';
import constants from '../../utils/constants.js';

export default {
  name: 'sync',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").Message} message
   */
  async execute(client, message) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return;
    }

    const guildData =
      (await client.db.get(`guild_${message.guild.id}`)) || {};

    const communityRole = guildData.autorole
      ? message.guild.roles.cache.get(guildData.autorole)
      : null;

    const boosterRole = message.guild.roles.premiumSubscriberRole || null;
    const members = message.guild.members.cache;

    const statusMessage = await message.reply({
      embeds: [infoEmbed(`Starting sync for ${members.size} members...`)],
    });

    for (const member of members.values()) {
      const hoistedRoles = member.roles.cache.filter((role) => role.hoist);

      const highestRole =
        hoistedRoles.size > 0
          ? hoistedRoles.reduce((highest, role) =>
              role.position > highest.position ? role : highest,
            )
          : null;

      const rolesToKeep = new Set();

      if (boosterRole) rolesToKeep.add(boosterRole.id);
      if (highestRole) rolesToKeep.add(highestRole.id);

      const onlyUpdate = member.roles.cache.size === 1;

      if (member.roles.cache.has(boosterRole?.id) && communityRole) {
        rolesToKeep.add(communityRole.id);
      }

      if (onlyUpdate && communityRole) {
        rolesToKeep.add(communityRole.id);
      }

      const rolesToRemove = member.roles.cache.filter(
        (role) => !rolesToKeep.has(role.id),
      );

      if (rolesToRemove.size > 0) {
        await member.roles.remove(rolesToRemove).catch(() => {});
      }

      const roleToAdd =
        highestRole ||
        ((onlyUpdate || member.roles.cache.has(boosterRole?.id))
          ? communityRole
          : null);

      if (roleToAdd && !member.roles.cache.has(roleToAdd.id)) {
        await member.roles.add(roleToAdd).catch(() => {});
      }
    }

    await statusMessage.edit({
      embeds: [successEmbed(`Finished sync for all ${members.size} members!`)],
    });
  },
};