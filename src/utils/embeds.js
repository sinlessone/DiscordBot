import { EmbedBuilder } from 'discord.js';

export const successEmbed = (description) => {
  return new EmbedBuilder()
    .setDescription(description)
    .setColor(0x57f287);
};

export const infoEmbed = (description) => {
  return new EmbedBuilder()
    .setDescription(description)
    .setColor(0xfee75c);
};

export const errorEmbed = (description) => {
  return new EmbedBuilder()
    .setDescription(description)
    .setColor(0xed4245);
};
