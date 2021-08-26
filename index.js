const Discord = require("discord.js");
const dotenv = require("dotenv");
const ytdl = require("ytdl-core");
const google = require("googleapis");
const firebase = require("firebase");
const fs = require("fs");
const config = require("./config.json");
const commands = require("./scripts/commandsReader")(config.prefix);

const youtube = new google.youtube_v3.Youtube({
    version: 'v3',
    auth: config.googleToken
});

const client = new Discord.Client();

// Initialize Firebase
var firebaseConfig = {
    apiKey: config.keyF,
    authDomain: config.authDomain,
    projectId: "mrxbot",
    storageBucket: "mrxbot.appspot.com",
    messagingSenderId: config.messagingSenderId,
    appId: config.appId
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();


//Play music
const ytdlOptions = { filter: 'audioonly' };
const servers = {};


//Recarregando os dados do bot caso seja desligado
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

//levels up 
client.on("message", async (msg) => {
    if (msg.channel.type === 'dm') return;
    if (msg.author.bot) return;

    database.ref(`Servidores/Levels/${msg.guild.id}/${msg.author.id}`)
        .once('value').then(async function (db) {
            if (db.val() === null) {
                database.ref(`Servidores/Levels/${msg.guild.id}/${msg.author.id}`)
                    .set({
                        xp: 0,
                        level: 1
                    })
            } else {
                let generateXP = Math.floor(Math.random() * 10) + 1;

                if (db.val().level * 100 <= db.val().xp) {
                    if (db.val().level + 1 === '5') {
                        msg.member.addRole('879772742075949107');
                    }
                    database.ref(`Servidores/Levels/${msg.guild.id}/${msg.author.id}`)
                        .update({
                            xp: 0,
                            level: db.val().level + 1
                        });
                    let embed = new Discord.MessageEmbed()
                        .setColor('#68F586')
                        //.setAuthor(member.user.tag, member.user.displayAvatarURL())
                        .setTitle(`:space_invader: **Levels up** :space_invader:`)
                        .setDescription(`Parabéns ${msg.author}, você upou para o level ${db.val().level + 1}!`)
                        .setTimestamp();
                    await msg.channel.send(embed);
                } else {
                    database.ref(`Servidores/Levels/${msg.guild.id}/${msg.author.id}`)
                        .update({
                            xp: db.val().xp + generateXP
                        })
                }
            }
        });
})


//evento que lida com os comandos
client.on("message", async (msg) => {
    if (!msg.author.bot && msg.content.charAt(0) === "!") {
        const verifyContent = msg.content.split(" ");
        if (commands[verifyContent[0]]) {
            commands[verifyContent[0]](msg)
        };
    }
    if (!msg.guild) return;
    if (!msg.content.startsWith(config.prefix)) return;

    //!join

    if (msg.content === config.prefix + 'join') {
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
    if (msg.content === config.prefix + 'leave') {
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
    if (msg.content.startsWith(config.prefix + 'play')) {
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
    if (msg.content === config.prefix + 'pause') {
        if (msg.member.voice.channel) {
            try {
                servers[msg.guild.id].dispatcher.pause();
            } catch { }
        } else {
            msg.reply('Você precisa estar conectado a um canal de voz!').then(msg => msg.delete({ timeout: 7000 })).catch(a => { });
        }
    };

    //!resume
    if (msg.content === config.prefix + 'resume') {
        if (msg.member.voice.channel) {
            try {
                servers[msg.guild.id].dispatcher.resume();
            } catch { }
        } else {
            msg.reply('Você precisa estar conectado a um canal de voz!').then(msg => msg.delete({ timeout: 7000 })).catch(a => { });
        }
    };


    //end = para de tocar todas as musicas e limpa a fila
    if (msg.content === config.prefix + 'end') {
        if (msg.member.voice.channel) {
            try {
                servers[msg.guild.id].dispatcher.end();
            } catch { }
        } else {
            msg.reply('Você precisa estar conectado a um canal de voz!').then(msg => msg.delete({ timeout: 7000 })).catch(a => { });
        }
    };

    //skip = passa para a proxima musica 
    if (msg.content === config.prefix + 'skip') {
        if (msg.member.voice.channel) {
            if (servers[msg.guild.id].fila.length > 1) {
                servers[msg.guild.id].fila.shift();
                servers[msg.guild.id].playing = false;
                console.log(servers[msg.guild.id].fila);
                playTheMusic(msg);
            } else {
                msg.reply('Nenhuma musica em fila!').then(msg => msg.delete({ timeout: 7000 })).catch(a => { });
            }
        } else {
            msg.reply('Você precisa estar conectado a um canal de voz!').then(msg => msg.delete({ timeout: 7000 })).catch(a => { });
        }
    };

});

//Bem vindo para novos membros 
client.on("guildMemberAdd", async (member) => {
    const welcomeChannel = member.guild.channels.cache.find(channel => channel.id === config.welcomeChannelId);
    //welcomeChannel.send(`O usuário ${member.user} acabou de entrar no servidor! :)`);

    let embed1 = new Discord.MessageEmbed()
        .setColor('#68F586')
        .setAuthor(member.user.tag, member.user.displayAvatarURL())
        .setTitle(`:space_invader: **Boas-vindas** :space_invader:`)
        .setImage('http://1.bp.blogspot.com/-8Hq5MSUIr-E/T-e2NQy5m6I/AAAAAAAACGA/TkyqcvVdNXI/s1600/meu+malvado+favorito-gifs+linda+lima+(5).gif')
        .setDescription(`${member.user}, Boas-vindas ao servidor The universe TI, respeite as regras e divirta-se!!`)
        // .addField('', '')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
        .setFooter('ID do usuário: ' + member.user.id)
        .setTimestamp();
    await welcomeChannel.send(embed1);
    member.send(embed1);
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
client.login(config.token);