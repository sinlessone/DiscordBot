import constants from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';

// VERY bad implementation 
export default {
  name: 'messageReactionAdd',

  /**
   * @param {import("../../client/bot.js").Bot} client
   * @param {import("discord.js").MessageReaction} reaction
   * @param {import("discord.js").User} user
   * @param {import("discord.js").MessageReactionEventDetails} details
   */
  async execute(client, reaction, user, details) {
    if (user.bot || reaction.emoji.name != '📦')
        return;

    const guild = reaction.message.guild;
    if (!guild) return;

    const member = guild.members.cache.get(user.id);
    const role = guild.roles.cache.get(constants.UPDATE_ROLE);

    await member.roles.add(role);
  },
};
