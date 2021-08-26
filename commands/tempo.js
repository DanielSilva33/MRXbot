const Discord = require("discord.js");
const https = require("https");
const config = require("../config.json");

module.exports = async (msg) => {

    if (!msg.guild) return;
    if (!msg.content.startsWith(config.prefix)) return;
    if (msg.author.bot) return;

    if (msg.content.length > 7) {

        const apiKey = config.apikey;
        const units = 'units=metric'
        const lang = 'lang=pt_br'

        const msgPartials = msg.content.slice(7)
        const city = msgPartials.replace(' ', '+')
        let baseURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&${units}&${lang}`


        https.get(baseURL, function (response) {

            response.on('data', function (data) {
                const tempp = JSON.parse(data);
                const temperatura = tempp.main.temp;
                const termic = tempp.main.feels_like;
                const tempMin = tempp.main.temp_min;
                const tempMax = tempp.main.temp_max;
                const umidade = tempp.main.humidity;
                const nomeCidade = tempp.name;
                const weatherTemp = tempp.weather;
                const weather = weatherTemp.map((item) => item.description);


                let embed = new Discord.MessageEmbed()
                    .setColor('#68F586')
                    .setTitle(`:space_invader: **Tempo em ${nomeCidade}** :space_invader:`)
                    .setDescription(`Clima: ${weather}
                    Temperatura: ${temperatura.toFixed(0)}°C
                    Sensação termica: ${termic.toFixed(0)}°C
                    Temperatura minima: ${tempMin.toFixed(0)}°C
                    Temperatura maxima: ${tempMax.toFixed(0)}°C
                    Umidade do ar: ${umidade}%`)
                    .setImage('https://i.gifer.com/CtmQ.gif')
                    .setTimestamp();
                msg.reply(embed);

            });
        });
    }

}