import { replyThread } from "../utils/responses";
import { Message } from "discord.js";

export const handleUserThreadReply = async (
  message: Message
) => {
  await replyThread(
    message,
    "To ask a question, ask in the main channel, not in a thread."
  );
};
