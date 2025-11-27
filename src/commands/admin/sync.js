import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { infoEmbed, successEmbed } from '../../utils/embeds.js';
import constants from '../../utils/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Syncs roles for all members')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const guildData =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};

    const communityRole = guildData.autorole
      ? interaction.guild.roles.cache.get(guildData.autorole)
      : null;

    const boosterRole = interaction.guild.roles.premiumSubscriberRole || null;
    const members = interaction.guild.members.cache;

    await interaction.reply({
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
        await member.roles.remove(rolesToRemove).catch(() => { });
      }

      const roleToAdd =
        highestRole ||
        ((onlyUpdate || member.roles.cache.has(boosterRole?.id))
          ? communityRole
          : null);

      if (roleToAdd && !member.roles.cache.has(roleToAdd.id)) {
        await member.roles.add(roleToAdd).catch(() => { });
      }
    }

    await interaction.editReply({
      embeds: [successEmbed(`Finished sync for all ${members.size} members!`)],
    });
  },
};