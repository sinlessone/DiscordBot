import discordTranscripts from 'discord-html-transcripts';

export async function sendDM(user, options) {
  try {
    const dmChannel = await user.createDM();
    const message = await dmChannel.send(options);
    return { success: true, message };
  } catch (error) {
    console.error(`Failed to DM user ${user.tag}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Generate an HTML transcript of a ticket channel
 * @param {import("discord.js").TextChannel} channel
 * @returns {Promise<import("discord.js").AttachmentBuilder>}
 */
export async function generateTranscript(channel) {
  const transcript = await discordTranscripts.createTranscript(
    channel,
    {
      filename: `transcript-${channel.name}.html`,
      saveImages: true,
      poweredBy: false,
    },
  );

  return transcript;
}
