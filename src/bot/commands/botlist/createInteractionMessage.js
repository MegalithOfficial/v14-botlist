/**
 * @lisance MIT License
 * Copyright (c) 2023 MegalithOffical
 */

import { Command } from "../../../base/export.js";
import { ChannelType, Colors, ButtonStyle } from "discord.js";

export default class extends Command {
  constructor(client) {
    super(client, {
      name: "botlistsetup",
      description: "Init's Botlist system.",
      enabled: true
    });

    this.set(
      new this.SlashCommand()
        .addChannelOption(options => options.setName("interaction-channel").setDescription("The message which is for adding bots.").setRequired(true))
        .addChannelOption(options => options.setName("log-channel").setDescription("Log channel which the accept/deny/botadd logs will be in (Prefer Public Channel).").setRequired(true))
        .addChannelOption(options => options.setName("result-channel").setDescription("The Messages which is used for accepting or denying the bot submit (Prefer Private Channel).").setRequired(true))
        .addRoleOption(options => options.setName("bot-developer").setDescription("The verified bot owner role.").setRequired(true))
        .addRoleOption(options => options.setName("staff").setDescription("The staff who accept/deny bots.").setRequired(true))
        .addRoleOption(options => options.setName("bot-role").setDescription("The verified bot role.").setRequired(true))
    );
  };

  /**
   * @param {import("discord.js").Interaction} interaction 
   * @param {import("discord.js").Guild} guild
   * @param {import("discord.js").GuildMember} member
   */
  async execute({ interaction, guild, member }) {

    const interactionChannel = interaction.options.getChannel("interaction-channel");
    const logChannel = interaction.options.getChannel("log-channel");
    const resultChannel = interaction.options.getChannel("result-channel");
    const botDeveloper = interaction.options.getRole("bot-developer");
    const staff = interaction.options.getRole("staff");
    const botRole = interaction.options.getRole("bot-role");

    const channels = [interactionChannel, logChannel, resultChannel];
    const channelNames = ["interactionChannel", "logChannel", "resultChannel"];
    const InvalidChannels = [];

    for (let i = 0; i < channels.length; i++) {
      if (channels[i].type !== ChannelType.GuildText) {
        InvalidChannels.push(channelNames[i])
      }
    }

    if(InvalidChannels.length > 0) {
      const embed = new this.Embed()
       .setTitle("Error")
       .setDescription(` Channel(s) \`${InvalidChannels.join(", ")}\` must be Channel.`)
       .setColor(Colors.Red)
       .setTimestamp()
      return interaction.reply({ embeds: [embed], ephemeral: true })
    }

    this.db.set(`botlist.${interaction.guild.id}`, {
        messageChannel: interactionChannel.id,
        logChannel: logChannel.id,
        statusChannel: resultChannel.id,
        botDeveloper: botDeveloper.id,
        bot: botRole.id,
        botstaff: staff.id
     });
     
     const row = new this.Row().addComponents(
       new this.Button()
             .setCustomId('addbot-button')
             .setLabel('Add Bot')
             .setStyle(ButtonStyle.Success),
     )

      const messageEmbed = new this.Embed()
      .setTitle('Add Bot')
      .setDescription('Click to "Add Bot" button to open Bot Submit page.')
      .setColor(Colors.Green)
      .setTimestamp()

     interactionChannel.send({ embeds: [messageEmbed], components: [row] });

     const embed = new this.Embed()
      .setTitle('Success')
      .setDescription("Botlist system Setuped successfully.")
      .setColor(Colors.Green)
      .setTimestamp()

     return interaction.reply({ embeds: [embed], ephemeral: true });

  };
};