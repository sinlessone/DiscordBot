import { PermissionFlagsBits } from 'discord.js';
import { searchMember, searchRole } from '../../utils/search.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  name: 'role',

  async execute(client, message, userArg, ...roleArgs) {
    if (
      !message.member.permissions.has(PermissionFlagsBits.ManageRoles)
    ) {
      return;
    }

    if (!userArg) {
      return;
    }

    if (roleArgs.length === 0) {
      return;
    }

    const member = await searchMember(message.guild, userArg);

    if (!member) {
      return await message.reply({
        embeds: [errorEmbed('User not found.')],
      });
    }

    const roleName = roleArgs.join(' ');
    const role = await searchRole(message.guild, roleName);

    if (!role) {
      return await message.reply({
        embeds: [errorEmbed('Role not found.')],
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

    try {
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);

        return message.reply({
          embeds: [
            successEmbed(
              `Removed **${role.name}** from **${member.user.tag}**`,
            ),
          ],
        });
      } else {
        await member.roles.add(role);

        return message.reply({
          embeds: [
            successEmbed(
              `Added **${role.name}** to **${member.user.tag}**`,
            ),
          ],
        });
      }
    } catch (err) {
      return message.reply({
        embeds: [errorEmbed(`Failed to manage role: ${err.message}`)],
      });
    }
  },
};
