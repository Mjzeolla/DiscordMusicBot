const { Client, Intents } = require('discord.js');
const { createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice");
require('dotenv').config();
const { playAudio, stopAudio } = require('./playFunctionality');


const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
const PREFIX = "!"
const mediaQueue = [];

const player = createAudioPlayer();
player.on("error", (error) => {
    console.error(
        "Error:",
        error.message
    );
});





client.on('ready', () => {
    console.log(`Ready! - ${client.user.username}`);
});


client.on('messageCreate', message => {
    if (message.author.bot) return;
    if (!player) return;
    message.player = player;
    message.mediaQueue = mediaQueue;
    if (message.content.startsWith(PREFIX)) {
        const args = message.content.slice(PREFIX.length).split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'play') playAudio(message, args)
        if (command === "disconnect") stopAudio(message)
        if (command === 'pause') player.pause()
        if (command === "resume") player.unpause()

    }

});



client.login(process.env.TOKEN);