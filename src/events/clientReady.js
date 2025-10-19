import { logger } from '../utils/logger.js';

export default {
  name: 'clientReady',

  /**
   * @param {import("../client/bot.js").Bot} client
   */
  async execute(client) {
    logger.info(`Client is ready! Logged in as ${client.user.tag}`);
  },
};
