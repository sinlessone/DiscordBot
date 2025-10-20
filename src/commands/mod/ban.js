import { PermissionFlagsBits } from 'discord.js';
import { successEmbed } from '../../utils/embeds.js';
import { searchMember } from '../../utils/search.js';

export default {
  name: 'ban',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").Message} message
   */
  async execute(client, message, user) {
    if (
      !message.member.permissions.has(PermissionFlagsBits.BanMembers)
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

    await member.ban({ reason: `Banned by ${message.author.tag}` });

    await message.channel.send({
      embeds: [
        successEmbed(`**${member.user.tag} has been banned.**`),
      ],
    });
  },
};
