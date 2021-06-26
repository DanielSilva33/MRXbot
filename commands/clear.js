module.exports = async (msg) => {
    const channel = msg.channel; //canal em qua foi enviado o comando para limpar as msg

    const fetchMessages = await channel.messages.fetch().catch(console.error);

    await channel.bulkDelete(fetchMessages);

    msg.reply(`Deletou ${fetchMessages.size} mensagens`);
}