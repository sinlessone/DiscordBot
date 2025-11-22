import { PermissionFlagsBits } from 'discord.js';
import { searchMember } from '../../utils/search.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  name: 'unmute',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").Message} message
   */
  async execute(client, message, user) {
    if (
      !message.member.permissions.has(PermissionFlagsBits.MuteMembers)
    ) {
      return;
    }

    if (!user) {
      return await message.reply({
        embeds: [errorEmbed("Please provide a user.")],
      });
    }

    const member = await searchMember(message.guild, user);

    if (!member) {
      return await message.reply({
        embeds: [errorEmbed("User not found.")],
      });
    }

    if (member.communicationDisabledUntilTimestamp < Date.now()) {
      return await message.channel.send({
        embeds: [errorEmbed(`**${member.user.tag} is not muted.**`)],
      });
    }

    await member.timeout(null);

    await message.channel.send({
      embeds: [
        successEmbed(`**${member.user.tag} has been unmuted.**`),
      ],
    });
  },
};
