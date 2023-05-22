import { Handler } from "../../../base/export.js";
import { Database } from "../../../base/classes/Database.js";
import { TextInputStyle, Colors } from "discord.js";
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
    if(!interaction.customId.startsWith("denybutton-")) return;

    const id = interaction.customId.split('-')[1];

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

      const modal = new this.Modal()
        .setCustomId(`denymodal-${id}`)
        .setTitle('Deny form');

      const row = new this.Row().addComponents(
        new this.TextInput()
          .setCustomId('reason')
          .setLabel("Reason")
          .setMaxLength(1000)
          .setMinLength(1)
          .setRequired(false)
          .setStyle(TextInputStyle.Paragraph),
      );

        modal.addComponents(row);
        await interaction.showModal(modal);

  };
};