import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { QUESTIONS_CHANNEL } from "../config";

export const data = new SlashCommandBuilder()
  .setName("ask")
  .setDescription("Ask the bot a question");

export const execute: any = async (interaction: CommandInteraction) => {
  await interaction.reply(
    `Hi! Feel free to ask me any questions privately in a DM or publically in <#${QUESTIONS_CHANNEL}>. Your questions will be logged for quality.

I'm here to help! What would you like to know?`);
}
