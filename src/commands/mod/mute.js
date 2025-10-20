import { PermissionFlagsBits } from "discord.js";
import { parseDuration, searchMember } from "../../utils/search.js";
import { successEmbed } from "../../utils/embeds.js";

export default {
  name: 'mute',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").Message} message
   */
  async execute(client, message, user, duration) {
    if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
      return;
    }

    if (!user || !duration) {
      return;
    }

    const member = await searchMember(message.guild, user);
    const muteDuration = parseDuration(duration);

    if (!member) {
      return;
    }

    await member.timeout(muteDuration, `Muted by ${message.author.tag} for ${duration}`);

    await message.channel.send({
      embeds: [successEmbed(`**${member.user.tag} has been muted.**`)],
    });
  },
};
