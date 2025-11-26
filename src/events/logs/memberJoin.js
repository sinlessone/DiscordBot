import { successEmbed } from '../../utils/embeds.js';

export default {
  name: 'guildMemberAdd',

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
        embeds: [successEmbed(`<@${member.id}> joined the server.`)],
      });
    }

    await member.roles.add(guild.autorole);
  },
};
