import { MessageFlags } from 'discord.js';
import { errorEmbed, successEmbed } from '../utils/embeds.js';

export default {
  name: "interactionCreate",

  async execute(client, interaction) {
    if (
      !interaction.isButton() ||
      !interaction.customId.startsWith('open_ticket')
    ) {
      return;
    }

    switch (interaction.customId) {
      case 'open_ticket': {
        await interaction.reply({
          embeds: [
            errorEmbed('Ticket creation is not implemented yet.'),
          ],
          flags: MessageFlags.Ephemeral,
        });
        break;
      }

      default:
        await interaction.deferUpdate();
        break;
    }
  },
};
