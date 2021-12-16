'use strict';

const EventEmitter = require('events');
const fetch = require('cross-fetch');
const qs = require('node:querystring');

const jsonToFormData = require('./jsonToFormData');

const API_URL = 'http://api.steampowered.com';
const { SESSION_ID, COOKIES } = process.env;

module.exports = class Steam extends EventEmitter {
  constructor(options = {}) {
    super();
    this.minPrice = options?.minPrice;
    this.token = options?.token;

    this.cachedTrades = [];
    this.subscribeTrade();
  }

  subscribeTrade() {
    const DELAY = 2 * 1000;

    const fn = async () => {
      // Filter trades that are not cached
      const trades = (await this.checkTrades()).filter(el => !this.cachedTrades.includes(el.tradeofferid));

      // If it's first iteration, add all ids to cache
      if (this.cachedTrades.length === 0) {
        this.cachedTrades = trades.map(el => el.tradeofferid);
        return;
      }

      // Emit for each trade
      trades.forEach(trade => this.emit('trade', this, trade));
      this.cachedTrades.push(...trades.map(el => el.tradeofferid));
    };

    fn();
    setInterval(fn, DELAY);
  }

  async checkTrades() {
    const query = qs.stringify({ key: this.token, get_received_offers: 1, time_historical_cutoff: 100 });
    const req = await fetch(`${API_URL}/IEconService/GetTradeOffers/v1/?${query}}`);
    const res = await req.json();

    if (!res?.response) throw new Error('Не получил список трейдов');

    const trades = res.response?.trade_offers_received;
    return trades ?? null;
  }

  async acceptTrade(tradeID, partner) {
    const body = jsonToFormData({ sessionid: SESSION_ID, serverid: 1, partner, tradeofferid: tradeID, captcha: '' });

    const options = {
      method: 'POST',
      body,
      headers: {
        ...body.getHeaders(),
        Cookie: COOKIES,
        Referer: `https://steamcommunity.com/tradeoffer/${tradeID}`,
      },
    };
    const req = await fetch(`https://steamcommunity.com/tradeoffer/${tradeID}/accept`, options);
    const res = await req.json();

    return !!res?.tradeid;
  }
};
