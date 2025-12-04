import { mainEmbed } from '../../utils/embeds.js';

export default {
  name: 'ping',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").Message} message
   */
  async execute(client, message) {
    const embed = mainEmbed('Pong!');

    await message.reply({
      embeds: [embed],
      allowedMentions: { repliedUser: false },
    });
  },
};
