import express from "express";
import path from "path";
import {ENV} from "./lib/env.js";
import { connectDB } from "./lib/db.js";

const app = express();

const __dirname = path.resolve();

app.get("/health", (req, res) => {
    res.status(200).json({msg:"Success from the API"})
});

app.get("/books", (req, res) => {
    res.status(200).json({msg:"access from the API"})
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
        connectDB();
        app.listen(ENV.PORT, () => {
            console.log("Server is runnig on port:", ENV.PORT)
            connectDB();
        });
    }
    catch(error) {
        console.error("❌ Error starting the server", error);
    }
}

startServer();