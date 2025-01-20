import { Message } from "discord.js";
import { createAnnouncementRecord } from "../apis/airtable";
import { voiceflowAddAnnouncementKB } from "../apis/voiceflow";
import { MAINTAINER_PING } from "../config";
import { reactToMessage } from "../utils/reactions";
import { postMonitoringMessage } from "../utils/responses";

export const handleAnnouncement = async (
  message: Message,
  method: string
) => {
  if (message.content) {
    const reaction = reactToMessage(message, "🤖");
    try {
      const { addResponse, tagSuccess } = await voiceflowAddAnnouncementKB(
        message.content
      );
      let status = "success";
      if (addResponse.status === 200 && tagSuccess) {
        await postMonitoringMessage(
          `Added ${message} to the Q&A KB via ${method}. If this was an accident, please reach out to <${MAINTAINER_PING}>.`
        );
      } else if (addResponse.status === 200 && !tagSuccess) {
        status = "tag_failed";
        await postMonitoringMessage(
          `:warning: Added ${message} to the Q&A KB via ${method}, but failed to save the tag so it won't be prioritized. If this was an accident, please reach out to <${MAINTAINER_PING}>.`
        );
      } else {
        status = "failed";
        await postMonitoringMessage(
          `:octagonal_sign: Failed to add ${message} to the Q&A KB via ${method}. Please reach out to <${MAINTAINER_PING}>.`
        );
      }
      await createAnnouncementRecord({
        announcement_ts: message.id,
        body: message.content,
        user_id: message.author.id,
        document_id: addResponse.data.data.documentID,
        status,
        method,
      });
    } catch (error) {
      await postMonitoringMessage(
        `:octagonal_sign: Failed to add ${message} to the Q&A KB via ${method}. Please reach out to <${MAINTAINER_PING}>.`
      );
      console.error(error);
    }
    await reaction;
    await reactToMessage(message, "🤖", "remove");
  } else {
    console.warn(
      `Announcement message that didn't have text for some reason.`,
      message
    );
  }
};
