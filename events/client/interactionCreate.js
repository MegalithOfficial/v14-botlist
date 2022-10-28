/**
 * @lisance MIT License
 * Copyright (c) 2022 Megalith
 */

const { ApplicationCommandType, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
const { colors, topgg, bot } = require('../../config');
const db = global.db;

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {

    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName)
      if (!command) return

      try {
        command.execute(interaction)
      } catch (error) {
        console.error(error)
        return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
      }

      console.log(`${interaction.user.tag} triggered /${interaction.commandName} in #${interaction.channel.name}/${interaction.guild.name}.`)

    } else if (interaction.isButton()) {

      if (interaction.customId === "botekle-button") {

        const modal = new ModalBuilder()
          .setCustomId('botekle-modal')
          .setTitle('Bot Ekle');

        const row1 = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('botid')
            .setLabel("Bot ID'sini girin.")
            .setPlaceholder('12345678912345')
            .setMaxLength(30)
            .setMinLength(14)
            .setRequired(true)
            .setStyle(TextInputStyle.Short),
        );
        const row2 = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('botprefix')
            .setLabel("Bot Prefixini girin.")
            .setPlaceholder('!')
            .setMaxLength(15)
            .setMinLength(1)
            .setRequired(true)
            .setStyle(TextInputStyle.Short),
        );
        const row3 = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('extranote')
            .setMaxLength(1000)
            .setMinLength(1)
            .setRequired(false)
            .setPlaceholder('Botunuzu inceleyecek yetkiliye söylemeniz gereken bir ek bilgi varsa yazınız.')
            .setLabel("Yetkiliye not")
            .setStyle(TextInputStyle.Paragraph)
        );

        modal.addComponents(row1, row2, row3);
        await interaction.showModal(modal);

        /* } else {
           const embed = new EmbedBuilder()
            .setTitle("hata")
            .setDescription("Bot ekleyebilmeniz için votelamanız gerek lütfen votelayıp tekrar deneyin.\nVote linki: " + topgg.votelink)
            .setColor(colors.red)
            .setTimestamp()
           return interaction.reply({ embeds: [embed], ephemeral: true })
         }*/
      } else if (interaction.customId.startsWith('onayla-')) {
        if (!interaction.member.roles.cache.some(role => role.id === db.get(`botlist.${interaction.guild.id}.botstaff`))) {
          const err = new EmbedBuilder()
            .setTitle("Hata")
            .setDescription("Bu sistemi kullanabilmek için yetkiniz yok.\nSahip olmanız gereken rol: <@&" + db.get(`botlist.${interaction.guild.id}.botstaff`) + ">.")
            .setColor(colors.red)
            .setTimestamp()
          return interaction.reply({ embeds: [err], ephemeral: true })
        }
        const id = interaction.customId.split('-')[1];

        if (interaction.client.users.cache.get(id)) {

          if(db.get(`bot.${id}.actionTaken`) === true) {
            const error = new EmbedBuilder()
             .setTitle("Hata")
             .setDescription(`<@${id}>(${id}) Adlı bot zaten \`${db.get(`bot.${id}.status`)}\`.`)
             .setColor(colors.red)
             .setTimestamp()
            return interaction.reply({ embeds: [error], ephemeral: true })
          }

          const data = db.get(`bot.${id}`)

          const user = await interaction.guild.members.fetch(data.ownerId)
          const bot = await interaction.guild.members.fetch(id) 
          await bot.roles.add(db.get(`botlist.${interaction.guild.id}.bot`))
          await user.roles.add(db.get(`botlist.${interaction.guild.id}.botDeveloper`))

          const embed = new EmbedBuilder()
            .setTitle("Başarılı")
            .setDescription("Bot onaylandı.")
            .setColor(colors.green)
            .setTimestamp()
          interaction.reply({ embeds: [embed], ephemeral: true })

          const statusChannel = interaction.client.channels.cache.get(db.get(`botlist.${interaction.guild.id}.statusChannel`))
          const statusEmbed = new EmbedBuilder()
            .setTitle("Bot Onaylandı")
            .setDescription(`<@${id}>(\`${id}\`) Adlı bot <@${interaction.user.id}> Tarafından Onaylandı.`)
            .setColor(colors.green)
            .setTimestamp()
          statusChannel.send({ embeds: [statusEmbed], content: `<@${user.id}>` })

          db.substr(`botlist.${interaction.guild.id}.totalQueue`, 1)
          db.delete(`bot.${id}.queuelocation`)
          db.set(`bot.${id}.actionTaken`, true)
          db.set(`bot.${id}.status`, "Onaylandı")

          db.pull(`allbots-${interaction.guild.id}`, (e) => e === id);
          const alldata = db.get(`allbots-${interaction.guild.id}`)
          for(let i = 0; i < alldata.length; i++) {
             db.substr(`bot.${alldata[i]}.queuelocation`, 1)
          }

          const userEmbed = new EmbedBuilder()
            .setTitle("Botunuz Sunucuya eklendi")
            .setDescription(`<@${id}>(\`${id}\`) Adlı botunuz <@${interaction.user.id}> Adlı yetkili tarafından Onaylandı!`)
            .setColor(colors.green)
            .setTimestamp()
          return user.send({ embeds: [userEmbed] }).catch(err => { })

        } else { 

          const err = new EmbedBuilder()
            .setTitle("Hata")
            .setDescription("**Bot Sunucuda ekli değil!**\n**Lütfen sunucuya ekleyin.**")
            .setColor(colors.red)
            .setTimestamp()

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("Botu Ekle")
              .setStyle(ButtonStyle.Link)
              .setURL("https://discord.com/api/oauth2/authorize?client_id=" + id + "&permissions=0&scope=bot%20applications.commands")
          );
          return interaction.reply({ embeds: [err], ephemeral: true, components: [row] })
        }
      } else if (interaction.customId.startsWith('reddet-')) {

        const id = interaction.customId.split('-')[1];

        if(db.get(`bot.${id}.actionTaken`) === true) {
          const error = new EmbedBuilder()
           .setTitle("Hata")
           .setDescription(`<@${id}>(${id}) Adlı bot zaten \`${db.get(`bot.${id}.status`)}\`.`)
           .setColor(colors.red)
           .setTimestamp()
          return interaction.reply({ embeds: [error], ephemeral: true })
        }

        const modal = new ModalBuilder()
          .setCustomId(`reddet-modal-${id}`)
          .setTitle('Reddet');

        const row1 = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('neden')
            .setLabel("Reddetme nedeni girin.")
            .setMaxLength(1000)
            .setMinLength(1)
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph),
        );

        modal.addComponents(row1);
        await interaction.showModal(modal);
      }

    } else if (interaction.isModalSubmit()) {

      if (interaction.customId === "botekle-modal") {
        const botId = interaction.fields.getTextInputValue('botid');
        const prefix = interaction.fields.getTextInputValue('botprefix');
        const extraNotes = interaction.fields.getTextInputValue('extranote') || "Ek bilgi yok";

        if(!interaction.client.users.cache.get(botId)) {
          const error = new EmbedBuilder()
           .setTitle('Hata')
           .setDescription(`\`${botId}\` IDsine sahip bir bot yok.`)
           .setColor(colors.red)
           .setTimestamp()
          return interaction.reply({ embeds: [error], ephemeral: true })
        }
        if(db.get(`bot.${botId}.ownerId`) !== interaction.user.id && db.get(`bot.${botId}`)) {
          const error = new EmbedBuilder()
          .setTitle('Hata')
          .setDescription(`\`${botId}\` IDli bot ztn sistemde mevcut.\n Eğer bir hata varsa lütfen Yetkili ile iletişime geçin.`)
          .setColor(colors.red)
          .setTimestamp()
         return interaction.reply({ embeds: [error], ephemeral: true })
        } else if(db.get(`bot.${botId}.ownerId`) === interaction.user.id && db.get(`bot.${botId}`)) {
          const error = new EmbedBuilder()
          .setTitle('Hata')
          .setDescription(`Aynı botu tekrar ekliyemezsin.\n Eğer bir hata varsa lütfen Yetkili ile iletişime geçin.`)
          .setColor(colors.red)
          .setTimestamp()
         return interaction.reply({ embeds: [error], ephemeral: true })
        }

        db.add(`botlist.${interaction.guild.id}.totalQueue`, 1)
        db.push(`user.${interaction.user.id}.bots`, botId)
        db.set(`bot.${botId}`, {
          queuelocation: db.get(`botlist.${interaction.guild.id}.totalQueue`),
          status: "bekliyor",
          ownerId: interaction.user.id,
          prefix: prefix,
          extraNotes: extraNotes,
          actionTaken: false
        })
        db.push(`allbots-${interaction.guild.id}`, botId);

        const data = db.get(`botlist.${interaction.guild.id}`)
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel("Botu Ekle")
              .setStyle(ButtonStyle.Link)
              .setURL("https://discord.com/api/oauth2/authorize?client_id=" + botId + "&permissions=0&scope=bot%20applications.commands"),
            new ButtonBuilder()
              .setLabel("Onayla")
              .setStyle(ButtonStyle.Success)
              .setCustomId(`onayla-${botId}`),
            new ButtonBuilder()
              .setLabel("Reddet")
              .setStyle(ButtonStyle.Danger)
              .setCustomId(`reddet-${botId}`)
          )

        const logChannel = interaction.client.channels.cache.get(data.logChannel)
        const logEmbed = new EmbedBuilder()
          .setTitle("Sıraya Bot Eklendi!")
          .setDescription(`
         **Bot ID:** <@${botId}>(\`${botId}\`
         **Bot sahibi:** <@${interaction.user.id}>
         **Bot prefixi:** \`${prefix}\`
         **Sırası:** ${db.get(`bot.${botId}.queuelocation`)}
         **Ek not:** \`${extraNotes}\`

         > Botu onaylamak için "**Onayla**", Reddetmek için "**Reddet**" buttonuna basın.
         `)
          .setColor(colors.orange)
        logChannel.send({ embeds: [logEmbed], components: [row] })

        const statusChannel = interaction.client.channels.cache.get(data.statusChannel)
        const statusEmbed = new EmbedBuilder()
          .setTitle("Bot eklendi")
          .setDescription(`Sıraya <@${botId}>(\`${botId}\`) Adlı bir bot <@${interaction.user.id}> Tarafından eklendi.\nSırada **${db.get(`botlist.${interaction.guild.id}.totalQueue`)}** Kişi arasından **${db.get(`bot.${botId}.queuelocation`)}**'da.`)
          .setColor(colors.green)
          .setTimestamp()
        statusChannel.send({ embeds: [statusEmbed] })

        const userEmbed = new EmbedBuilder()
          .setTitle("Başarılı")
          .setDescription(`<@${botId}> adlı botunuz Sıraya eklendi!\nSırada **${db.get(`botlist.${interaction.guild.id}.totalQueue`)}** Kişi arasından **${db.get(`bot.${botId}.queuelocation`)}**'sınız.`)
          .setColor(colors.green)
          .setTimestamp()
        return interaction.reply({ embeds: [userEmbed], ephemeral: true })

      } else if(interaction.customId.startsWith('reddet-modal-')) {
        const id = interaction.customId.split('-')[2];
        const neden = interaction.fields.getTextInputValue('neden') || "Neden verilmedi.";

        db.pull(`allbots-${interaction.guild.id}`, (e) => e === id);
        const data = db.get(`allbots-${interaction.guild.id}`)
        for(let i = 0; i < data.length; i++) {
           db.substr(`bot.${data[i]}.queuelocation`, 1)
        }
        db.substr(`botlist.${interaction.guild.id}.totalQueue`, 1)
        db.set(`bot.${id}.denyReason`, neden)
        db.set(`bot.${id}.status`, "Reddedildi")

        const botdata = db.get(`bot.${id}`)

        const logEmbed = new EmbedBuilder()
          .setTitle("Başarılı")
          .setDescription("Bot reddedildi.")
          .setColor(colors.green)
          .setTimestamp()

        interaction.reply({ embeds: [logEmbed], ephemeral: true })

        const statusChannel = interaction.client.channels.cache.get(db.get(`botlist.${interaction.guild.id}.statusChannel`))
        const user = interaction.client.users.cache.get(botdata.ownerId)
        const statusEmbed = new EmbedBuilder()
          .setTitle("Bot Reddedildi")
          .setDescription(`<@${id}>(\`${id}\`) Adlı bot <@${interaction.user.id}> Tarafından Reddedildi.\nNedeni: \`${neden}\`.`)
          .setColor(colors.red)
          .setTimestamp()
        statusChannel.send({ embeds: [statusEmbed], content: `<@${user.id}>` }) 

        const userEmbed = new EmbedBuilder()
        .setTitle("Botunuz Sunucuya eklendi")
        .setDescription(`<@${id}>(\`${id}\`) Adlı botunuz <@${interaction.user.id}> Adlı yetkili tarafından Reddedildi.\nNedeni: \`${neden}\`.`)
        .setColor(colors.green)
        .setTimestamp()
      return user.send({ embeds: [userEmbed] }).catch(err => { })
          

      }



    }
  }
}
