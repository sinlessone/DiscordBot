import { PermissionFlagsBits } from 'discord.js';
import { errorEmbed } from '../../utils/embeds.js';

export default {
  name: 'embeds',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").Message} message
   */
  async execute(client, message, type) {
    if (
      !message.member.permissions.has(
        PermissionFlagsBits.Administrator,
      )
    ) {
      return;
    }

    switch (type) {
      case 'rules':
        return message.channel.send({ embeds: [rulesEmbed(client)] });
      case 'rr':
        const msg = await message.channel.send({
          embeds: [rrEmbed(client)],
        });

        await msg.react('📦');
        return;
      default:
        return await message.channel.send({
          embeds: [errorEmbed('Unknown embed type.')],
        });
    }
  },
};

function rulesEmbed(client) {
  return client
    .embed()
    .setDescription(
      '**```Discord Server Rules```**\n' +
        '**1. Be Respectful** Treat everyone with respect. No harassment, discrimination, or hate speech.\n' +
        '**2. No Spamming** Avoid excessive messages, pings, or irrelevant content in chats.\n' +
        '**3. Appropriate Content** No NSFW content, illegal material, or anything that violates Discord Terms of Service.\n' +
        '**4. Use Channels Properly** Post content in the appropriate channels according to the topic.\n' +
        '**5. Follow Staff Instructions** Staff decisions are final. If you have concerns, contact them respectfully.\n\n' +
        "⚠️ You must follow Discord's [Guidelines](https://discord.com/guidelines) and [TOS](https://discord.com/terms).\n",
    )
    .setFooter({
      text: 'Thank you for keeping our community safe and enjoyable!',
    });
}

function rrEmbed(client) {
  return client
    .embed()
    .setDescription(
      '**```Reaction Roles```**\n' +
        '📦 **Updates**\nStay updated with future updates and dev-logs\n\n' +
        '*React to get the corresponding role!*',
    );
}
