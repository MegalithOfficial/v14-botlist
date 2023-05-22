import { Handler } from "../../../base/export.js";
import { Database } from "../../../base/classes/Database.js";
import { Colors } from "discord.js";
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
    if (!interaction.customId.startsWith("denymodal-")) return;

    const id = interaction.customId.split('-')[1];
    const reason = interaction.fields.getTextInputValue('reason') || "No Note written.";

    this.client.queue.removeFromQueue(id);

    db.set(`deniedBots.${id}`, {
      botId: id,
      isDenied: true,
      status: 2,
      reason: reason,
      actionTaken: true,
    });

    const userData = db.get(`user.${interaction.user.id}.bots`);
    const filtered = userData.filter((d) => { return d !== id; });
    db.set(`user.${interaction.user.id}.bots`, filtered);

    const botlist = db.get(`botlist.${interaction.guild.id}`);

    const logEmbed = new this.Embed()
      .setTitle("Success")
      .setDescription("Bot successfully Denied.")
      .setColor(Colors.Green)
      .setTimestamp()

    interaction.reply({ embeds: [logEmbed], ephemeral: true });

    const statusChannel = this.client.channels.cache.get(botlist.statusChannel);
    const user = this.client.users.cache.get(interaction.user.id);

    const statusEmbed = new this.Embed()
      .setTitle("Bot Denied")
      .setDescription(`Bot <@${id}> Has been Denied by <@${interaction.user.id}>. \nReason: \`${reason}\`.`)
      .setColor(Colors.Red)
      .setTimestamp()
    statusChannel.send({ embeds: [statusEmbed], content: `<@${user.id}>` })

    const userEmbed = new this.Embed()
      .setTitle("Your bot has been Denied")
      .setDescription(`Your Bot <@${id}> Has been Denied by <@${interaction.user.id}>. \nReason: \`${reason}\`.`)
      .setColor(Colors.Red)
      .setTimestamp()
    return user.send({ embeds: [userEmbed] }).catch((_) => { })

  };
};