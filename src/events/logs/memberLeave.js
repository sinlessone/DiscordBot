import { errorEmbed } from '../../utils/embeds.js';

export default {
  name: 'guildMemberRemove',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").GuildMember} member
   */
  async execute(client, member) {
    const guild =
      (await client.db.get(`guild_${member.guild.id}`)) || {};
    const channel = client.channels.cache.get(guild.modlogs_channel);

    if (channel) {
      await channel.send({
        embeds: [errorEmbed(`<@${member.id}> left the server.`)],
      });
    }
  },
};
