const Discord = require('discord.js');

const { TOKEN, PREFIX, OWNER } = require('./auth');
const db = require('./db/db');

const { onReady } = require('./lambdas/onReady');

const client = new Discord.Client();
const diendeeDB = db();

client.on('ready', () => onReady(PREFIX));
client.on('message', message => onReady(message, PREFIX, diendeeDB));
client.login(TOKEN);
