import constants from '../../utils/constants.js';
import { errorEmbed } from '../../utils/embeds.js';

export default {
  name: 'guildMemberRemove',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").GuildMember} member
   */
  async execute(client, member) {
    const channel = client.channels.cache.get(constants.MODLOGS_CHANNEL);

    if (channel) {
      await channel.send({
        embeds: [errorEmbed(`<@${member.id}> left the server.`)],
      });
    }
  },
};
