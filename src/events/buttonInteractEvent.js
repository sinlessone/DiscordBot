import {
  Events,
  MessageFlags,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { errorEmbed, successEmbed, cobaltColorEmbed } from '../utils/embeds.js';
import constants from '../utils/constants.js';

let rateLimitedTickets = [];

export default {
  name: Events.InteractionCreate,

  async execute(client, interaction) {
    if (!interaction.isButton()) return;
    const customId = interaction.customId;
    if (!customId.startsWith('role_button:') &&
      !customId.startsWith("ticketsPanel") &&
      !customId.startsWith("ticketClose-") &&
      !customId.startsWith("ticketDelete-") &&
      !customId.startsWith("ticketReopen-")
    ) return;

    let action;
    if (customId.startsWith('role_button:')) action = 'role';
    else if (customId === 'ticketsPanel') action = 'ticketOpen';
    else if (customId.startsWith('ticketClose-')) action = 'ticketClose';
    else if (customId.startsWith('ticketDelete-')) action = 'ticketDelete';
    else if (customId.startsWith('ticketReopen-')) action = 'ticketReopen';

    switch (action) {
      case 'ticketOpen':
        await tickets(interaction);
        break;

      case 'ticketClose': {
        const channelId = customId.split('-')[1];
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel) {
          return interaction.reply({
            embeds: [errorEmbed("Ticket channel not found!")],
            flags: MessageFlags.Ephemeral
          });
        }

        try {
          const userOverwrite = channel.permissionOverwrites.cache.find(
            overwrite => overwrite.type === 1 && overwrite.id !== interaction.client.user.id
          );

          if (userOverwrite) {
            await channel.permissionOverwrites.edit(userOverwrite.id, {
              SendMessages: false
            });
          }

          const newName = channel.name.replace('ticket-', 'closed-ticket-');
          try {
            await channel.setName(newName);
          } catch (e) {
            console.log(e.message);
            if (e.code == 429) {
              interaction.reply({
                embeds: [errorEmbed("This ticket has been rate limited from renaming.")],
                flags: MessageFlags.Ephemeral
              });
              rateLimitedTickets.push(channelId);
              setTimeout(() => {
                rateLimitedTickets = rateLimitedTickets.filter(id => id !== channelId);
              }, 60000);
            } else {
              interaction.reply({
                embeds: [errorEmbed(`Failed to rename ticket: ${e.message}`)],
                flags: MessageFlags.Ephemeral
              });
            }

            await interaction.reply({
              embeds: [errorEmbed("Ticket closed! User can no longer view this channel.")]
            });
          } catch (error) {
            console.error(error);
            await interaction.reply({
              embeds: [errorEmbed(`Failed to close ticket: ${error.message}`)],
              flags: MessageFlags.Ephemeral
            });
          }

          const reopenButton = new ButtonBuilder()
            .setCustomId(`ticketReopen-${channel.id}`)
            .setLabel("Reopen")
            .setEmoji("🔓")
            .setStyle(ButtonStyle.Secondary);

          const row = new ActionRowBuilder()
            .addComponents(reopenButton);

          await interaction.reply({
            embeds: [successEmbed("Ticket closed! Click the Reopen button to reopen it!")],
            components: [row],
          });
        } catch (error) {
          console.error(error);
          await interaction.reply({
            embeds: [errorEmbed(`Failed to close ticket: ${error.message}`)],
            flags: MessageFlags.Ephemeral
          });
        }
        break;
      }

      case 'ticketReopen': {
        const channelId = customId.split('-')[1];
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel) {
          return interaction.reply({
            embeds: [errorEmbed("Ticket channel not found!")],
            flags: MessageFlags.Ephemeral
          });
        }

        try {
          await channel.setName(channel.name.replace('closed-ticket-', 'ticket-'));

          const userOverwrite = channel.permissionOverwrites.cache.find(
            overwrite => overwrite.type === 1 && overwrite.id !== interaction.client.user.id
          );

          if (userOverwrite) {
            await channel.permissionOverwrites.edit(userOverwrite.id, {
              SendMessages: true
          try {
            await interaction.reply({
              embeds: [errorEmbed("Deleting ticket in 5 seconds...")]
            });
            
            setTimeout(async () => {
              await channel.delete("Ticket deleted via Delete button");
            }, 5000);
          } catch (error) {
            console.error(error);
            await interaction.reply({
              embeds: [errorEmbed(`Failed to delete ticket: ${error.message}`)],
              flags: MessageFlags.Ephemeral
            });
          }

          const closeButton = new ButtonBuilder()
            .setCustomId(`ticketClose-${channel.id}`)
            .setLabel("Close")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Secondary);

          const deleteButton = new ButtonBuilder()
            .setCustomId(`ticketDelete-${channel.id}`)
            .setLabel("Delete")
            .setEmoji("🗑️")
            .setStyle(ButtonStyle.Secondary);

          const row = new ActionRowBuilder()
            .addComponents(closeButton, deleteButton);

          await interaction.reply({
            embeds: [successEmbed("Ticket reopened!")],
            components: [row]
          });
        } catch (error) {
          console.error(error);
          await interaction.reply({
            embeds: [errorEmbed(`Failed to reopen ticket: ${error.message}`)],
            flags: MessageFlags.Ephemeral
          });
        }
        break;
      }

      case 'ticketDelete': {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({
            embeds: [errorEmbed("Only Admins can delete tickets!")],
            flags: MessageFlags.Ephemeral
          });
        }

        const channelId = customId.split('-')[1];
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel) {
          return interaction.reply({
            embeds: [errorEmbed("Ticket not found!")],
            flags: MessageFlags.Ephemeral
          });
        }

        try {
          await interaction.reply({
            embeds: [successEmbed("Deleting ticket in 5 seconds...")]
          });

          setTimeout(async () => {
            await channel.delete("Ticket deleted via Delete button");
          }, 5000);
        } catch (error) {
          console.error(error);
          await interaction.reply({
            embeds: [errorEmbed(`Failed to delete ticket: ${error.message}`)],
            flags: MessageFlags.Ephemeral
          });
        }
        break;
      }

      case 'role': {
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
            flags: MessageFlags.Ephemeral,
          });
        }
        break;
      }
    }
  },
}

async function tickets(interaction) {
  try {
    const existingTicket = interaction.guild.channels.cache.find(channel =>
      channel.name.startsWith('ticket-') &&
      channel.permissionOverwrites.cache.has(interaction.user.id)
    );

    if (existingTicket) {
      return await interaction.reply({
        embeds: [errorEmbed(`You already have an open ticket: <#${existingTicket.id}>`)],
        flags: MessageFlags.Ephemeral
      });
    }

    const ticketChannels = interaction.guild.channels.cache.filter(channel =>
      channel.name.includes('ticket-')
    );

    const ticketNumber = ticketChannels.size + 1;
    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${ticketNumber}`,
      type: 0,
      parent: '1445894056495288451',
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: ['ViewChannel'],
        },
        {
          id: interaction.user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
        {
          id: interaction.client.user.id,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
      ],
    });

    const closeButton = new ButtonBuilder()
      .setCustomId(`ticketClose-${ticketChannel.id}`)
      .setLabel("Close")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Secondary)

    const deleteButton = new ButtonBuilder()
      .setCustomId(`ticketDelete-${ticketChannel.id}`)
      .setLabel("Delete")
      .setEmoji("🗑️")
      .setStyle(ButtonStyle.Secondary)

    const row = new ActionRowBuilder()
      .addComponents(closeButton)
      .addComponents(deleteButton);

    await ticketChannel.send({
      content: `<@${interaction.user.id}> (||<@&${constants.ROLES.TICKET_PING}>||)`,
      embeds: [cobaltColorEmbed(`
        Thank you for creating a ticket <@${interaction.user.id}>! Our support team will assist you as soon as possible!
        
        Please do **NOT** spam ping Developers or Admins, we get pinged on ticket creation!
        
        While you are waiting for us to reply, please describe your issue and/or ask your question, if a ticket is left empty after an hour of creation, it **WILL** be closed!
        
        Thank you for your patience!`
      )],
      components: [row]
    });
    return await interaction.reply({
      embeds: [successEmbed(`Opened <#${ticketChannel.id}>! Please follow the instructions provided in the ticket.`)],
      flags: MessageFlags.Ephemeral
    });
  } catch (error) {
    console.error(error);
    await interaction.followUp({
      embeds: [errorEmbed(`Failed to create ticket: ${error.message}`)],
      flags: MessageFlags.Ephemeral
    });
  }
}