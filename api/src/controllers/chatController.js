import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req,res) {
    try {
        //use clerkId for Stream not mongodb id => it should match the user id in Stream dashboard
        const token = chatClient.createToken(req.user.clerkId);
        res.status(200).json({
            token,
            userId : req.user.clerkId,
            userName : req.user.name,
            userImage : req.user.image
        });
    } catch (error) {
        console.log("Error generating Stream token:", error.message);
        res.status(500).json({msg: "Failed to generate Stream token"}); 
    }
}