require('dotenv').config();
var mongoose = require('mongoose');
const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = '+';
const eightBallResponses = ['Odds aren\'t good.', 'No.', 'It will pass.', 'Cannot tell now.',
  'You\'re hot.', 'Count on it.', 'Bet on it.', 'Maybe', 'Possibly',
  'Ask again.', 'No doubt.', 'Absolutely', 'Very likely.', 'Act now.',
  'Stars say no.', 'Can\'t say.', 'Not now.', 'Go for it.', 'Yes.', 'It\'s O.K.'
];
const helpCommands = ['**Help:** Display this menu.',
  '**Flip** / **Coin:** Flip a coin!', '**8Ball:** Ask the magic 8-Ball a question!',
  '**Price [item name]:** Gets a specific item\'s price in Refined Metal from backpack.tf. \n*This can only be used once per 5 minutes! Also, be sure to spell the item exactly as it appears in-game (case-sensitive!).*'
];
var itemArr = [];

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function compareMessage(message, command) {
  var messageSplit = message.content.split(' ')[0];
  return messageSplit.toUpperCase() === prefix + command.toUpperCase();
}

mongoose.connection.on('connected', function() {
  console.log('Connected to database.');
});

mongoose.connection.on('error', function() {
  console.log('Failed to connect to database');
})

mongoose.connect(process.env.MONGODB_URI);

var itemSchema = new mongoose.Schema({
  name: String,
  properties: Object
});

var Item = mongoose.model('Item', itemSchema);

client.on('ready', () => {
  console.log('Bot is ready.');

  // Setting bot's game to "+HELP"
  client.user.setPresence({
    status: 'online',
    game: {
      name: '+HELP'
    }
  });
  var request = require('request');

  function grabNames() {
    request.get('https://backpack.tf/api/IGetPrices/v4?key=' + process.env.BACKPACK_TF_API_KEY, function(err, resp, body) {
      if (JSON.parse(body).response.success === 0) {
        var secondsLeft = parseInt(JSON.parse(body).response.message.split(' ')[13]);
        console.log('Due to backpack.tf only allowing one request per 5 minutes, please wait another', secondsLeft, 'seconds before trying again.');
        setTimeout(grabNames, secondsLeft * 1000);
      } else {
        var count = 0;
        var total = Object.keys(JSON.parse(body).response.items).length;
        var progress;
        for (var key in JSON.parse(body).response.items) {
          if (JSON.parse(body).response.items.hasOwnProperty(key)) {
            count++;
            progress = count / total * 100;
            var newItem = new Item({
              name: key,
              properties: JSON.parse(body).response.items[key]
            });
            itemArr.push(newItem);
            console.log(progress + '%');
          }
        }
        console.log('Done pushing items to local array.');
        Item.collection.insert(itemArr, function(err, docs) {
          if (err) {
            console.log(err);
          } else {
            console.log('Saved', docs.length, 'documents to database.');
          }
        });
      }
    });
  }
  grabNames();
});

client.on('message', message => {
  // +HELP
  if (compareMessage(message, 'help')) {
    message.channel.send('**Commands:**\n\n' + helpCommands.join('\n') + '\n\n*All commands must have a + before them to be registered!*');
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
    if (itemName !== '' && itemArr.includes(itemName)) {
      var request = require('request');
      request.get('https://backpack.tf/api/IGetPrices/v4?key=' + process.env.BACKPACK_TF_API_KEY, function(err, resp, body) {
        if (JSON.parse(body).response.success === 0) {
          message.channel.send('Due to backpack.tf only allowing one request per 5 minutes, please wait another ' + JSON.parse(body).response.message.split(' ')[13] + ' seconds before trying again.');
        } else if (JSON.parse(body).response.items[itemName] !== undefined) {
          message.channel.send(JSON.parse(body).response.items[itemName].prices['6']
            .Tradable.Craftable[0].value + ' Refined');
        }
      });
    } else if (itemName === '') {
      message.channel.send('Please specify an item name!');
    } else {
      message.channel.send('Invalid item name! Be sure to type the name of the item exactly as it appears in-game! (Case sensitive!)');
    }
  }
});

client.on('guildMemberAdd', member => {
  member.guild.defaultChannel.send(`Welcome to the server, ${member}!`);
});

client.login(process.env.DISCORD_TOKEN);
