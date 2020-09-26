const Discord = require("discord.js");
const moment = require("moment");
const request = require("request");

const settings = require("./settings.json");

const bot = new Discord.Client();
bot.login(settings.discord.token);

const baseEmbed = {
    author: {
        name: settings.server.name + " Server Status",
        url: settings.server.url,
        color: 63495,
        icon_url: settings.server.logo
    },
    color: 0x00FF00,
    title: settings.discord.embed.title,
    description: `Visit our [website](${settings.server.url}) for more information about the server.`,
    image: { url: settings.server.motd },
    url: settings.server.url,
    footer: {
        text: "IP: " + settings.server.ip
    }
};

const aliases = {
    stats: "mc",
    status: "mc",
    stat: "mc"
};
const commands = {
    mc: message => {
        const sentmsg = message.reply("Please wait...");
        request(settings.apiURL, (err, response, body) => {
            if (err) {
                console.log(err);
                return message.reply("Error getting Minecraft server status...");
            }

            const data = JSON.parse(body);
            let status = "```CSS\nOffline```";
            let color = 0xFF0000;
            let players = 0;
            if (data.online) {
                status = "```CSS\nOnline```";
                color = 0x00FF00;
                if (data.players.online)
                    players = data.players.online;
            }
            const fields = [
                {
                    name: "Status",
                    value: status,
                    inline: true
                },
                {
                    name: "IP Address",
                    value: "```CSS\n" + settings.server.hostname + "```",
                    inline: true
                }
            ];
            if (players > 0)
                fields.push({
                    name: "Players Online",
                    value: "```CSS\n" + players + " / " + data.players.max + "```",
                    inline: true
                });
            const embed = {
                ...baseEmbed,
                color,
                fields,
                footer: {
                    text: baseEmbed.footer.text + (data.online ? ` | ${data.software} ${data.version}` : "")
                }
            };
            sentmsg.then(msg => msg.edit({ content: "", embed }));
        });
    },
    ip: message => {
        // We don't really need to call the API for this
        const content = "```diff\n" + `Here are the available IP Addresses: \n+ ${settings.server.hostname}\n+ ${settings.server.ip}` + "```";
        message.channel.send(content);
    },
    list: message => {
        const sentmsg = message.reply("Please wait...");
        request(settings.apiURL, (err, response, body) => {
            if (err) {
                console.log(err);
                return message.reply("Error getting Minecraft server status...");
            }
            const data = JSON.parse(body);
            let playerFields = [{
                name: "No players online",
                value: "‎"
            }];
            if (data.players && data.players.list)
                playerFields = data.players.list.map(username => ({
                    name: username,
                    value: "Online",
                    inline: true
                }));

            const embed = {
                ...baseEmbed,
                fields: playerFields,
                footer: {
                    text: baseEmbed.footer.text + (data.online ? ` | ${data.software} ${data.version}` : "")
                }
            };
            sentmsg.then(msg => msg.edit({ content: "", embed }));
        });
    },
    help: message => {
        const embed = {
            author: baseEmbed.author,
            title: "Commands list",
            color: baseEmbed.color,
            fields: [
                {
                    name: "mc | stat | stats | status",
                    value: "Show server status"
                },
                {
                    name: "list",
                    value: "List players in the server"
                },
                {
                    name: "ip",
                    value: "Show server IP"
                },
                {
                    name: "help",
                    value: "This command :)"
                },
                {
                    name: "‎",
                    value: [
                        `See live server status in <#${settings.discord.channel}>`,
                        baseEmbed.description, //efficiency =)
                        `For serious help please either ping staff, use <#${settings.discord.supportChannel}>, or contact us via email: ${settings.email}`
                    ].join("\n")
                }
            ]
        };
        message.channel.send({ embed });
    }
};

// Now we get to the fun part of handling commands
bot.on("message", message => {
    if (message.author.bot) // Checks if the author of message is bot, we can ignore
        return;
    if (!message.content.startsWith(settings.discord.prefix)) // Checks if the message starts with the prefix
        return;
    const cmd = message.content.substr(settings.discord.prefix.length);

    // Here, we access the alias object and find the command
    if (aliases[cmd])
        commands[aliases[cmd]](message); // This looks a bit ugly
    else if (commands[cmd])
        commands[cmd](message);
});

bot.on("ready", () => {
    bot.user.setActivity(settings.discord.prefix + "mc");
    console.log("Ready!");

    let previousPlayers = "";
    let previousStatus = "";

    setInterval(() => {
        request(settings.apiURL, async(err, response, body) => {
            if (err)
                return console.log(err);

            const data = JSON.parse(body);
            let status = "```CSS\nOffline```";
            let color = 0xFF0000;
            if (data.online) {
                status = "```CSS\nOnline```";
                color = 0x00FF00;
            }

            // Here we need a bit more flexibility for the fields
            const fields = [
                {
                    name: "Status",
                    value: status,
                    inline: true
                },
                {
                    name: "IP Address",
                    value: "```CSS\n" + settings.server.hostname + "```",
                    inline: true
                }
            ];

            let players = "";
            if (data.players && data.players.list) {
                players = data.players.list.join(", ");
                fields.push({
                    name: "Players Online",
                    value: "```CSS\n " + data.players.online + " / " + data.players.max + "```",
                    inline: true
                });
                fields.push({
                    name: "Currently online players",
                    value: "```" + players + "```",
                    inline: false
                });
            } else
                fields.push({
                    name: "Players Online",
                    value: "```No players online```",
                    inline: true
                });

            const embed = {
                ...baseEmbed,
                author: {
                    ...baseEmbed.author,
                    name: settings.discord.embed.liveHeader
                },
                color,
                fields,
                footer: {
                    text: `${baseEmbed.footer.text} | ${data.software} ${data.version}`
                }
            };

            if (previousPlayers !== players || previousStatus !== status) {
                const channel = await bot.channels.fetch(settings.discord.channel);
                const message = await channel.messages.fetch(settings.discord.message);

                message.edit({
                    content: "Live Server Status, Last Updated - " + moment(message.createdAt).format("dddd, MMMM Do YYYY, h:mm:ss a, [GMT]ZZ"),
                    embed
                });
            }

            previousPlayers = players;
            previousStatus = status;
        });
    }, settings.refresh);
});