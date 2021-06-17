require("dotenv").config();
const axios = require("axios");
const Discord = require("discord.js");
const client = new Discord.Client();

const dadJokeURL = "https://icanhazdadjoke.com";
const headers = { "Accept": "application/json" };

async function getRandomDadJoke() {
    const response = await axios.get(dadJokeURL, { headers: headers });
    return response.data;
}

async function searchDadJokes(term) {
    const params = { term: term, limit: 1 }

    const response = await axios.get(`${dadJokeURL}/search`, { params: params, headers: headers });
    return response.data.results[0];
}

client.on("ready", () => {
    console.log(`logged in as ${client.user.tag}`);
});

client.on("guildMemberAdd", member => {
    //Choose a channel to send the welcome message
    const channel = member.guild.channels.cache.find(ch => ch.name === "general");

    //If the channel is not in the server, exit
    if (!channel) return;

    channel.send(`Welcome, ${member}! I'm at your service if you want to hear dad jokes`);
})

client.on("message", async (message) => {

    //"Ignore the message if the bot authored it"
    if (message.author.bot) return;

    const text = message.content.toLowerCase();

    //If the doesn't specifically mention, bot return
    if (text.includes("@here") || text.includes("@everyone")) return;

    let result;

    try {
        //Return if the message doesn't mention the bot
        if (!message.mentions.has(client.user.id)) return;

        const term = text.replace(/<@!\d+>/, "").trim();

        //If there is a search term
        if (term !== "") {
            //Search a joke containing the term
            result = await searchDadJokes(term);
            if (!result) {
                message.reply(`Sorry, got no dad jokes about ${term}. But how about a random dad joke?`);
            }
        }

        //Reply with a random joke
        if (!result) {
            result = await getRandomDadJoke();
        }

        message.reply(result.joke);
    }
    catch (error) {
        message.reply("Sorry, an error occured")
    }
});

//Login to the server using bot token
client.login(process.env.TOKEN);