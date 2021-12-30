const { Client, Intents } = require('discord.js');
require('dotenv').config();
const { playAudio, stopAudio } = require('./playFunctionality');


const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
const PREFIX = "!"
let isReady = false;


client.on('ready', () => {
    isReady = true;
    console.log(`Ready! - ${client.user.username}`);
});


client.on('messageCreate', message => {
    console.log(`${message.author.tag}`);
    if (message.author.bot) return
    if (message.content.startsWith(PREFIX)) {
        const args = message.content.slice(PREFIX.length).split(/ +/);
        console.log(args)
        const command = args.shift().toLowerCase();
        console.log(args)
        if (command === 'play') {
            playAudio(message, args)
        }
        if (command == "stop") {
            stopAudio(message)
        }
    }

});



client.login(process.env.TOKEN);