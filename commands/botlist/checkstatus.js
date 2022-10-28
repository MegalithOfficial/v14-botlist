/**
 * @lisance MIT License
 * Copyright (c) 2022 Megalith
 */

const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } = require('discord.js')
const { colors } = require('../../config');
const db = global.db

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botdurumkontrol')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setDescription('Botlist sistemini ayarlar.')
        .addStringOption(option => option.setName("botid").setDescription("Bot idsi girin").setRequired(true)),
    async execute(interaction) {

        const id = interaction.options.getString('botid');
        const data = db.get(`bot.${id}`)

        if (data === null || !data) {

            const err = new EmbedBuilder()
             .setTitle('hata')
             .setDescription(`\`${id}\`'li bir bot sistemde mevcut değil.`)
             .setColor(colors.red)
             .setTimestamp()

         return interaction.reply({ embeds: [err], ephemeral: true })
        } else {
            const bot = interaction.client.users.cache.get(id)

            const embed = new EmbedBuilder()
                .setTitle('Bot ' + bot.username + " Durumu")
                .setDescription(`
     **BotId:** \`${id}\`
     **Onaylanma Durumu:** \`${data.status}\`
     **Sahibi:** <@${data.ownerId}>
     **Prefix:** \`${data.prefix}\`
     ${data.status === "Bekliyor" ? `**Sırası:** \`${data.queuelocation}.\`` : data.status === "Reddedildi" ? `**Reddedilme nedeni:** \`${data.denyReason}.\`` : `**Sırası:** \`${data.queuelocation}.\`` }
     `)
                .setColor(data.status === "Bekliyor" ? colors.green : data.status === "Reddedildi" ? colors.red : data.status === "Onaylandı" ? colors.green : colors.green)
                .setTimestamp()

            return interaction.reply({ embeds: [embed], ephemeral: true })
        }



    }
}
