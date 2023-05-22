import { Handler } from "../../../base/export.js";
import { Database } from "../../../base/classes/Database.js";
import { Colors, ButtonStyle } from "discord.js";
const db = new Database();

export default class extends Handler {
  constructor(client) {
    super(client, {
      name: Handler.Events.InteractionCreate,
      enabled: true,
      type: "Modal"
    });
  };

  /**
   * @param {import("discord.js").Interaction} interaction 
   */
  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== "botadd-modal") return;

    const botId = interaction.fields.getTextInputValue('botid');
    const prefix = interaction.fields.getTextInputValue('botprefix');
    const extraNotes = interaction.fields.getTextInputValue('extranote') || "No Note written.";
    const exist = await this.client.users.fetch(botId);

    if (db.get(`bot.${botId}.ownerId`) !== interaction.user.id && db.get(`bot.${botId}`)) {

      const error = new this.Embed()
        .setTitle('Error')
        .setDescription(`Bot \`${botId}\` already exist in the system.\n If there is a problem, please contact the staff.`)
        .setColor(Colors.Red)
        .setTimestamp()
      return interaction.reply({ embeds: [error], ephemeral: true })

    } else if (db.get(`bot.${botId}.ownerId`) === interaction.user.id && db.get(`bot.${botId}`)) {

      const error = new this.Embed()
        .setTitle('Error')
        .setDescription(`You cannot add the same bot again.\n If there is a problem, please contact the staff.`)
        .setColor(Colors.Red)
        .setTimestamp()
      return interaction.reply({ embeds: [error], ephemeral: true })

    } else if (!exist?.bot) {

      const error = new this.Embed()
        .setTitle('Error')
        .setDescription(`This ID seems to be Invalid.\n If there is a problem, please contact the staff.`)
        .setColor(Colors.Red)
        .setTimestamp()
      return interaction.reply({ embeds: [error], ephemeral: true })

    }

    db.push(`user.${interaction.user.id}.bots`, botId)
    this.client.queue.addToQueue({
      botId: botId,
      status: 0,
      ownerId: interaction.user.id,
      prefix: prefix,
      extraNotes: extraNotes,
      actionTaken: false
    })

    const data = db.get(`botlist.${interaction.guild.id}`)

    const row = new this.Row()
      .addComponents(
        new this.Button()
          .setLabel("Add bot (Administrator)")
          .setStyle(ButtonStyle.Link)
          .setURL("https://discord.com/api/oauth2/authorize?client_id=" + botId + "&permissions=8&scope=bot%20applications.commands"),
        new this.Button()
          .setLabel("Add bot (No Perm)")
          .setStyle(ButtonStyle.Link)
          .setURL("https://discord.com/api/oauth2/authorize?client_id=" + botId + "&permissions=0&scope=bot%20applications.commands"),
        new this.Button()
          .setLabel("Accept")
          .setStyle(ButtonStyle.Success)
          .setCustomId(`acceptbutton-${botId}`),
        new this.Button()
          .setLabel("Deny")
          .setStyle(ButtonStyle.Danger)
          .setCustomId(`denybutton-${botId}`)
      )

    const logChannel = interaction.client.channels.cache.get(data.logChannel)
    const queuelocation = this.client.queue.getBotInfoFromQueue(botId)

    const logEmbed = new this.Embed()
      .setTitle("Bot added to Queue")
      .setDescription(`
         **Bot ID:** <@${botId}>(\`${botId}\`)
         **Bot Owner:** <@${interaction.user.id}>
         **Bot Prefix:** \`${prefix}\`
         **Queue position:** ${queuelocation.queuePosition}
         **Extra Note:** \`${extraNotes}\`

         > Please Click to "**Accept**" to Accept, Click to "**Deny**" to Deny the Bot Submit.
         `)
      .setColor(Colors.Orange)
    logChannel.send({ embeds: [logEmbed], components: [row] })
    const statusChannel = this.client.channels.cache.get(data.statusChannel)
    const statusEmbed = new this.Embed()
      .setTitle("Bot Added")
      .setDescription(`Bot <@${botId}>(\`${botId}\`) added by <@${interaction.user.id}> To Queue. \nQueue Position is **${queuelocation.queuePosition}**/**${this.client.queue.length()}**'.`)
      .setColor(Colors.Green)
      .setTimestamp()
    statusChannel.send({ embeds: [statusEmbed] })

    const userEmbed = new this.Embed()
      .setTitle("Success")
      .setDescription(`Bot <@${botId}> Successfully added to Queue. \nQueue Position is **${queuelocation.queuePosition}**/**${this.client.queue.length()}**'.`)
      .setColor(Colors.Green)
      .setTimestamp()
    return interaction.reply({ embeds: [userEmbed], ephemeral: true })
  };
};