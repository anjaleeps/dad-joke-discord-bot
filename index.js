require("dotenv").config();
const config = require("./config.json");
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
    const params = {
        term: term,
        limit: 1
    }

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
    if (!channel) {
        console.log(channel);
        return;
    };

    channel.send(`Welcome, ${member}! I'm at your service if you want to hear dad jokes`);
})

client.on("message", async (message) => {

    //"Ignore the message if the bot authored it"
    if (message.author.bot) return;


    //Check if the user message has the phrase "dad joke"
    const text = message.content.toLocaleLowerCase();
    if (!text.includes("dad joke")) return;

    let result;

    try {
        //If a user has asked a dad joke about something specific
        const parts = text.split("about");
        if (parts.length > 1) {
            //Get the search term
            const term = parts[parts.length - 1].trim();
            //Search a joke containing the term
            result = await searchDadJokes(term);
            if (!result) {
                message.reply(`Sorry, got no dad jokes about ${term}. But how about a random joke?`);
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