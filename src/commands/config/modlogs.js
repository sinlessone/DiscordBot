import { PermissionFlagsBits } from 'discord.js';
import { searchChannel } from '../../utils/search.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  name: 'modlogs',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").Message} message
   */
  async execute(client, message, channel) {
    if (
      !message.member.permissions.has(
        PermissionFlagsBits.ManageChannels,
      ) ||
      !channel
    ) {
      return;
    }

    const selectedChannel = await searchChannel(
      message.guild,
      channel,
    );

    if (!selectedChannel) {
      return await message.reply({
        embeds: [errorEmbed('Cannot find channel.')],
      });
    }

    const guild =
      (await client.db.get(`guild_${message.guildId}`)) || {};

    await client.db.set(`guild_${message.guildId}`, {
      ...guild,
      modlogs_channel: selectedChannel.id,
    });

    await message.reply({
      embeds: [
        successEmbed(`Channel set to **${selectedChannel.name}**`),
      ],
      allowedMentions: { repliedUser: false },
    });
  },
};
