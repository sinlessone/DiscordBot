import { PermissionFlagsBits } from 'discord.js';
import { successEmbed } from '../../utils/embeds.js';

/** Thank you oblongboot and WaterPhoenix196 for their contributions. */
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
      const isLocked = channel.permissionOverwrites.cache
        .get(everyoneRole.id)
        ?.deny.has(PermissionFlagsBits.SendMessages);

      await channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: isLocked ? null : false,
      });

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