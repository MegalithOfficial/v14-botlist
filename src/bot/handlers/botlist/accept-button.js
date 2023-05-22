import { Handler } from "../../../base/export.js";
import { Database } from "../../../base/classes/Database.js";
import { Colors, ButtonStyle, PermissionsBitField } from "discord.js";
const db = new Database();

export default class extends Handler {
  constructor(client) {
    super(client, {
      name: Handler.Events.InteractionCreate,
      enabled: true,
      type: "Button"
    });
  };

  /**
   * @param {import("discord.js").Interaction} interaction 
   */
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if(!interaction.customId.startsWith("acceptbutton-")) return;

    const id = interaction.customId.split('-')[1];
    const botlist = db.get(`botlist.${interaction.guild.id}`);

    if (!interaction.member.roles.cache.some(role => role.id !== botlist.botstaff) || !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) { 
      const err = new this.Embed()
        .setTitle("Error")
        .setDescription("You dont have <@&" + botlist.botstaff + "> role to use this interaction.")
        .setColor(Colors.Red)
        .setTimestamp()
      return interaction.reply({ embeds: [err], ephemeral: true })
    }

    const bot = await interaction.guild.members.fetch(id).catch(() => null);

    if (bot === null) {
      const err = new this.Embed()
        .setTitle("Error")
        .setDescription("Bot is not added to this server.\nPlease invite the bot to continue process.")
        .setColor(Colors.Red)
        .setTimestamp()

      const row = new this.Row().addComponents(
        new this.Button()
          .setLabel("Add bot (Administrator)")
          .setStyle(ButtonStyle.Link)
          .setURL("https://discord.com/api/oauth2/authorize?client_id=" + id + "&permissions=8&scope=bot%20applications.commands"),
        new this.Button()
          .setLabel("Add bot (No Perm)")
          .setStyle(ButtonStyle.Link)
          .setURL("https://discord.com/api/oauth2/authorize?client_id=" + id + "&permissions=0&scope=bot%20applications.commands")
      );

      return interaction.reply({ embeds: [err], ephemeral: true, components: [row] });
    };

    const data = this.client.queue.getBotInfoFromQueue(id);

    if(!data) {
      const accepted = db.get(`AcceptedBots.${id}`);
      const denied = db.get(`deniedBots.${id}`);
      if(accepted || denied) {
       const err = new this.Embed()
        .setTitle("Error")
        .setDescription("This Bot already Accepted/Denied.")
        .setColor(Colors.Red)
        .setTimestamp()
        return interaction.reply({ embeds: [err], ephemeral: true });
      }
    }

    const user = await interaction.guild.members.fetch(data.ownerId);
    await bot.roles.add(botlist.bot);
    await user.roles.add(botlist.botDeveloper);
    this.client.queue.removeFromQueue(id)

    const embed = new this.Embed()
      .setTitle("Success")
      .setDescription("Bot has been Accepted.")
      .setColor(Colors.Green)
      .setTimestamp()
    interaction.reply({ embeds: [embed], ephemeral: true });

    const statusChannel = interaction.client.channels.cache.get(botlist.statusChannel);

    const statusEmbed = new this.Embed()
      .setTitle("Bot Accepted")
      .setDescription(` Bot <@${id}> has been Accepted by <@${interaction.user.id}>.`)
      .setColor(Colors.Green)
      .setTimestamp()
    statusChannel.send({ embeds: [statusEmbed], content: `<@${user.id}>` });

    db.delete(`bot.${data.botId}`);
    data.status = 1;
    data.actionTaken = true;
    db.push(`AcceptedBots.${data.botId}`, data);
    this.client.queue.fixQueuePositions();

    const userEmbed = new this.Embed()
      .setTitle("Your bot Accepted")
      .setDescription(`Your Bot <@${id}> has been Accepted by "<@${interaction.user.id}>!`)
      .setColor(Colors.Green)
      .setTimestamp()
    return user.send({ embeds: [userEmbed] }).catch(() => null );

  };
};