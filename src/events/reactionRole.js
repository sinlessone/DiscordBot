import { Events } from 'discord.js';

export default {
  name: Events.InteractionCreate,

  async execute(client, interaction) {
    if (
      !interaction.isButton() ||
      !interaction.customId.startsWith('role_button:')
    ) {
      return;
    }
  },
};
