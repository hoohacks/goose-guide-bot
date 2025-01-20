import { Attachment, AttachmentBuilder, ButtonInteraction, CommandInteraction, Interaction, Message, MessageFlags } from "discord.js";
import { app } from "../app";
import { MONITORING_CHANNEL, MAINTAINER_PING } from "../config";

export const replyThread = async (
  message: Message,
  text: string,
  attachements?: AttachmentBuilder[]
) => {
  try {
    return await message.reply({
      content: text,
      files: attachements
    });
  } catch (error) {
    console.error(
      `Failed to reply to thread ${message} in ${message.channel} with text ${text} and ${attachements?.length} attachements`,
      error
    );

    return message;
  }
};

// export const replyEphemeralThread = async (
//   interaction: CommandInteraction,
//   text: string
// ) => {
//   try {
//     await interaction.reply({
//       content: text,
//       flags: MessageFlags.Ephemeral,
//     });
//   } catch (error) {
//     console.error(
//       `Failed to reply to thread emphemeral ${interaction.commandId} in ${interaction.channel} with text ${text}`,
//       error
//     );
//   }
// };

// export const replyEphemeralThreadManual = async (
//   channel: string,
//   thread_ts: string,
//   text: string,
//   user: string
// ) => {
//   try {
//     await app.client.chat.postEphemeral({
//       channel: channel,
//       thread_ts: thread_ts,
//       user: user,
//       text: text,
//     });
//   } catch (error) {
//     console.error(
//       `Failed to reply to thread emphemeral manual ${thread_ts} in ${channel} with text ${text}`,
//       error
//     );
//   }
// };

export const deferReplyInteraction = async (
  interaction: ButtonInteraction,
  text: string
) => {
  try {
    await interaction.editReply({
      content: text
    });
  } catch (error) {
    console.error(
      `Failed to reply to emphemeral ${interaction} in ${interaction.message} with text ${text}`,
      error
    );
  }
};

export const postMonitoringMessage = async (text: string) => {
  try {
    const channel = await app.channels.fetch(MONITORING_CHANNEL);
    if (channel && "send" in channel)
      channel.send(text);
  } catch (error) {
    console.error(`Failed to post monitoring message ${text}`, error);
  }
};

export const postMaintainerNotification = async (text: string) => {
  try {
    const channel = await app.channels.fetch(MONITORING_CHANNEL);
    if (channel && "send" in channel)
      channel.send(`<${MAINTAINER_PING}> ${text}`);
  } catch (error) {
    console.error(`Failed to post maintainer notification ${text}`, error);
  }
};
