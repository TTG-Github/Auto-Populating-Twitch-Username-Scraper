// ------------------------------------------------------------
// --- Created By TTG Github
// ------------------------------------------------------------
// --- Author: TTG Github
// --- Website: https://thetechgame.com/Github
// --- Version: 1.0.0
// ------------------------------------------------------------

// IMPORTS
const tmi = require('tmi.js');
const fs = require('fs');
const lineReader = require('line-reader');

// CHANNEL COLLECTION
var UpdatedChannels = [];

// INITIATE THE BOT
TwitchScraper();

// FUNCTION OF SCRAPER + LOG
function TwitchScraper() {

  // CLEAR THE CONSOLE
  console.clear();

  // IF LOG FILES DO NOT EXIST CREATE THEM
  if (!fs.existsSync("./data/")) { fs.mkdirSync("data"); }
  if (!fs.existsSync("./data/source.txt")) { fs.writeFileSync("./data/source.txt", ""); }
  if (!fs.existsSync("./data/users.txt")) { fs.writeFileSync("./data/users.txt", ""); }

  // RESET CHANNELS TO READ THE NEW LIST
  UpdatedChannels = [];

  // READ EACH LINE, PUSH TO CHANNEL ARRAY
  lineReader.eachLine('./data/source.txt', function(user) {
    UpdatedChannels.push(user);
  });

  // CONNECT TO TWITCH CLIENT WITH EACH CHANNEL IN ARRAY
  const client = new tmi.Client({
    options: { debug: true },
    connection: {
      secure: true,
      reconnect: true
    },
    identity: {
      username: 'SysCruel',
      password: 'oauth:0t20a0dpf2y4ezibq3xx3832swpmji'
    },
    channels: UpdatedChannels
  });

  // CONNECT CLIENT
  client.connect();

  // DETECT MESSAGES
  client.on('message', (channel, tags, message, self) => {

      // USERNAME OF USER SPEAKING, SOURCE CHANNEL THEY ARE SPEAKING ON
      // MIGHT BE A BETTER WAY TO DO THIS BUT ITS OKAY
      const thisUsername = tags.username.replace('@', '');
      const thisChannel = channel.replace('#', '');

      ThreadChannel(thisUsername, thisChannel);

      function ThreadChannel(user, channel) {

        // ADD TO THE LIST OF LOGS FOR YOU
        fs.appendFile("./data/users.txt", "Username: " + user + "\nProfile: https://twitch.tv/" + user + "\nSource: " + channel + "\n\n", (err) => {
          if (err) { console.log(err);return; }

          // CHECK IF USERNAME EXISTS IN LOG FILES
          Users = fs.readFileSync("./data/users.txt", "utf-8");
          Source = fs.readFileSync("./data/source.txt", "utf-8");

          // ADDS CHANNEL TO SOURCE LIST IF IT ISN'T THERE YET
          if (!Source.includes(channel)) {
            fs.appendFile("./data/source.txt", channel + "\n", (err) => {
              if (err) { console.log(err);return; }
            });
          }

          // WILL ADD SCRAPED USER TO LIST TO CREATE A REVOLVING DOOR
          if (!Source.includes(user)) {
            fs.appendFile("./data/source.txt", user + "\n", (err) => {
              if (err) { console.log(err);return; }
            });
          }

          // WILL POPULATE A LOG FILE FOR YOU IF THEY DON'T EXIST IN IT
          if (!Users.includes(user)) {
            fs.appendFile("./data/users.txt", user + "\n", (err) => {
              if (err) { console.log(err);return; }
            });
          }
        });
      }
  });
}

// RESTARTS + LOADS NEWLY SCRAPED CHANNELS
setTimeout(TwitchScraper, 300000);