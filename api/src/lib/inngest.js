import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({ id: "smart-hire" });

const syncUser = inngest.createFunction(
  { 
    id: "sync-user",
    triggers: [{ event: "clerk/user.created" }]
  },
  async ({ event }) => {
    try {
      await connectDB();
      const { id, email_addresses, first_name, last_name, image_url } = event.data;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      await User.create({
        clerkId: id,
        email: email_addresses[0]?.email_address,
        name,
        profileImage: image_url,
      });

      await upsertStreamUser({
        id: id.toString(),
        name,
        image: image_url,
      });
    } catch (error) {
      console.error("syncUser error:", error);
      throw error; // ← so Inngest marks it failed instead of hanging
    }
  }
);

const deleteUserFromDB = inngest.createFunction(
  { 
    id: "delete-user-from-db",
    triggers: [{ event: "clerk/user.deleted" }]
  },
  async ({ event }) => {
    try {
      await connectDB();
      const { id } = event.data;
      await User.deleteOne({ clerkId: id });
      await deleteStreamUser(id.toString());
    } catch (error) {
      console.error("deleteUserFromDB error:", error);
      throw error;
    }
  }
);

export const functions = [syncUser, deleteUserFromDB];