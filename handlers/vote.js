/**
 * @lisance MIT License
 * Copyright (c) 2022 Megalith
 */

const DBL = require('top.gg');
const pool = [];

class VoteCore {

  constructor(options) {
     this.dbl = new DBL(options.token, { webhookPort: options.port || 3000, webhookAuth: options.password });
  } 

  start() {

    this.dbl.webhook.on("ready", (hook) => {
        console.log(
          `Webhook running at http://${hook.hostname}:${hook.port}${hook.path}`
        );
      });

    this.dbl.webhook.on("vote", (vote) => {
        pool.push(vote.user)

        setTimeout(() => {
           const filtered = pool.filter(e => e !== vote.user);
           pool.set(filtered)
        }, 6 * 7200000)

      }); 

  }

  isVoted(userId) {

    if(pool.some(x => x.includes(userId))) {
        return true;
      } else {
        return false;
    }

  }

}

module.exports = { VoteCore };
