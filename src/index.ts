import { app } from "./app";
import "./loadCommands";
import "./events/messageHandler";

(async () => {
  await app.login(process.env.DISCORD_BOT_TOKEN);
  console.log("⚡️ Q&A Chatbot Discord app is running again!");
})();
