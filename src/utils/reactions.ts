import { app } from "../app";
import { EmojiIdentifierResolvable, Message } from "discord.js";

export const reactToMessage = async (
  message: Message,
  reaction: EmojiIdentifierResolvable,
  operation = "add"
) => {
  try {
    if (operation === "add") {
      message.react(reaction);
    } else if (operation === "remove") {
      const reactions = message.reactions.cache.filter(r => r.users.cache.has(app.user?.id ?? ""));
      for (const r of reactions.values()) {
        await r.users.remove(app.user?.id ?? "");
      }
    } else {
      console.error(`Invalid operation ${operation} for reactToMessage`);
      return;
    }
  } catch (error) {
    console.error(
      `Failed to add reaction ${reaction} to message ${message}`,
    );
  }
};
