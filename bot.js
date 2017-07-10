require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = '+';
const eightBallResponses = ['Odds aren\'t good.', 'No.', 'It will pass.', 'Cannot tell now.',
  'You\'re hot.', 'Count on it.', 'Bet on it.', 'Maybe', 'Possibly',
  'Ask again.', 'No doubt.', 'Absolutely', 'Very likely.', 'Act now.',
  'Stars say no.', 'Can\'t say.', 'Not now.', 'Go for it.', 'Yes.', 'It\'s O.K.'
];
const helpCommands = ['**Help:** Display this menu.', '**Nudes:** Get some spicy nudes.',
  '**Flip** / **Coin:** Flip a coin!', '**8Ball:** Ask the magic 8-Ball a question!',
  '**Price [item name]:** Gets a specific item\'s price in Refined Metal from backpack.tf. \n*This can only be used once per 5 minutes! Also, be sure to spell the item exactly as it appears in-game (case-sensitive!).*'
]

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
    message.channel.send('**Commands:**\n\n' + helpCommands.join('\n') + '\n\n*All commands must have a + before them to be registered!*');
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

  // +Price
  else if (compareMessage(message, 'price')) {
    var itemName = message.content.split(/\s+/g).slice(1).join(' ');
    var request = require('request');
    request.get('https://backpack.tf/api/IGetPrices/v4?key=' + process.env.BACKPACK_TF_API_KEY, function(err, resp, body) {
      if (JSON.parse(body).response.success === 0) {
        message.channel.send('Due to backpack.tf only allowing one request per 5 minutes, please wait another ' + JSON.parse(body).response.message.split(' ')[13] + ' seconds before trying again.');
      } else if (JSON.parse(body).response.items[itemName] !== undefined) {
        message.channel.send(JSON.parse(body).response.items[itemName].prices['6']
          .Tradable.Craftable[0].value + ' Refined');
      } else {
        message.channel.send('Invalid item name! Be sure to type the name of the item exactly as it appears in-game! (Case sensitive!)');
      }
    });
  }
});

client.on('guildMemberAdd', member => {
  member.guild.defaultChannel.send(`Welcome to the server, ${member}!`);
});

client.login(process.env.DISCORD_TOKEN);
