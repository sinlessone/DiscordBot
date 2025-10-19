import { errorEmbed } from '../utils/embeds.js';

export default {
  name: 'messageCreate',

  /**
   * @param {import("../client/bot.js").Bot} client
   * @param {import("discord.js").Message} message
   */
  async execute(client, message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content
      .slice(client.prefix.length)
      .trim()
      .split(/ +/);

    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) {
      return;
    }

    try {
      await command.execute(client, message, args);
    } catch (error) {
      client.logger.error(
        `Error executing command ${commandName}: ${error.message}`,
      );

      await message.reply({
        embeds: [
          errorEmbed('There was an error executing that command.'),
        ],
      });
    }
  },
};
