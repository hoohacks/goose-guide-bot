import { app } from "../app";
import { handleUserQuestion } from "../services/questionService";
import { handleUserThreadReply } from "../services/threadReplyService";
import { handleAnnouncement } from "../services/announcementService";
import {
  QUESTIONS_CHANNEL,
  ANNOUNCEMENTS_CHANNEL,
  INSERT_KB_CHANNEL,
} from "../config";

app.on("messageCreate", async (message) => {
  try {
    if (message.author.bot === false && message.content) {
      const isQuestion =
        message.channelId === QUESTIONS_CHANNEL || message.channel.isDMBased();
      const isThread = message.channel.isThread();
      const isAnnouncement = message.channelId === ANNOUNCEMENTS_CHANNEL;
      const isKBInsert = message.channelId === INSERT_KB_CHANNEL;

      if (isQuestion && isThread) {
        await handleUserThreadReply(message);
      } else if (isQuestion) {
        if (!message.content.toLowerCase().includes("[no ai]")) {
          await handleUserQuestion(message);
        }
      } else if (isAnnouncement && !isThread) {
        await handleAnnouncement(message, "announcement");
      } else if (isKBInsert && !isThread) {
        await handleAnnouncement(message, "manual_insert");
      }
    }
  } catch (error) {
    console.error("Error handling message", error);
  }
});
