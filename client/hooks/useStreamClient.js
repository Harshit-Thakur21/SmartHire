import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../src/lib/stream.js";
import { sessionAPI } from "../src/api/sessions.js";

function useStreamClient(session, loadingSession, isHost, isParticipant) {

    const [streamClient, setStreamClient] = useState(null);
    const [call, setCall] = useState(null);
    const [chatClient, setChatClient] = useState(null);
    const [channel, setChannel] = useState(null);
    const [isInitializingCall, setIsInitializingCall] = useState(true);

    useEffect(() => {
        let videoCall = null;
        let chatClientInstance = null;

        const initCall = async () => {
            if(!session?.callId) return;
            if(!isHost && !isParticipant) return;

            try {
               const {token, userId, userName, userImage} = await sessionAPI.getStreamToken();

               const client = await initializeStreamClient({
                id: userId,
                name: userName,
                image: userImage
               }, token);

               setStreamClient(client);


               videoCall = client.call("default", session.callId)
               await videoCall.join({create:true});
               setCall(videoCall);

               const apiKey = import.meta.env.VITE_STREAM_API_KEY;
               chatClientInstance = StreamChat.getInstance(apiKey);

               await chatClientInstance.connectUser({
                id: userId,
                name: userName,
                image: userImage
               }, token);

               setChatClient(chatClientInstance);

               const chatChannel = chatClientInstance.channel("messaging", session.callId);
               await chatChannel.watch();
               setChannel(chatChannel);

            } catch (error) {
                toast.error("Failed to join video call");
                console.error("Error initializing call:", error);
            } finally {
                setIsInitializingCall(false);
            }
        };


        if (session && !loadingSession) initCall();

        // Cleanup method - performance reason
        return () => {
            // iife - immediately invoked function expression to handle async cleanup
            (async () => {
                try {
                    if (videoCall) await videoCall.leave();
                    if (chatClientInstance) await chatClientInstance.disconnectUser();
                    await disconnectStreamClient();
                } catch (error) {
                    console.error("Cleanup error:", error);
                }
            })();
        };
    }, [session, loadingSession, isHost, isParticipant]);

    return {
        streamClient,
        call,
        chatClient,
        channel,
        isInitializingCall
    };
}

export default useStreamClient