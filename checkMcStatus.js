const mc = require("minecraft-protocol");

const checkMcStatus = (serverOption, callback) => {

    if (!serverOption.host)
        throw "Missing host parameter";

    if (!serverOption.port)
        serverOption.port = 25565;

    mc.ping({
        host: serverOption.host,
        port: serverOption.port
    }, (err, result) => {
        if (err || !result)
            callback({
                online: false,
                ip: serverOption.host,
                port: serverOption.port
            });
        else {
            const players = {
                max: result.players.max,
                online: result.players.online
            };

            if (result.players.sample)
                players.list = result.players.sample.map(player => player.name);

            callback({
                online: true,
                ip: serverOption.host,
                players: players,
                version: result.version.name,
                protocol: result.version.protocol,
                icon: result.favicon
            });
        }
    });
};


module.exports = checkMcStatus;