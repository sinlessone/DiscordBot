import { PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { sendDM } from '../../utils/dmUtils.js';

/** Thank you oblongboot for this command */
export default {
  name: 'admin',
  description: 'Administrator commands for server management',
  
  async execute(client, message, subcommand, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply({ embeds: [errorEmbed('You need Administrator permissions to use this command.')] });
    }

    switch (subcommand) {
    //   case 'massdm': {
    //     await handleMassDM(client, message, args);
    //     break; // i could NOT be bothered to fix - oblong (error is not finding people when using usernames/ids ig)
    //   }
      
      case 'dmall': {
        await handleDMAll(client, message, args);
        break;
      }
      
      case 'stickymessage': {
        await handleStickyMessage(client, message, args);
        break;
      }
      
      default: {
        if (!subcommand) {
          return message.reply({ 
            embeds: [errorEmbed('Please provide a subcommand: dmall, stickymessage')] 
          });
        }
        return message.reply({ 
          embeds: [errorEmbed(`Unknown subcommand: ${subcommand}\n\nAvailable: dmall, stickymessage`)] 
        });
      }
    }
  }
};

// async function handleMassDM(client, message, args) {
//   const argsArray = Array.isArray(args) ? args : args.split(' ');
  
//   if (argsArray.length < 2) {
//     return message.reply({ embeds: [errorEmbed('Usage: `.admin massdm @user1 @user2... <message>`')] });
//   }

//   await message.guild.members.fetch();

//   const members = [];
//   const foundUserQueries = [];
//   let messageStartIndex = -1;
//   for (let i = 0; i < argsArray.length; i++) {
//     const arg = argsArray[i];

//     const a = arg.match(/^<@!?\d+>$/) || arg.match(/^\d{17,19}$/) || arg.startsWith('@');
//     if (!a) {
//       messageStartIndex = i;
//       break;
//     }
//     const query = arg.startsWith('@') ? arg.substring(1) : arg;
//     const member = await searchMember(message.guild, query);
    
//     if (member && !members.find(m => m.id === member.id)) {
//       members.push(member);
//       foundUserQueries.push(query);
//     } else if (!member) {
//       messageStartIndex = i;
//       break;
//     }
//   }
//   if (messageStartIndex === -1) {
//     if (members.length === 0) {
//       return message.reply({ embeds: [errorEmbed('Could not find any users. Please use valid @mentions, usernames, or user IDs.')] });
//     }
//     messageStartIndex = argsArray.length - 1;
//     members.pop();
//   }

//   const messageContent = argsArray.slice(messageStartIndex).join(' ').trim();
  
//   if (!messageContent) {
//     return message.reply({ embeds: [errorEmbed('Please provide a message to send.')] });
//   }

//   if (members.length === 0) {
//     return message.reply({ embeds: [errorEmbed('Please mention at least one user. You can use @username, user ID, or mention.')] });
//   }

//   const results = { success: 0, failed: 0 };
//   const failedUsers = [];

//   const statusMsg = await message.reply({ embeds: [successEmbed(`Sending DMs to ${members.length} users...`)] });

//   for (const member of members) {
//     const result = await sendDM(client, member.user, { content: messageContent });
    
//     if (result.success) {
//       results.success++;
//     } else {
//       results.failed++;
//       failedUsers.push(member.user.tag);
      
//       console.error(`Failed to DM user ${member.user.tag}:`, result.error?.message || 'Unknown error');
//     }

//     if (members.length > 1) {
//       await new Promise(resolve => setTimeout(resolve, 2000));
//     }
//   }

//   let resultMessage = `Successfully sent to ${results.success} users`;
//   if (results.failed > 0) {
//     resultMessage += `\nFailed to send to ${results.failed} users: ${failedUsers.join(', ')}`;
//   }

//   await statusMsg.edit({ embeds: [successEmbed(resultMessage)] });
// }

async function handleDMAll(client, message, args) {
  const ownerId = "1367543367277219840" // nathans id
  if (message.author.id !== ownerId) {
    return message.reply({ embeds: [errorEmbed('Only Nathan can use this command.')] });
  }
  const messageContent = Array.isArray(args)
    ? args.join(' ')
    : typeof args === 'string'
    ? message.content.split(' ').slice(2).join(' ')
    : '';

  if (!messageContent.trim()) {
    return message.reply({ embeds: [errorEmbed('Usage: `.admin dmall <message>`')] });
  }

  const confirmMsg = await message.reply({ 
    content: `This will DM **all ${message.guild.memberCount} members**. Reply with \`confirm\` within 30 seconds to proceed.` 
  });

  const filter = (m) => m.author.id === message.author.id && m.content.toLowerCase() === 'confirm';
  const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
    .catch(() => null);

  if (!collected) {
    return confirmMsg.edit({ content: 'DM all cancelled - confirmation timeout.' });
  }

  await confirmMsg.edit({ content: 'Fetching members and sending DMs...' });

  await message.guild.members.fetch();
  const members = message.guild.members.cache.filter(m => !m.user.bot);

  const results = { success: 0, failed: 0 };
  let processed = 0;

  for (const [, member] of members) {
    const result = await sendDM(client, member.user, { content: messageContent });
    
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      console.error(`Failed to DM ${member.user.tag}:`, result.error?.message || 'Unknown error');
    }

    processed++;
    
    if (processed % 10 === 0) {
      await confirmMsg.edit({ 
        content: `Progress: ${processed}/${members.size} (${results.success} sent, ${results.failed} failed)` 
      });
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  await confirmMsg.edit({ 
    embeds: [successEmbed(`DM All Complete\nSent: ${results.success}\nFailed: ${results.failed}`)] 
  });
}

async function handleDMAllWithCriteria(client, message, args) { // also slightly broken - oblong
  if (args.length < 2) {
    return message.reply({ embeds: [errorEmbed('Usage: `.admin dmallcriteria role:<role_id> <message>`')] });
  }

  let criteria = null;
  let messageContent = '';
  
  if (args[0].startsWith('role:')) {
    const roleId = args[0].substring(5).replace(/[<@&>]/g, '');
    criteria = { type: 'role', value: roleId };
    messageContent = args.slice(1).join(' ');
  } else {
    return message.reply({ embeds: [errorEmbed('Currently only `role:<role_id>` criteria is supported.')] });
  }

  if (!messageContent) {
    return message.reply({ embeds: [errorEmbed('Please provide a message to send.')] });
  }

  await message.guild.members.fetch();
  const role = message.guild.roles.cache.get(criteria.value);
  
  if (!role) {
    return message.reply({ embeds: [errorEmbed('Role not found.')] });
  }

  const members = message.guild.members.cache.filter(m => !m.user.bot && m.roles.cache.has(role.id));

  if (members.size === 0) {
    return message.reply({ embeds: [errorEmbed(`No members found with role ${role.name}`)] });
  }

  const confirmMsg = await message.reply({ 
    content: `This will DM **${members.size} members** with role ${role.name}. Reply with \`confirm\` within 30 seconds.` 
  });

  const filter = (m) => m.author.id === message.author.id && m.content.toLowerCase() === 'confirm';
  const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
    .catch(() => null);

  if (!collected) {
    return confirmMsg.edit({ content: 'Criteria DM cancelled.' });
  }

  await confirmMsg.edit({ content: 'Sending DMs to matching members...' });

  const results = { success: 0, failed: 0 };
  let processed = 0;

  for (const [, member] of members) {
    const result = await sendDM(client, member.user, { content: messageContent });
    
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      console.error(`Failed to DM ${member.user.tag}:`, result.error?.message || 'Unknown error');
    }

    processed++;
    
    if (processed % 10 === 0) {
      await confirmMsg.edit({ 
        content: `Progress: ${processed}/${members.size} (${results.success} sent, ${results.failed} failed)` 
      });
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  await confirmMsg.edit({ 
    embeds: [successEmbed(`Criteria DM Complete\nSent: ${results.success}\nFailed: ${results.failed}`)] 
  });
}

async function handleStickyMessage(client, message, args) {
  const stickyContent = Array.isArray(args)
    ? args.join(' ')
    : typeof args === 'string'
    ? message.content.split(' ').slice(2).join(' ')
    : '';
  if (!stickyContent.trim()) return message.reply({ embeds: [errorEmbed('Usage: `.admin stickymessage <message|off>`')] });

  if (!client.stickyMessages) client.stickyMessages = new Map();
  if (!client.stickyCooldowns) client.stickyCooldowns = new Map();

  if (stickyContent.toLowerCase() === 'off') {
    const existing = client.stickyMessages.get(message.channel.id);
    if (existing) {
      const old = await message.channel.messages.fetch(existing.messageId).catch(() => null);
      if (old) await old.delete().catch(() => {});
      client.stickyMessages.delete(message.channel.id);
      return message.reply({ embeds: [successEmbed('Sticky message disabled for this channel.')] });
    }
    return message.reply({ embeds: [errorEmbed('No sticky message is active in this channel.')] });
  }

  const existing = client.stickyMessages.get(message.channel.id);
  if (existing) {
    const old = await message.channel.messages.fetch(existing.messageId).catch(() => null);
    if (old) await old.delete().catch(() => {});
  }

  const stickyMsg = await message.channel.send({ content: `(**sticky message**) ${stickyContent}` });
  client.stickyMessages.set(message.channel.id, { content: stickyContent, messageId: stickyMsg.id });
  await message.reply({ embeds: [successEmbed('Sticky message created! It will repost after each message.')] });

  if (!client.stickyListenerRegistered) {
    client.stickyListenerRegistered = true;
    client.on('messageCreate', async (msg) => {
      if (!msg.guild) return;
      const sticky = client.stickyMessages.get(msg.channel.id);
      if (!sticky) return;
      const key = msg.channel.id;
      if (client.stickyCooldowns.get(key)) return;
      client.stickyCooldowns.set(key, true);
      try {
        const old = await msg.channel.messages.fetch(sticky.messageId).catch(() => null);
        if (old) await old.delete().catch(() => {});
        const updated = client.stickyMessages.get(msg.channel.id);
        if (!updated) return;
        const newMsg = await msg.channel.send({ content: `(**sticky message**) ${updated.content}` });
        client.stickyMessages.set(msg.channel.id, { content: updated.content, messageId: newMsg.id });
      } catch (err) {
        console.error(`Sticky message error in #${msg.channel.name}:`, err);
      } finally {
        setTimeout(() => client.stickyCooldowns.delete(key), 1500);
      }
    });
  }
}
