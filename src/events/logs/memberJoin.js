import constants from '../../utils/constants.js';
import { infoEmbed } from '../../utils/embeds.js';

export default {
  name: 'guildMemberAdd',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").GuildMember} member
   */
  async execute(client, member) {
    const channel = client.channels.cache.find(
      (val) => val.id == constants.MODLOGS_CHANNEL,
    );

    await channel.send({
      embeds: [infoEmbed(`<@${member.id}> joined the server.`)],
    });

    await member.roles.add(constants.COMMUNITY_ROLE);
  },
};
