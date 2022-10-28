/**
 * @lisance MIT License
 * Copyright (c) 2022 Megalith
 */

 const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
 const { colors } = require('../../config');
 const db = global.db

 module.exports = {
   data: new SlashCommandBuilder()
     .setName('botlistayarla')
     .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
     .setDescription('Botlist sistemini ayarlar.')
      .addChannelOption(options => options.setName("mesaj-kanal").setDescription("Mesajın gönderiliceği kanal.").setRequired(true))
      .addChannelOption(options => options.setName("log-kanal").setDescription("Log kanalı.").setRequired(true))
      .addChannelOption(options => options.setName("onaylandi-reddedildi-kanal").setDescription("Botun onlaylanıp onaylanmadığının yazılıcağı kanal.").setRequired(true))
      .addRoleOption(options => options.setName("bot-developer").setDescription("Botu onaylanan kişilere verilicek rol.").setRequired(true))
      .addRoleOption(options => options.setName("yetkili").setDescription("Botları onaylayan veya reddeden kişinin rol.").setRequired(true))
      .addRoleOption(options => options.setName("bot-rol").setDescription("Onaylanan botlara verilicek rol.").setRequired(true)),
   async execute (interaction) {

     const messageChannel = interaction.options.getChannel("mesaj-kanal")
     const logChannel = interaction.options.getChannel("log-kanal")
     const statusChannel = interaction.options.getChannel("onaylandi-reddedildi-kanal")
     const botDeveloper = interaction.options.getRole("bot-developer")
     const bot = interaction.options.getRole("bot-rol")
     const botstaff = interaction.options.getRole("yetkili")

     const check = messageChannel.type !== ChannelType.GuildText ? "mesaj-kanal" : logChannel.type !== ChannelType.GuildText ? "log-kanal" : statusChannel.type !== ChannelType.GuildText ? "onaylandi-reddedildi-kanal" : ""
     if(check !== "") {
        const embed = new EmbedBuilder()
         .setTitle("hata")
         .setDescription(`\`${check}\` bir yazı kanalı olmak zorunda.`)
         .setColor(colors.red)
         .setTimestamp()
        return interaction.reply({ embeds: [embed], ephemeral: true })
     }

     db.set(`botlist.${interaction.guild.id}`, {
        messageChannel: messageChannel.id,
        logChannel: logChannel.id,
        statusChannel: statusChannel.id,
        botDeveloper: botDeveloper.id,
        bot: bot.id,
        botstaff: botstaff.id
     })

     const row = new ActionRowBuilder()
     .addComponents(
         new ButtonBuilder()
             .setCustomId('botekle-button')
             .setLabel('Bot ekle')
             .setStyle(ButtonStyle.Success),
     );

     const messageEmbed = new EmbedBuilder()
      .setTitle('Bot Ekle')
      .setDescription('Alttaki buttona basarak bot ekleme sayfasını açabilirsiniz.')
      .setColor(colors.green)
      .setTimestamp()

     messageChannel.send({ embeds: [messageEmbed], components: [row] });

     const embed = new EmbedBuilder()
      .setTitle('Başarılı')
      .setDescription("Botlist sistemi kurulumu tamamlandı.")
      .setColor(colors.green)
      .setTimestamp()

     return interaction.reply({ embeds: [embed], ephemeral: true });



   }
 }
 