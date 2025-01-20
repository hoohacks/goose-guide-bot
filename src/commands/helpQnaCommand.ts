import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { QUESTIONS_CHANNEL } from "../config";

const HELP_MESSAGE = `Hey there :wave:!
Q&A Chatbot is a project made in collaboration between Hack the North and [Voiceflow](<https://www.voiceflow.com/>) to help answer your questions about the event quickly and accurately.

For any question you ask in <#${QUESTIONS_CHANNEL}> the bot will try to answer automatically based off it's knoledge base, the real-time Hack the North schedule, announcements, maps and more.

You can also ask questions in direct messages to the bot (which you can open with /ask) if you want to ask privately.

It only answers your question in one-shot, so if you need more help or clarification, just ask again in a new message, not in the thread.

If you're not satisfied with the answer, you can give feedback and an organizer will reach out to help you.

Your questions and the bot's answers will be logged for quality.`;

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Get help with the Q&A Chatbot");

export const execute: any = async (interaction: CommandInteraction) => {
  await interaction.reply(HELP_MESSAGE);
}
