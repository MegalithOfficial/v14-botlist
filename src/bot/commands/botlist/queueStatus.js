/**
 * @lisance MIT License
 * Copyright (c) 2023 MegalithOffical
 */

import { Command } from "../../../base/export.js";
import { ChannelType, Colors, ButtonStyle } from "discord.js";

export default class extends Command {
  constructor(client) {
    super(client, {
      name: "checkqueue",
      description: "Check's Queue",
      enabled: true
    });

    this.set(
      new this.SlashCommand()
        .addStringOption(o => o.setName("botid").setDescription("Id of the bot.").setRequired(true)),
    );
  };

  /**
   * @param {import("discord.js").Interaction} interaction 
   * @param {import("discord.js").Guild} guild
   * @param {import("discord.js").GuildMember} member
   */
  async execute({ interaction, guild, member }) {

    const id = interaction.options.getString("botid");

    const data = this.client.queue.getBotInfoFromQueue(id);
    let embedobject = {}

    if (!data) {
      const accepted = db.get(`AcceptedBots.${id}`);
      const denied = db.get(`deniedBots.${id}`);
      console.log(accepted[0].botId)
      if (accepted) {
        embedobject = {
          title: "Bot Status",
          description: `
           <@${id}> is Accepted.
           Bot ID: \`${id}\`
           Bot Status: \`Accepted\`
           Owner: <@${accepted[0].ownerId}>
           Prefix: \`${accepted[0].prefix}\`
          `,
          Color: Colors.Green
        }
      } else if (denied) {
        embedobject = {
          title: "Bot Status",
          description: `
           <@${id}> is Denied.
           Bot ID: \`${id}\`
           Bot Status: \`Denied\`
          `,
          Color: Colors.Red
        }
      } else {
         embedobject = {
          title: "Error",
          description: `Bot Id is invalid.`,
          Color: Colors.Red
        }
      }
    } else {
      embedobject = {
        title: "Bot Status",
        description: `
           <@${id}> is Waiting in queue.
           Bot ID: \`${id}\`
           Bot Status: \`Waiting\`
           Bot Owner: <@${data.ownerId}>
           Bot Queue Location: ${data.queueLocation}/${this.client.queue.length()}
          `,
        Color: Colors.Orange
      }
    }

    const embed = new this.Embed()
      .setTitle(embedobject.title)
      .setDescription(embedobject.description)
      .setColor(embedobject.Color)
      .setTimestamp()
    return interaction.reply({ embeds: [embed], ephemeral: true })

  };
};