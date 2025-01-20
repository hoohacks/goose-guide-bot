import { app } from "../app";
import {
  voiceflowInteract,
  voiceflowSaveTranscript,
  makeTranscriptUrl,
} from "../apis/voiceflow";
import { createConversationRecord } from "../apis/airtable";
import { isInteger } from "../utils/misc";
import { reactToMessage } from "../utils/reactions";
import {
  replyThread,
  postMonitoringMessage,
  postMaintainerNotification,
} from "../utils/responses";
import { replySatisfactionButtons } from "../utils/buttons";

import { EMERGENCY_PING, FAILED_ANSWER_PING } from "../config";
import { AttachmentBuilder, Message } from "discord.js";

export const handleUserQuestion = async (
  message: Message
) => {
  const userID = `${message.author.id}-${message.id}`;

  const reaction = reactToMessage(message, "🤖");

  console.log(`Question from ${userID}.`);

  try {
    const timeAsked = message.createdTimestamp;
    const questionMessageLink = await message.url;
    const vfLaunch = await voiceflowInteract(userID, { type: "launch" });
    const vfReply = await voiceflowInteract(userID, {
      type: "text",
      payload: message.content,
    });
    const transcriptReply = voiceflowSaveTranscript(userID);

    let outputText = "";
    let attachments: AttachmentBuilder[] = [];

    let end_type = "";
    let end_reason = "";
    let answer_score = "";

    for (const trace of vfReply) {
      if (trace.type === "text") {
        outputText += trace.payload.message + "\n\n";
      } else if (
        trace.type === "visual" &&
        trace.payload.visualType === "image"
      ) {
        const response = await fetch(trace.payload.image);
        const buffer = Buffer.from(await response.arrayBuffer());
        attachments.push(new AttachmentBuilder(buffer, { name: trace.payload.image.split("/").pop() }));
      } else if (trace.type.includes("answer_")) {
        end_type = trace.type;
        end_reason = trace.payload.reason;
        answer_score = trace.payload.score || null;
      } else if (trace.type === "path" || trace.type === "end") {
        // do nothing
      } else {
        console.log("Unhandled trace type", trace);
      }
    }

    // remove the last two newlines
    outputText = outputText.trimEnd();

    const threadStartMessage = (outputText || attachments.length > 0) ? await replyThread(message, outputText, attachments) : message;

    const timeAnswered = new Date().getTime() / 1000;

    const transcriptUrl = makeTranscriptUrl((await transcriptReply).data._id);
    const locationmessage =
      message.channel.isDMBased()
        ? "in a DM"
        : `in ${message.channel}, see thread [here](${questionMessageLink})`;
    const coreMonitoringMessage = `${message.author} asked \`${message.content}\` ${locationmessage}. Voiceflow debug [transcript](${transcriptUrl}).\n\nEnd type: \`${end_type}\`.\n\nEnd reason: \`${end_reason}\`\n\nAnswer score \`${answer_score}\``; // todo: add better conditions for if the permalink fetch doesnt work well

    if (end_type === "answer_emergency") {
      await postMonitoringMessage(
        `:rotating_light: :rotating_light: Emergency question detected from ${message.author}. ${coreMonitoringMessage} <${EMERGENCY_PING}> :rotating_light: :rotating_light:`
      );
    } else if (end_type === "answer_fail") {
      await postMonitoringMessage(
        `:warning: Question failed to be answered automatically. ${coreMonitoringMessage} <${FAILED_ANSWER_PING}>`
      );
    } else if (end_type === "answer_success") {
      if (
        answer_score === null ||
        !isInteger(answer_score) ||
        parseInt(answer_score) <= 2
      ) {
        await postMonitoringMessage(
          `:blue_square: *Low confidence answer* ${coreMonitoringMessage} <${FAILED_ANSWER_PING}>`
        );
      } else {
        await postMonitoringMessage(
          `:white_check_mark: ${coreMonitoringMessage}`
        );
      }
    } else {
      await postMonitoringMessage(`:thinking_face: ${coreMonitoringMessage}`);
    }

    const conversationRecordID = await createConversationRecord({
      convo_id: userID,
      question: message.content,
      answer: outputText,
      user_id: message.author.id,
      end_type,
      end_reason,
      answer_score,
      time_asked: timeAsked,
      time_answered: timeAnswered,
      slack_permalink: questionMessageLink ?? "No link",
      vf_transcript: transcriptUrl,
      channel: message.channel.id,
    }).catch(async () => {
      await postMaintainerNotification(
        `Failed to save conversation record for ${message.author}. Likely a problem with airtable, could be running out of rows (max 1000 on free plan), in which case you should download the data and clear it`
      );
      return "";
    });
    const buttonPayload = `${message.author.id}|${conversationRecordID}`;

    await replySatisfactionButtons(threadStartMessage, buttonPayload);
  } catch (error) {
    await replyThread(
      message,
      "We weren't able to respond to your question. An organizer will help you shortly."
    );
    await postMonitoringMessage(
      `:interrobang: Code error to question from ${message.author}: ${message.content}`
    );
  }
  await reaction;
  await reactToMessage(message, "🤖", "remove");
};
