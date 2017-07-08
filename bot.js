require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = '+';
const eightBallResponses = ['Odds aren\'t good.', 'No.', 'It will pass.', 'Cannot tell now.',
  'You\'re hot.', 'Count on it.', 'Bet on it.', 'Maybe', 'Possibly',
  'Ask again.', 'No doubt.', 'Absolutely', 'Very likely.', 'Act now.',
  'Stars say no.', 'Can\'t say.', 'Not now.', 'Go for it.', 'Yes.', 'It\'s O.K.'
];

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function compareMessage(message, command) {
  var messageSplit = message.content.split(' ')[0];
  return messageSplit.toUpperCase() === prefix + command.toUpperCase();
}

client.on('ready', () => {
  console.log('Bot is ready.');

  // Setting bot's game to "+HELP"
  client.user.setPresence({
    status: 'online',
    game: {
      name: '+HELP'
    }
  });
});

client.on('message', message => {

  // +HELP
  if (compareMessage(message, 'help')) {
    message.channel.send('**Commands:**\n\n **Help:** Display this menu.\n **Nudes:** Get some spicy nudes.\n **Flip** / **Coin:** Flip a coin!\n **8Ball:** Ask the magic 8-Ball a question!\n\n *All commands must have a + before them to be registered!*');
  }

  // +NUDES
  else if (compareMessage(message, 'nudes')) {
    var picPath = 'nudes/nudes-' + randomIntFromInterval(1, 11) + '.png';
    message.channel.send('Here are some spicy nudes, just like you asked.', {
      file: picPath
    });
  }

  // +FLIP or +COIN
  else if (compareMessage(message, 'flip') || compareMessage(message, 'coin')) {
    var coinVal = randomIntFromInterval(0, 1);
    // 0 - HEADS
    // 1 - TAILS
    if (coinVal === 0) {
      message.channel.send('Heads!');
    } else if (coinVal === 1) {
      message.channel.send('Tails!');
    }
  }

  // +8Ball
  else if (compareMessage(message, '8ball')) {
    var responseNum = randomIntFromInterval(0, eightBallResponses.length);
    message.channel.send(eightBallResponses[responseNum]);
  }
});

client.on('guildMemberAdd', member => {
  member.guild.defaultChannel.send(`Welcome to the server, ${member}!`);
});

client.login(process.env.DISCORD_TOKEN);
