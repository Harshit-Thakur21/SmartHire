import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";

export const inngest = new Inngest({ id: "smart-hire" });

const syncUser = inngest.createFunction(
  { 
    id: "sync-user-v2",
    triggers: [{ event: "clerk/user.created" }]  // ← array inside first arg
  },
  async ({ event }) => {
    await connectDB();
    const { id, email_addresses, first_name, last_name, image_url } = event.data;
    await User.create({
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      profileImage: image_url,
    });
  }
);

const deleteUserFromDB = inngest.createFunction(
  { 
    id: "delete-user-from-db-v2",
    triggers: [{ event: "clerk/user.deleted" }]  // ← array inside first arg
  },
  async ({ event }) => {
    await connectDB();
    await User.deleteOne({ clerkId: event.data.id });
  }
);

export const functions = [syncUser, deleteUserFromDB];