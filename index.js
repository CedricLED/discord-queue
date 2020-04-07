const Discord = require('discord.js');
const Config = require('./config.js');
const Database = require('./Setup/database/db.js');
const fs = require('fs');

// Creating the discord client
const client = new Discord.Client();

// Attaching the sqlite database to the client
client.sql = Database.sql;
client.database = Database;

// Attaching the config to the client
client.config = Config;


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}\n${client.guilds.size} servers!`);


  client.user.setActivity(`${Config.Prefix}help`, {
    type: "LISTENING"
  });

  // Creating the tables for the database
  client.sql.run(`CREATE TABLE IF NOT EXISTS cart (ServerId TEXT, UserId TEXT, pid TEXT, size TEXT)`);
});

client.on('message', (message) => {
  // If the guild/server isn't available
  if (message.guild.available != true) return;

  if (message.channel.id === Config.cartChannel) {
    if (message.embeds) {
      if (message.embeds.title) {
        if (message.embeds.title.match(/[0-9,A-Z]{6}/)) {
          let title = message.embeds.title;
          let pid = title.match(/[0-9,A-Z]{6}/i);
          let size = title.match(/\(.*?\)/).replace(/\(|\)/g, '');
          client.sql.get(`SELECT * FROM cart WHERE (ServerId, pid, size) = (?, ?, ?)`, [message.guild.id, pid, size]).then(user => {
            if (user) {
              client.fetchUser(user.UserId)
                .then((dm) => {
                  dm.send({
                    embed: {
                      title: `${message.embeds.title}`,
                      url: `${message.embeds.url}`,
                      description: `${message.embeds.description}`,
                      timestamp: new Date()
                    }
                  });
                }).catch((rej) => {
                  console.log(rej);
                });
              Bot.sql.run(`DELETE FROM cart WHERE (ServerId, UserId, pid, size) = (?, ?, ?, ?)`, [user.ServerId, user.UserId, user.size, user.pid]).catch((rej) => {
                console.log(rej);
              });
            } else {
              client.sql.get(`SELECT * FROM cart WHERE (ServerId, pid, size) = (?, ?, ?)`, [message.guild.id, pid, "any"]).then(user => {
                if (user) {
                  client.fetchUser(user.UserId)
                    .then((dm) => {
                      dm.send({
                        embed: {
                          title: `${message.embeds.title}`,
                          url: `${message.embeds.url}`,
                          description: `${message.embeds.description}`,
                          timestamp: new Date()
                        }
                      });
                    }).catch((rej) => {
                      console.log(rej);
                    });
                  Bot.sql.run(`DELETE FROM cart WHERE (ServerId, UserId, pid, size) = (?, ?, ?, ?)`, [user.ServerId, user.UserId, user.size, user.pid]).catch((rej) => {
                    console.log(rej);
                  });
                }
              }).catch((rej) => {
                console.log(rej);
              });
            }
          }).catch((rej) => {
            console.log(rej);
          });
        }
      }
    }
  }
  // If message didn't start with the prefix, then stop it here
  if (!message.content.toLowerCase().startsWith(client.config.Prefix)) return;

  // Removes the prefix from the message, before "slicing" it up to an array ['like', 'this']
  const args = message.content.slice(client.config.Prefix.length).trim().split(/ +/g);
  // The command
  const command = args.shift().toLowerCase();

  fs.exists(`./Setup/commands/${command}.js`, (exists) => {
    if (exists) {
      let fetchCommand = require(`./Setup/commands/${command}.js`);
      fetchCommand.run(client, message, args);
    }
  });
});

// Logging in to the client with the token
client.login(Config.Token);
