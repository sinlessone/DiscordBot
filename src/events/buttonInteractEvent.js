import { Events, MessageFlags } from 'discord.js';
import { errorEmbed, successEmbed } from '../utils/embeds.js';

export default {
  name: Events.InteractionCreate,
  
  async execute(client, interaction) {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    if (!customId.startsWith('role_button:')) return;

    const roleId = customId.split(':')[1];
    const role = interaction.guild.roles.cache.get(roleId);

    if (!role) {
      return interaction.reply({
        embeds: [
          errorEmbed(
            'Role not found?? Please ping any <@&1351294598479347732> in general so they can fix this!',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const member = interaction.member;

    if (
      role.position >=
      interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        embeds: [
          errorEmbed(
            'Somehow I cannot assign that role, please ping any <@&1351294598479347732> in general so they can fix this!',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
        await interaction.reply({
          embeds: [errorEmbed(`Removed role **${role.name}**`)],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await member.roles.add(roleId);
        await interaction.reply({
          embeds: [successEmbed(`Added role **${role.name}**`)],
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        embeds: [
          errorEmbed(
            'Failed to update roles, please ping a <@&1351294598479347732> in general so they can fix this! (error: ' +
              error.message +
              ')',
          ),
        ],
        eflags: MessageFlags.Ephemeral,
      });
    }
  },
};
