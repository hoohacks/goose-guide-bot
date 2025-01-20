import { Events, REST, Routes } from "discord.js";
import { app } from "./app";
import * as AskCommand from "./commands/askCommand";
import * as HelpQnaCommand from "./commands/helpQnaCommand";

const commands: { [key: string]: (interaction: any) => Promise<void> } = {};

commands[AskCommand.data.name] = AskCommand.execute;
commands[HelpQnaCommand.data.name] = HelpQnaCommand.execute;

app.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;

    const { commandName } = interaction;

    if (!commands[commandName]) {
        console.error(`Command not found: ${commandName}`);
        return;
    }

    try {
        await commands[commandName](interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN ?? '');

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID ?? ''),
            { body: [AskCommand.data.toJSON(), HelpQnaCommand.data.toJSON()] },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
