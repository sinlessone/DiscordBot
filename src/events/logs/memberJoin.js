import constants from '../../utils/constants.js';
import { successEmbed } from '../../utils/embeds.js';

export default {
  name: 'guildMemberAdd',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").GuildMember} member
   */
  async execute(client, member) {
      const channel = client.channels.cache.get(constants.MODLOGS_CHANNEL);

    if (channel) {
      await channel.send({
        embeds: [successEmbed(`<@${member.id}> joined the server.`)],
      });
    }

    await member.roles.add(constants.COMMUNITY_ROLE);
  },
};
