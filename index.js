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

  switch (true) {
    case content === '!info':
      database.getCandidateInfo(con)
        .then(results => {
          let msgs = ``;
          results.forEach(element => {
            msgs += "\n\nnomor urut : "+element.id_kandidat+ "\nnama : "+element.nama_kandidat+"\njml suara saat ini : "+element.poin;
          });
          let ket = "\n\nKetik '!vote-_nomor urut kandidat_' untuk memilih kandidat \ncontoh : *!vote-1*";
          msgs = "INFO KANDIDAT!" + msgs + ket;
          client.sendMessage(message.from, msgs);
        })
        .catch(console.error);
      break;
    case content.slice(0, 6) === '!vote-':
    
      let candidateId = content.split('-').pop();
      const candidates = await database.getCandidates(con);
      const voters = await database.getContactsVoters(con)
      
      const hasVoted = voters.includes(from);
      if (hasVoted) {
        client.sendMessage(message.from, `you've already voted. you can only vote once!`);
        return;
      }

      try {
        if (candidateId > candidates.length) {
          client.sendMessage(message.from, "there's no such candidate");
          return;
        }
        const candidate = candidates.find(el => el.id_kandidat == candidateId);
        if (!candidate) return;
        
        await database.insertDataVote(con, from, candidate.id_voting, candidate.id_kandidat, dateNow);
        client.sendMessage(message.from, `voting succes ${candidateId}`);
      } catch (error) {
        console.log(error)
      }
        break;
    default:
      // TODO :: change this default msg to the help info
      client.sendMessage(message.from, `I'm sorry for this annoying reply. pls wait until i reply ur msg by myself!`);
  }
});

client.initialize();
 