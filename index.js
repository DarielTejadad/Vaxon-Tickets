const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// Load channels configuration
const channels = JSON.parse(fs.readFileSync('./channels.json', 'utf8'));

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  // Set bot status
  client.user.setActivity('Vaxon Cloud Support', { type: 'WATCHING' });
});

// Handle interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  
  // Get the category from the button custom ID
  const category = interaction.customId;
  
  // Check if the category exists in our channels config
  if (!channels[category]) {
    await interaction.reply({
      content: 'Esta categoría no está configurada correctamente.',
      ephemeral: true
    });
    return;
  }
  
  // Get the channel ID for this category
  const channelId = channels[category];
  const channel = client.channels.cache.get(channelId);
  
  if (!channel) {
    await interaction.reply({
      content: 'No se pudo encontrar el canal de soporte para esta categoría.',
      ephemeral: true
    });
    return;
  }
  
  // Create an embed for the support ticket
  const supportEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`Nuevo ticket de soporte - ${category}`)
    .setDescription(`Usuario: ${interaction.user.tag}\nID: ${interaction.user.id}`)
    .addFields(
      { name: 'Categoría', value: category, inline: true },
      { name: 'Estado', value: 'Pendiente', inline: true }
    )
    .setTimestamp();
  
  // Send the embed to the support channel
  await channel.send({
    embeds: [supportEmbed],
    content: `@here Nuevo ticket de soporte para la categoría: ${category}`
  });
  
  // Confirm to the user that their ticket has been created
  await interaction.reply({
    content: `Tu ticket de soporte ha sido creado correctamente en el canal de ${category}. Nuestro equipo te responderá lo antes posible.`,
    ephemeral: true
  });
});

// Command to display the support menu
client.on('messageCreate', async message => {
  // Ignore messages from bots
  if (message.author.bot) return;
  
  // Check if the message is in the support channel
  if (message.channelId !== channels.welcome) return;
  
  // Check if the message is the command to display the menu
  if (message.content.toLowerCase() === '!soporte' || message.content.toLowerCase() === '!support') {
    // Create the embed
    const supportEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Bienvenido a Vaxon Cloud')
      .setDescription('Por favor, selecciona una categoría para tu ticket de soporte. Asegúrate de elegir la categoría correcta y proporcionar toda la información relevante.')
      .addFields(
        { name: 'Importante', value: 'Los tickets sin respuesta durante 6 horas se cerrarán automáticamente.' }
      )
      .setTimestamp()
      .setFooter({ text: 'Vaxon Cloud Support' });
    
    // Create the action row with buttons
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('Soporte General')
          .setLabel('Soporte General')
          .setEmoji('🔧')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('Consultas sobre el Panel')
          .setLabel('Panel de Usuario')
          .setEmoji('💻')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('VPS')
          .setLabel('VPS')
          .setEmoji('🔥')
          .setStyle(ButtonStyle.Secondary)
      );
    
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('Otros')
          .setLabel('Otros')
          .setEmoji('❓')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('Postulaciones')
          .setLabel('Postulaciones')
          .setEmoji('📄')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('Patrocinios')
          .setLabel('Patrocinios')
          .setEmoji('🎁')
          .setStyle(ButtonStyle.Secondary)
      );
    
    // Send the embed with buttons
    await message.channel.send({
      embeds: [supportEmbed],
      components: [row, row2]
    });
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
