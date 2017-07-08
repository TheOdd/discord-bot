require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = '+';

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}


client.on('ready', () => {
  console.log('Bot is ready.');
});

client.on('message', message => {
  if (message.content.toUpperCase() === prefix + 'nudes'.toUpperCase()) {
    var picPath = 'nudes/nudes-' + randomIntFromInterval(1, 11) + '.png';
    message.channel.send('Here are some spicy nudes, just like you asked.', {
      file: picPath
    });
  }
});

client.on('guildMemberAdd', member => {
  member.guild.defaultChannel.send(`Welcome to the server, ${member}!`);
});

client.login(process.env.DISCORD_TOKEN);
