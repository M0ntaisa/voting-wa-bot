const qrcode = require('qrcode-terminal');
const database = require('./database');

const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {
  const content = message.body;
  const from = message.from.split("@").shift();
  const date = new Date();
  date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000 + 16 * 60 * 60 * 1000);
  const dateNow = date.toISOString().substring(0, 19).replace('T', ' ');
  const con = await database.getConnection();

  
});

client.initialize();
 