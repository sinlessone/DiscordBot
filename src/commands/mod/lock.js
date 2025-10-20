import { PermissionFlagsBits } from 'discord.js';
import { successEmbed } from '../../utils/embeds.js';

/** Thank you oblongboot for this superb logic. */
export default {
  name: 'lock',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").Message} message
   */
  async execute(client, message) {
    if (
      !message.member.permissions.has(PermissionFlagsBits.ManageChannels)
    ) {
      return;
    }

    const channel = message.channel;

    try {
      const currentOverwrites = channel.permissionOverwrites.cache;
      let isLocked = true;

      for (const overwrite of currentOverwrites.values()) {
        if (
          overwrite.type === 'role' &&
          overwrite.deny.has(PermissionFlagsBits.SendMessages)
        ) {
          isLocked = true;
          break;
        } else {
          isLocked = false;
        }
      }

      for (const [id, role] of message.guild.roles.cache) {
        if (role.permissions.has(PermissionFlagsBits.Administrator)) continue;

        if (isLocked) {
          await channel.permissionOverwrites.edit(role, {
            SendMessages: null
          });
        } else {
          await channel.permissionOverwrites.edit(role, {
            SendMessages: false
          });
        }
      }

      await channel.send({
        embeds: [successEmbed(`**Channel ${isLocked ? 'unlocked' : 'locked'}!**`)],
      });
    } catch (err) {
      await message.reply({
        embeds: [errorEmbed("Something went wrong while toggling the lock.")],
      });
    }
  },
};