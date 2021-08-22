const Discord = require("discord.js");
const dotenv = require("dotenv");
const ytdl = require("ytdl-core");
const google = require("googleapis");
const fs = require("fs");
//const config = require("./config.json");
const commands = require("./scripts/commandsReader")(process.env.prefix);

const youtube = new google.youtube_v3.Youtube({
    version: 'v3',
    auth: process.env.googleToken
});

const client = new Discord.Client();

const ytdlOptions = { filter: 'audioonly' };

const servers = {};


client.once("ready", () => {
    loadServers();
    console.log(`Bot ready: ${client.user.tag}!`);
});


// Multiplos servidores
client.on("guildCreate", (guild) => {
    servers[guild.id] = {
        connection: null,
        dispatcher: null,
        fila: [

        ],
        playing: false
    }

    saveServer(guild.id);
});

//evento que lida com os comandos
client.on("message", async (msg) => {
    if (!msg.author.bot && msg.content.charAt(0) === "!") {
        const verifyContent = msg.content.split(" ");
        if (commands[verifyContent[0]]) {
            commands[verifyContent[0]](msg)
        };
    }
    if (!msg.guild) return;
    if (!msg.content.startsWith(process.env.prefix)) return;

    //!join

    if (msg.content === process.env.prefix + 'join') {
        try {
            if (msg.member.voice.channel) {
                servers[msg.guild.id].connection = await msg.member.voice.channel.join();
            } else {
                msg.reply('Você precisa estar conectado a um canal de voz!').then(msg => msg.delete({ timeout: 7000 })).catch(a => { });
            }
        } catch (error) {
            console.log('Erro ao entrar no canal de voz!');
            console.log(error);
        }
    };

    //!leave
    if (msg.content === process.env.prefix + 'leave') {
        if (msg.member.voice.channel) {
            servers[msg.guild.id].connection = await msg.member.voice.channel.leave();
            servers[msg.guild.id].connection = null;
            servers[msg.guild.id].dispatcher = null;
            servers[msg.guild.id].fila = [];
            servers[msg.guild.id].playing = false;
        } else {
            msg.reply('Você precisa estar conectado a um canal de voz!').then(msg => msg.delete({ timeout: 7000 })).catch(a => { });
        }
    };

    //!play
    if (msg.content.startsWith(process.env.prefix + 'play')) {
        if (msg.member.voice.channel) {
            let playMusic = msg.content.slice(6);

            if (playMusic.length === 0) {
                msg.channel.send('Link inválido!');
                return;
            }

            if (servers[msg.guild.id].connection === null) {
                try {
                    if (msg.member.voice.channel) {
                        servers[msg.guild.id].connection = await msg.member.voice.channel.join();
                    } else {
                        msg.reply('Você precisa estar conectado a um canal de voz!').then(msg => msg.delete({ timeout: 7000 })).catch(a => { });
                    }
                } catch (error) {
                    console.log('Erro ao entrar no canal de voz!');
                    console.log(error);
                }
            }

            if (ytdl.validateURL(playMusic)) {
                servers[msg.guild.id].fila.push(playMusic);
                //console.log("Na fila: ", playMusic);
                playTheMusic(msg);

            } else {
                youtube.search.list({
                    q: playMusic,
                    part: 'snippet',
                    fields: 'items(id(videoId), snippet(title, channelTitle))',
                    type: 'video'
                }, function (err, resultado) {
                    if (err) {
                        console.log(err)
                    }

                    if (resultado) {
                        const id = resultado.data.items[0].id.videoId;
                        playMusic = 'https://www.youtube.com/watch?v=' + id;
                        servers[msg.guild.id].fila.push(playMusic);
                        //console.log("Na fila: ", playMusic);
                        playTheMusic(msg);

                    }
                });
            }
            // playTheMusic();

        } else {
            msg.reply('Você precisa estar conectado a um canal de voz!').then(msg => msg.delete({ timeout: 7000 })).catch(a => { });
        }
    };

    //!pause
    if (msg.content === process.env.prefix + 'pause') {
        if (msg.member.voice.channel) {
            servers[msg.guild.id].dispatcher.pause();
        } else {
            msg.reply('Você precisa estar conectado a um canal de voz!').then(msg => msg.delete({ timeout: 7000 })).catch(a => { });
        }
    };

    //!resume
    if (msg.content === process.env.prefix + 'resume') {
        if (msg.member.voice.channel) {
            servers[msg.guild.id].dispatcher.resume();
        } else {
            msg.reply('Você precisa estar conectado a um canal de voz!').then(msg => msg.delete({ timeout: 7000 })).catch(a => { });
        }
    };

});

//Bem vindo para novos membros 
client.on("guildMemberAdd", async (member) => {
    const welcomeChannel = member.guild.channels.cache.find(channel => channel.id === process.env.welcomeChannelId);
    //welcomeChannel.send(`O usuário ${member.user} acabou de entrar no servidor! :)`);

    let embed = new Discord.MessageEmbed()
        .setColor('#68F586')
        .setAuthor(member.user.tag, member.user.displayAvatarURL())
        .setTitle(`:space_invader: **Boas-vindas** :space_invader:`)
        .setImage('http://1.bp.blogspot.com/-8Hq5MSUIr-E/T-e2NQy5m6I/AAAAAAAACGA/TkyqcvVdNXI/s1600/meu+malvado+favorito-gifs+linda+lima+(5).gif')
        .setDescription(`${member.user}, Boas-vindas ao servidor The universe TI, respeite as regras e divirta-se!!`)
        .addField('', '')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
        .setFooter('ID do usuário: ' + member.user.id)
        .setTimestamp();
    await welcomeChannel.send(embed);
    member.send(embed);
});

//função para tocar a musica
const playTheMusic = (msg) => {
    if (servers[msg.guild.id].playing === false) {
        const musicQueue = servers[msg.guild.id].fila[0];
        servers[msg.guild.id].playing = true;
        servers[msg.guild.id].dispatcher = servers[msg.guild.id].connection.play(ytdl(musicQueue, ytdlOptions));
        servers[msg.guild.id].dispatcher.on('finish', () => {
            servers[msg.guild.id].fila.shift();
            servers[msg.guild.id].playing = false;

            if (servers[msg.guild.id].fila.length > 0) {
                playTheMusic();
            } else {
                servers[msg.guild.id].dispatcher = null
            }
        });
    }

}

//Pegando novamente os IDs e disponibilizando na aplicação
const loadServers = () => {
    fs.readFile('serverList.json', 'utf8', (err, data) => {
        if (err) {
            console.log('Erro ao ler o arquivo json: ');
            console.log(err)
        } else {
            const objRead = JSON.parse(data);
            for (let i in objRead.servers) {
                servers[objRead.servers[i]] = {
                    connection: null,
                    dispatcher: null,
                    fila: [

                    ],
                    playing: false
                }
            }
        }
    });
}

//armazenando os IDs dos servidores dentro do arquivo json 
const saveServer = (IdNewServer) => {
    fs.readFile('serverList.json', 'utf8', (err, data) => {
        if (err) {
            console.log('Erro ao ler arquivo: ');
            console.log(err)
        } else {
            const objRead = JSON.parse(data);
            objRead.servers.push(IdNewServer);

            const objWrite = JSON.stringify(objRead);

            fs.writeFile('serverList.json', objWrite, 'utf8', () => { });
        }
    });
}

dotenv.config();
client.login(process.env.token);