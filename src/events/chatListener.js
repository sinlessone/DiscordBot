export default {
  name: 'messageCreate',

  /**
   * @param {import("../client/bot.js").Bot} client
   * @param {import("discord.js").Message} message
   */
  async execute(client, message) {
    // Bad solution to filter channel.
    if (!message.channel.name.includes('ai-chat')) return;
    if (message.author.bot || !message.mentions.has(client.user)) {
      return;
    }

    const content = message.content.trim().toLowerCase();

    if (content === `<@!${client.user.id}>`) {
      return;
    }

    if (content.includes('dev reset')) {
      client.chatBot.reset();

      return await message.reply({
        content: 'Sir yes sir! 🫡',
        allowedMentions: { repliedUser: false },
      });
    }

    await message.channel.sendTyping();
    const res = await client.chatBot.generateResponse(
      content,
      message.author,
    );

    if (!res || res.length === 0) {
      return;
    }

    const msgs = res.split('|||');

    for (const msg of msgs) {
      if (msg == msgs[0]) {
        await message.reply({
          content: msg.trim(),
          allowedMentions: { repliedUser: false },
        });

        continue;
      }

      await message.channel.send(msg.trim());
    }
  },
};
