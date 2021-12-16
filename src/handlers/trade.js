'use strict';

const Logger = require('../Logger');

const { MIN_PRICE } = process.env;

module.exports = async (client, trade) => {
  try {
    const { items_to_receive: itemsToReceive } = trade;
    const csGoItems = itemsToReceive.filter(el => el.appid === 730);
    if (csGoItems?.length === 0) return Logger.info('У трейда нет предметов на получение');

    const prices = csGoItems.map(el => +el.est_usd / 100);
    if (!prices.find(i => i >= MIN_PRICE)) return Logger.info('У трейда нет нужных вещей');

    const success = await client.acceptTrade(trade.tradeofferid, trade.accountid_other);
    if (success) Logger.info('Успешно одобрен трейд');
    else Logger.error('Не удалось принять трейд');

    return true;
  } catch (err) {
    Logger.error(`[Trade handler] ${err.message ?? err}`);
    return false;
  }
};
