import { updateConversationSatisfaction } from "../apis/airtable";
import { FAILED_ANSWER_PING } from "../config";
import { updateSatisfactionButtons } from "../utils/buttons";
import {
  postMonitoringMessage,
  deferReplyInteraction,
} from "../utils/responses";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, MessageFlags } from "discord.js";

export const handleSatisfactionButton = async (interaction: ButtonInteraction, actionRow: ActionRowBuilder<ButtonBuilder>) => {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral
  });

  const [action_id, payload] = interaction.customId.split("__");
  const [questionUser, airtableRecordID] = payload.split("|");

  const channel = interaction.channel;
  const buttonMessageTs = interaction.message?.id;

  if (questionUser === interaction.user.id) {
    if (channel && buttonMessageTs) {
      const convo_fields = await updateConversationSatisfaction(
        airtableRecordID,
        action_id
      );
      if (action_id === "satisfaction_yes") {
        await updateSatisfactionButtons(
          interaction,
          actionRow,
          ":partying_face: Glad to hear the automated answer was helpful! Thanks for your feedback, and enjoy the event!"
        );
      } else if (action_id === "satisfaction_no") {
        await updateSatisfactionButtons(
          interaction,
          actionRow,
          ":thumbsup: Okay, good to hear that you're all right. If you have any more questions, please don't hestitate to ask."
        );
      } else if (action_id === "satisfaction_help_me") {
        await updateSatisfactionButtons(
          interaction,
          actionRow,
          "Got it, thanks for your feedback. An organizer will come help you soon."
        );
        const originalQuestionLink = interaction.message?.url;
        await postMonitoringMessage(
          `:question: ${interaction.user} still wants help after automated response. Find it [here](${originalQuestionLink}). <${FAILED_ANSWER_PING}>\n\nQuestion:\`${convo_fields?.question}\`\n\nAnswer:\`\`\`${convo_fields?.answer}\`\`\``
        );
      } else {
        await updateSatisfactionButtons(
          interaction,
          actionRow,
          `Thanks. ${action_id}`
        );
      }
    }
  } else {
    if (channel && buttonMessageTs) {
      await deferReplyInteraction(
        interaction,
        "Only the original owner can give this answer"
      );
    }
  }
};
