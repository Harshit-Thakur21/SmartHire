import {StreamChat} from "stream-chat";
import { ENV } from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("Stream API key or secret is missing in environment variables");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try {
        await chatClient.upsertUsers([userData]);
        
        console.log("Stream user upserted:", userData);
    } catch (error) {
        console.error("Error upserting stream user", error);
    }
};

export const deleteStreamUser = async (userId) => {
    try {
        await chatClient.deleteUser(userId, {mark_messages_deleted: false});

        console.log("Stream user deleted:", userId);

    } catch (error) {
        console.error("Error deleting stream user", error);
    }
};

//todo: add method to genrate token