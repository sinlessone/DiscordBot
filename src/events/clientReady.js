import { logger } from '../utils/logger.js';
import { startSmeeClient } from '../utils/smee.js';

export default {
  name: 'clientReady',

  /**
   * @param {import("../client/bot.js").Bot} client
   */
  async execute(client) {
    logger.info(`Client is ready! Logged in as ${client.user.tag}`);

    const users = new Set();
    const guilds = await client.guilds.fetch();

    for (const [, guild] of guilds) {
      const fetchedGuild = await guild.fetch();
      const members = await fetchedGuild.members.fetch();

      for (const member of members.values()) {
        if (member.user.bot) {
          continue;
        }

        users.add(member.user.id);
      }
    }

    client.user.setPresence({
      status: 'dnd',
      activities: [
        {
          name: `${users.size} members`,
          type: 3,
        },
      ],
    });

    startSmeeClient(client);
  },
};
