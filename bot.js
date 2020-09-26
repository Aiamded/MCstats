const Discord = require('discord.js');
//const parser = require('minecraft-motd-parser');
const bot = new Discord.Client();
const moment = require('moment');
bot.login('process.env.BREAD_TOKEN'); //Add your own Discord bot token

const prefix = "." //Bot command prefix
var request = require('request');
var CMD = [".mc", ".stats", ".status", ".stat"] //Command to trigger
var CMD_ip = 'ip'
var CMD_list = 'list'
var CMD_help = 'help'
var mcIP = 'breadstick.info'; //Add your Minecraft server IP
var mcPort = '25565'; //The port of the server, default it 25565
var serverName = 'Breadstick'; //Your server name
var serverUrl = "https://breadstick.info"; //Server website
var serverLogo = "https://www.breadstick.info/images/servericon.jpg"; //Server logo
var messageid = "758940473427099689";
var channelid = "758077888758022245";
var refreshtime = 5 * 1000;

bot.on('message', message => {

	var url = 'https://api.mcsrvstat.us/2/' + mcIP;
	
	if (message.content === prefix + CMD_help) {
		message.channel.send("Commands available:\n   1. mc, stat, stats or status (show server status)\n   2. list (show list of players in the server)\n   3. ip (show server's ip)\n   4. help (show command usage)\n   5. see server live status in <#758077888758022245>\nVisit our website https://www.breadstick.info/ for more info\nFor serious help please ping staff or contact us via email: ancientevileye@gmail.com also consider using <#758078256091234385>");;
		}
	var msg = message.content.slice(1)
		if(["help", "list", "mc", "stats", "status", "ip", "stat"].indexOf(msg) < 0 ) {
			if (message.content === prefix + msg) {
				message.channel.send("wrong command, use .help to display available commands.");;
			}
		}
	if (message.content === prefix + CMD_ip) {
		request(url, function (err, response, body) {
		  if (err) {
			console.log(err);
			return message.reply('Error getting Minecraft server status...');
		  }
		  body = JSON.parse(body);
		  var server_ip = ''
		  if (body.ip) {
			server_ip = "Here are the available IP Address: \n" + "1. " + body.ip + "\n2. breadstick.info" + "\n3. mc.breadstick.info";
		  }
		  
		  message.channel.send(server_ip);
		});
	  };
  
	if (message.content === prefix + CMD_list) {
		request(url, function (err, response, body) {
		  if (err) {
			console.log(err);
			return message.reply('Error getting Minecraft server status...');
		  }
		  body = JSON.parse(body);
		  var playerFields = Array.from(body.players.list).map(x => {
			  return {
				  "name": x,
				  "value": "Online",
				  "inline": true
				}
		    })
			
			const embed = {
				"author": {
					"name": serverName + " Server Status",
					"url": serverUrl,
					"icon_url": "https://www.breadstick.info/images/servericon.jpg"
				},
				"title": "Behold the breadstick survival server!",
				"description": "Visit our [website](https://breadstick.info/) for more information about the server.",
				"url": "https://breadstick.info/",
				"color": 4571171,
				"image": {
					"url": "https://www.breadstick.info/images/motd.png"
				},
				"fields": playerFields,
				"footer": {
				"text": "IP: " + mcIP
				},
			};
			message.channel.send({ embed });		
	});
  };
  if (CMD.includes(message.content)) {
	request(url, function (err, response, body) {
	  if (err) {
		console.log(err);
		return message.reply('Error getting Minecraft server status...');
	  }
	  
	  body = JSON.parse(body);
	  var status = "```CSS\n:Offline```"
	  var color = 16711680
	  if (body.online) {
		status = "```CSS\nOnline```";
		color = 65280
	  }
	  var players = 0
	  if (body.players.online) {
		players += body.players.online;
	  }
	  else {
		players += 0
	  }
	  const embed = {
		"author": {
		  "name": serverName + " Server Status",
		  "url": serverUrl,
		  "color": 63495,
		  "icon_url": serverLogo
		},
		
		"color": color,
		"image": {
		  "url": "https://www.breadstick.info/images/motd.png"
		},
		"fields": [
		  {
			"name": "Status:",
			"value": status,
			"inline": true
		  },
		  {
			"name": "Players Online:",
			"value": "```CSS\n " + body.players.online + " / " + body.players.max + "```",
			"inline": true
		  },
		  {
			"name": "IP Address:",
			"value": "```CSS\n breadstick.info```",
			"inline": true
		  }
		],
		"title": "Behold the breadstick survival server!",
		"description": "Visit our [website](https://breadstick.info/) for more information about the server.",
		"url": "https://breadstick.info/",
		"color": 4571171,
		"footer": {
		  "text": "IP: " + mcIP
		}
	  };
		//message.channel.fetch({around: messageid, limit: 1})
		//.then(msg => {
			//const fetchedMsg = msg.first();
			//fetchedMsg.edit(embed);
		//});
	  message.channel.send({ embed });
		});
	  };
});
	

bot.on('ready', () => {
	  bot.user.setActivity(prefix + CMD)
	
	var initial_player = 0;
	var initial_status = "Offline";
	
	setInterval(function() {
	
		var url = 'https://api.mcsrvstat.us/2/84.17.38.139:25565';
		request(url, function (err, response, body) {
		  if (err) {
			console.log(err);
			return message.reply('Error getting Minecraft server status...');
		  }
		  
		  body = JSON.parse(body);
		  var status = "```CSS\n:Offline```";
		  if (body.online) {
			status = "```CSS\nOnline```";
		  }
		  var players = 0
		  if (body.players.online) {
			players += body.players.online;
		  }
		  else {
			players += 0
		  } 
			if(body.players && body.players.list)
			  var playername = "```" + Array.from(body.players.list).join(", ")  
		  const embed = {
			"author": {
			  "name": serverName + " Server Status Live!",
			  "url": serverUrl,
			  "icon_url": serverLogo
			},
			"image": {
			  "url": "https://www.breadstick.info/images/motd.png"
			},
			"fields": [
			  {
				"name": "Status:",
				"value": status,
				"inline": true,
			  },
			  {
				"name": "Players Online:",
				"value": "```CSS\n " + body.players.online + " / " + body.players.max + "```",
				"inline": true
			  },
			  {
				"name": "IP Address:",
				"value": "```CSS\nbreadstick.info```",
				"inline": true
			  },
			  {
				"name": "Currently online players :",
				"value": '\u200b',
				"inline": true
			  },
			  {
				"name": playername + "```",
				"value": '\u200b',
				"inline": false
			  }
			],
			"title": "Behold the breadstick survival server!",
			"description": "Visit our [website](https://breadstick.info/) for more information about the server.",
			"url": "https://breadstick.info/",
			"color": 4571171,
			"footer": {
			  "text": "IP: " + mcIP
			}
		  };
  
			if(initial_player != players || initial_status != status){
				
				let channel = bot.channels.cache.get(channelid);
				let message = channel.fetch(messageid)
				
				//message.edit("Test");
				channel.messages.fetch({around: messageid, limit: 1})
				.then(msg => {
					const fetchedMsg = msg.first();
					fetchedMsg.edit("Live Server Status, Last Updated - " + moment(message.createdAt).format('dddd, MMMM Do YYYY, h:mm:ss a, [GMT]ZZ'));
					fetchedMsg.edit({embed});
				})
		
				//let channel = bot.channels.cache.get(channelid);
				//channel.send({embed});
			}
			
			
			initial_player = players;
			initial_status = status;
		});
		
		
	}, refreshtime);
});
