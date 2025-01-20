import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Message } from "discord.js";
import { handleSatisfactionButton } from "../services/satisfactionService";
import { deferReplyInteraction } from "./responses";

export const replySatisfactionButtons = async (
  message: Message,
  payload: string,
) => {
  try {
    const yesButton = new ButtonBuilder()
      .setCustomId("satisfaction_yes__" + payload)
      .setLabel("Yes 🤩")
      .setStyle(ButtonStyle.Success);

    const noButton = new ButtonBuilder()
      .setCustomId("satisfaction_no__" + payload)
      .setLabel("No, but I'm ok 👍")
      .setStyle(ButtonStyle.Primary);

    const helpMeButton = new ButtonBuilder()
      .setCustomId("satisfaction_help_me__" + payload)
      .setLabel("No, but I still need help ❔")
      .setStyle(ButtonStyle.Danger);

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(yesButton, noButton, helpMeButton);

    if (!message.hasThread && !message.channel.isDMBased())
      await message.startThread({
        name: "Satisfaction",
        autoArchiveDuration: 1440,
        reason: "To collect feedback",
      });

    const sendLocation = message.channel.isDMBased() && message.channel.isSendable() ? message.channel : message.thread

    await sendLocation?.send({
      content: "Did this answer your question? This helps us improve the bot.\n\nPowered by [Voiceflow](<https://www.voiceflow.com/>) :zap:\n\n_Q&A Chatbot can make mistakes. Check important info with organizers._",
      components: [actionRow],
    });

    const collector = sendLocation?.createMessageComponentCollector({
      time: 60000
    });

    collector?.on("collect", async (interaction) => {
      if (interaction.isButton() && interaction.customId.match(/satisfaction_(yes|no|help_me)/))
        handleSatisfactionButton(interaction, actionRow);
    });

    collector?.on("end", async (collected) => {
      if (collected.size != 0)
        return;

      await message.thread?.send({
        content: "This thread has been locked. If you need more help, please ask in the main channel.",
        components: []
      })

      await message.thread?.setLocked(true);
    });
  } catch (error) {
    console.error(
      `Failed to reply to thread ${message} in ${message.channel} with satisfaction buttons`,
      error,
    );
  }
};

export const updateSatisfactionButtons = async (
  interaction: ButtonInteraction,
  actionRow: ActionRowBuilder<ButtonBuilder>,
  text: string,
) => {
  try {
    for (const component of actionRow.components)
      component.setDisabled(true);

    interaction.message.edit({
      components: [actionRow],
    })

    await deferReplyInteraction(interaction, text);

    if (interaction.message.channel.isThread())
      await interaction.message.channel.setLocked(true);
  } catch (error) {
    console.error(
      `Failed to update satisfaction buttons ${interaction.id} in ${interaction.channel} with text ${text}`,
      error,
    );
  }
};
