const { Telegraf } = require('telegraf')
const Datastore = require('nedb')
require('dotenv').config({ path: './.env' })
let db = new Datastore({ filename: './database', autoload: true })
const bot = new Telegraf(process.env.BOT_TOKEN)
let users = []
setInterval(() => {
  db.find({}, function (err, docs) {
    users = docs
  });
}, 1000)
bot.on('message', async (ctx) => {
  if(typeof ctx.update.message.text != 'undefined'){
    if (ctx.update.message.text.toLowerCase() == 'деньги за подписку') {
      const rand = () => {
        let id = Math.floor(Math.random() * (users.length-1));
        if (typeof users[id].username != 'undefined') {
          ctx.reply(`Случайный пользователь\nhttps://t.me/${users[id].username}`);
        }else{
          ctx.replyWithHTML(`Случайный пользователь\n<a href="tg://user?id=${users[id].id}">${users[id].first_name}</a>`);
        }
      }
      rand()
    }
  }
  if (typeof ctx.update.message.new_chat_participant == 'object') {
    db.find({ username: ctx.update.message.new_chat_participant.username }, function (err, docs) {
      if (docs.length == 0) {
        db.insert(ctx.update.message.new_chat_participant)
      }
    });
    ctx.tg.deleteMessage(ctx.chat.id, ctx.message.message_id)
  }
  if (typeof ctx.update.message.left_chat_participant == 'object') {
    ctx.tg.deleteMessage(ctx.chat.id, ctx.message.message_id)
  }
});
bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
