import { PermissionFlagsBits } from 'discord.js';
import { searchRole } from '../../utils/search.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  name: 'autorole',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").Message} message
   */
  async execute(client, message, role) {
    if (
      !message.member.permissions.has(
        PermissionFlagsBits.ManageRoles,
      ) ||
      !role
    ) {
      return;
    }

    const selectedRole = await searchRole(message.guild, role);

    if (!selectedRole) {
      return await message.reply({
        embeds: [errorEmbed('Cannot find role.')],
      });
    }

    if (
      message.guild.members.me.roles.highest.position <=
      selectedRole.position
    ) {
      return message.reply({
        embeds: [
          errorEmbed(
            'I have insufficient permissions, as I cannot give this role to a new member.',
          ),
        ],
      });
    }

    if (
      message.member.roles.highest.position <= role.position &&
      message.author.id !== message.guild.ownerId
    ) {
      return message.reply({
        embeds: [
          errorEmbed(
            'Insufficient permissions, you cannot manage a role higher or equal to your highest role.',
          ),
        ],
      });
    }

    const guild =
      (await client.db.get(`guild_${message.guildId}`)) || {};

    await client.db.set(`guild_${message.guildId}`, {
      ...guild,
      autorole: selectedRole.id,
    });

    await message.reply({
      embeds: [successEmbed(`Role set to **${selectedRole.name}**`)],
      allowedMentions: { repliedUser: false },
    });
  },
};
