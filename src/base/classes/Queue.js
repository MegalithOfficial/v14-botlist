import { Database } from "./Database.js";
const db = new Database();

export class Queue {

  /**
   * The constructor of Queue class.
   */
  constructor() {
    this.queue = db.get('queue') || [];
  };

  /**
   * Add's bot to queue.
   * @param {Object} bot 
   * @returns {void}
   */
  addToQueue(bot) {
    this.queue.push(bot);
    this.fixQueuePositions();
  };

  /** 
   * Gets lenght of the queue.
   * @returns {number}
   */
  length() {
    return this.queue.length;
  }

  /**
   * Removes bot from the queue.
   * @param {String} id 
   * @returns {void}
   */
  removeFromQueue(id) {
    this.queue = this.queue.filter(bot => bot.botId !== id);

    this.fixQueuePositions();
  };

  /**
   * Deletes the Queue.
   * @returns {void}
   */
  destroyQueue() {
    this.queue = [];

    db.set('queue', this.queue);
  };

  /**
   * Find's Bot data from the queue with Id.
   * @param {String} positionOrId 
   * @returns {Object}
   */
  getBotInfoFromQueue(Id) {
    this._refreshQueue()
    const bot = this.queue.find(bot => bot.botId === Id);
    if (bot) {
      return {
        botId: bot.botId,
        status: bot.status,
        ownerId: bot.ownerId,
        prefix: bot.prefix,
        extraNotes: bot.extraNotes,
        actionTaken: bot.actionTaken,
        queuePosition: bot.queuePosition
      };
    } else {
      return null;
    };
  };

  /**
   * Get's User data from the database.
   * @param {String} id 
   * @return {Object}
   */
  getUserInfo(id) {
    const data = db.get(`user.${id}`);
    if (data) {
      return {
        bots: data.bots,
      };
    } else {
      return null;
    };
  };

  /**
   * Fixes Queue position.
   * @returns {void}
   */
  fixQueuePositions() {
    this.queue.forEach((bot, index) => {
      bot.queuePosition = index + 1;
    });

    db.set('queue', this.queue);
  };

  /**
   * Refreshes queue.
   * @private
   * @returns {void}
   */
  _refreshQueue() {
    this.queue = db.get('queue') || [];
  };
};