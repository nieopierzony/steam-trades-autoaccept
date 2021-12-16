'use strict';

require('dotenv').config();

const Steam = require('./Steam');
const tradeHandler = require('./handlers/trade');

const { MIN_PRICE, STEAM_TOKEN } = process.env;

const client = new Steam({ minPrice: MIN_PRICE, token: STEAM_TOKEN });
client.on('trade', tradeHandler);
