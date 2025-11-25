async function fetchUser(client, idOrResolvable) {
  if (!client) throw new Error('you forgot to pass client silly');
  if (!idOrResolvable) return null;

  if (typeof idOrResolvable === 'object') {
    if (idOrResolvable.user) return idOrResolvable.user;
    if (idOrResolvable.id && idOrResolvable.username)
      return idOrResolvable;
  }

  try {
    return await client.users.fetch(String(idOrResolvable));
  } catch (err) {
    return null;
  }
}

async function sendDM(client, userResolvable, messageOptions) {
  const user = await fetchUser(client, userResolvable);
  if (!user)
    return { success: false, error: new Error('User not found') };

  try {
    const sent = await user.send(messageOptions);
    return { success: true, message: sent };
  } catch (err) {
    return { success: false, error: err };
  }
}

async function sendDMWithFallback(
  client,
  userResolvable,
  fallbackChannel,
  messageOptions,
) {
  const dmResult = await sendDM(
    client,
    userResolvable,
    messageOptions,
  );
  if (dmResult.success) return { sentTo: 'dm', result: dmResult };

  try {
    if (
      fallbackChannel &&
      typeof fallbackChannel.reply === 'function'
    ) {
      const res = await fallbackChannel.reply(messageOptions);
      return {
        sentTo: 'fallback',
        result: { success: true, message: res },
      };
    }

    if (
      fallbackChannel &&
      typeof fallbackChannel.send === 'function'
    ) {
      const res = await fallbackChannel.send(messageOptions);
      return {
        sentTo: 'fallback',
        result: { success: true, message: res },
      };
    }

    return {
      sentTo: null,
      result: {
        success: false,
        error: new Error('No valid fallback channel'),
      },
    };
  } catch (err) {
    return { sentTo: null, result: { success: false, error: err } };
  }
}

async function awaitDMReply(
  client,
  userResolvable,
  promptOptions,
  timeoutMs = 60000,
) {
  // untested i think
  const user = await fetchUser(client, userResolvable);
  if (!user) return null;

  try {
    const promptMessage = await user.send(promptOptions);
    const dmChannel = promptMessage.channel;

    const filter = (m) => m.author && m.author.id === user.id;
    const collected = await dmChannel
      .awaitMessages({
        filter,
        max: 1,
        time: timeoutMs,
        errors: ['time'],
      })
      .catch(() => null);

    if (!collected) return null;
    const first = collected.first ? collected.first() : null;
    return first || null;
  } catch (err) {
    return null;
  }
}

export { sendDM, sendDMWithFallback, awaitDMReply, fetchUser };
