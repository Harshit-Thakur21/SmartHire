import express from "express";
import path from "path";
import cors from "cors";
import {serve} from "inngest/express";
import {clerkMiddleware} from "@clerk/express"

import {ENV} from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions} from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

const app = express();

const __dirname = path.resolve();

// Middleware
app.use(express.json());
// credentials: true allows cookies to be sent in cross-origin requests on browser
if (ENV.NODE_ENV !== "production") {
    app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
}

app.use(clerkMiddleware()); //this adds auth field to request object : req.auth()

app.use(
    "/api/inngest",
    serve({
        client: inngest,
        functions,
    })
);

app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);


//Using Judge0 API to execute code securely
app.post("/api/execute", async (req, res) => {
  try {
    const { language, source_code } = req.body;

    // Judge0 requires Java public class to be named "Main"
    let finalCode = source_code;
    if (language === "java") {
      finalCode = source_code.replace(/public\s+class\s+\w+/, "public class Main");
    }

    const response = await fetch(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_code,
          language_id: getLanguageId(language),
        }),
      }
    );

    const data = await response.json();

    res.json({
      run: {
        output: data.stdout,
        stderr: data.stderr,
      },
    });

  } catch (error) {
    console.error("❌ Execution error:", error);
    res.status(500).json({ error: "Execution failed" });
  }
});

// LANGUAGE MAPPING (Judge0)
function getLanguageId(language) {
  const map = {
    javascript: 63,
    python: 71,
    java: 62,
  };
  return map[language];
}

app.get("/health", (req, res) => {
    res.status(200).json({msg:"Success from the API"})
});



//make our app ready for deployment
if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../client/dist")));

    app.get("/{*any}", (req, res) =>{
        res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
    })
}


const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.PORT, () =>
            console.log("Server is runnig on port:", ENV.PORT));
    }
    catch(error) {
        console.error("❌ Error starting the server", error);
    }
};

startServer();