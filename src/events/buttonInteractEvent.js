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

export default {
  name: Events.InteractionCreate,

  async execute(client, interaction) {
      if (!interaction.isButton()) return;
      const customId = interaction.customId;
      if (!customId.startsWith('role_button:') && 
          !customId.startsWith("ticketsPanel") && 
          !customId.startsWith("ticketClose-") && 
          !customId.startsWith("ticketDelete-")
      ) return;
      
      let action;
      if (customId.startsWith('role_button:')) action = 'role';
      else if (customId === 'ticketsPanel') action = 'ticketOpen';
      else if (customId.startsWith('ticketClose-')) action = 'ticketClose';
      else if (customId.startsWith('ticketDelete-')) action = 'ticketDelete';

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
                ViewChannel: false,
                SendMessages: false
              });
            }

            await interaction.reply({
              embeds: [successEmbed("Ticket closed! User can no longer view this channel.")]
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