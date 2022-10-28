/**
 * @lisance MIT License
 * Copyright (c) 2022 Megalith
 */

const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { colors } = require('../../config');
const db = global.db;
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Botun pingini verir.'),
  async execute (interaction) {
    
    const embed = new EmbedBuilder()
     .setColor(colors.green)
     .setDescription(`API Latency: ${Math.round(interaction.client.ws.ping)}ms`)
    await interaction.reply({ embeds: [embed] })
  }
}
