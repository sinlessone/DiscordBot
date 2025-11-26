import { PermissionFlagsBits } from 'discord.js';
import { infoEmbed, successEmbed } from '../../utils/embeds.js';
import constants from '../../utils/constants.js';

export default {
  name: 'sync',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").Message} message
   */
  async execute(client, message, ...exceptions) {
    if (
      !message.member.permissions.has(
        PermissionFlagsBits.Administrator,
      )
    ) {
      return;
    }

    const guild =
      (await client.db.get(`guild_${member.guild.id}`)) || {};
      
    const communityRole = message.guild.roles.cache.get(
      guild.autorole,
    );

    const boosterRole = message.guild.roles.premiumSubscriberRole;
    const members = message.guild.members.cache;

    const statusMessage = await message.reply({
      embeds: [
        infoEmbed(`Starting sync for ${members.size} members...`),
      ],
    });

    let processed = 0;

    for (const member of members.values()) {
      const hoistedRoles = member.roles.cache.filter(
        (role) => role.hoist,
      );

      let highestRole =
        hoistedRoles.size > 0
          ? hoistedRoles.reduce((highest, role) =>
              role.position > highest.position ? role : highest,
            )
          : null;

      const rolesToKeep = new Set([...exceptions]);
      if (highestRole) rolesToKeep.add(highestRole.id);

      if (member.roles.cache.has(boosterRole?.id))
        rolesToKeep.add(communityRole.id);

      const onlyUpdate =
        member.roles.cache.size === 1 &&
        member.roles.cache.has(updateRole?.id);
      if (onlyUpdate) rolesToKeep.add(communityRole.id);

      const rolesToRemove = member.roles.cache.filter(
        (role) => !rolesToKeep.has(role.id),
      );
      if (rolesToRemove.size > 0)
        await member.roles.remove(rolesToRemove);

      const roleToAdd =
        highestRole ||
        (onlyUpdate || member.roles.cache.has(boosterRole?.id)
          ? communityRole
          : null);
      if (roleToAdd && !member.roles.cache.has(roleToAdd.id)) {
        await member.roles.add(roleToAdd);
      }

      processed++;
      if (processed % 10 === 0 || processed === members.size) {
        await statusMessage.edit({
          embeds: [
            infoEmbed(
              `Processed ${processed} / ${members.size} members...`,
            ),
          ],
        });
      }
    }

    await statusMessage.edit({
      embeds: [
        successEmbed(
          `Finished sync for all ${members.size} members!`,
        ),
      ],
    });
  },
};
