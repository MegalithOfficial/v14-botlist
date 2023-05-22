import { Handler } from "../../../base/export.js";
import { TextInputStyle } from "discord.js"

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
    if(!interaction.isButton()) return;
    if(interaction.customId !== "addbot-button") return;

      const modal = new this.Modal()
          .setCustomId('botadd-modal')
          .setTitle('Add Bot');

        const row1 = new this.Row().addComponents(
          new this.TextInput()
            .setCustomId('botid')
            .setLabel("Bot Id")
            .setPlaceholder("Example: " + interaction.user.id)
            .setMaxLength(30)
            .setMinLength(14)
            .setRequired(true)
            .setStyle(TextInputStyle.Short),
        );
        const row2 = new this.Row().addComponents(
          new this.TextInput()            
          .setCustomId('botprefix')
            .setLabel("Bot Prefix")
            .setPlaceholder('Example: !')
            .setMaxLength(15)
            .setMinLength(1)
            .setRequired(true)
            .setStyle(TextInputStyle.Short),
        );
        const row3 = new this.Row().addComponents(
           new this.TextInput()
            .setCustomId('extranote')
            .setMaxLength(1000)
            .setMinLength(1)
            .setRequired(false)
            .setPlaceholder('If you want to say somethink to the staff, please Write here.')
            .setLabel("Message to staff")
            .setStyle(TextInputStyle.Paragraph)
        );

        modal.addComponents(row1, row2, row3);
        await interaction.showModal(modal);
  };
};