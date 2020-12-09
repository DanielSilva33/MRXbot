using Discord;
using Discord.Commands;
using Discord.WebSocket;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace MRXbot
{
    class Program
    {
        static void Main(string[] args) => new Program().RunBotAsync().GetAwaiter().GetResult();

        private DiscordSocketClient _client;
        private CommandService _commands;
        private IServiceProvider _services;

        public async Task RunBotAsync()
        {
            _client = new DiscordSocketClient();
            _commands = new CommandService();
            _services = new ServiceCollection().AddSingleton(_client).AddSingleton(_commands).BuildServiceProvider();

            //Responsavel pelo token do seu bot.
            string tokenBot = "Token bot";

            _client.Ready += Client_Ready;
            _client.Log += ClientLog;
            _client.UserJoined += userJoinned;

            await Client_Ready();
            await ComandosBot();

            _client.LoginAsync(TokenType.Bot, tokenBot);
            
            await _client.StartAsync();
            await Task.Delay(-1);
        }


        private async Task userJoinned(SocketGuildUser user)
        {
            var usuario = user.Guild;
        }

        //Responsavel por mostrar o log do bot ao subir.
        private Task ClientLog(LogMessage arg)
        {
            Console.WriteLine(arg);
            return Task.CompletedTask;
        }

        //Responsavel para mostrar o status do bot.
        private async Task Client_Ready()
        {
            await _client.SetGameAsync("$help", "https://google.com");
        }

        //Gerando os comandos do bot
        public async Task ComandosBot()
        {
            _client.MessageReceived += iniciandoComandos;
            await _commands.AddModulesAsync(Assembly.GetEntryAssembly(), _services);
        }

        //Capturando os comandos digitados!
        private async Task iniciandoComandos(SocketMessage arg)
        {
            var mensagem = arg as SocketUserMessage;
            if (mensagem is null || mensagem.Author.IsBot) return;

            var Context = new SocketCommandContext(_client, mensagem);

            int argPost = 0;
            if (mensagem.HasStringPrefix("$", ref argPost))
            {
                var result = await _commands.ExecuteAsync(Context, argPost, _services);

                if (!result.IsSuccess)
                {
                    Console.WriteLine(result.ErrorReason);
                }
            }
        }
    }
}
