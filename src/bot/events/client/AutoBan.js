import { Event } from "../../../base/export.js";
import { Colors } from "discord.js";
import { Database } from "../../../base/classes/Database.js";
const db = new Database();

export default class extends Event {
  constructor(client) {
    super(client, {
      name: "guildMemberRemove",
      enabled: false
    });
  };

  /** 
   * @param {import("discord.js").GuildMember} member 
   */
  execute(member) { 

    const bots = this.client.queue.getUserInfo(member.id);

    if(!bots) return;

    let bannedBots = [];
    for(let i = 0; i < bot.lenght; i++) {
      member.ban(bot[i]).then(() => {
        bannedBots.push(bot[i]);
      }).catch(() => null );
    };

    const botlist = db.get(`botlist.${member.guild.id}`);
    const logChannel = interaction.client.channels.cache.get(botlist.statusChannel);

    const embed = new this.Embed()
     .setTitle("A Member left the server.")
     .setDescription(`Member ${member.user.tag} left the server. The bots which added by Member is banned. \n Banned Bot Ids: \`${bannedBots.join(", ")}\`. `)
     .setColor(Colors.Red)
     .setTimestamp()
    return logChannel.send({ embeds: [embed] });

  };
};