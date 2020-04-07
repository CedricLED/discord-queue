const Discord = require('discord.js');
exports.run = (Bot, message, args) => {
  if(args.length < 2) {
    message.reply("Missing command arg");
    return;
  }
  if(args.length > 2) {
    message.reply("un-recognised command arg");
    return;
  } else {
    let pid = args[0];
    let size = args[1];
    if(pid.match(/[0-9,A-Z]{6}/)) {
      if(size.match(/^[4-9]|[0-1][0-5]/) || size == "any") {
        Bot.sql.run(`INSERT INTO cart (ServerId, UserId, pid, size) VALUES (?, ?, ?, ?)`, [message.guild.id, message.author.id, pid, size]);
        message.reply(`Reserved ${pid} size: ${size}`);
      }
    }
  }
};
