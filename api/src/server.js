import express from "express";
import {ENV} from "./lib/env.js";

const app = express();

app.get("/health", (req, res) => {
    res.status(200).json({msg:"Success from the API"})
})

app.listen(ENV.PORT, () => console.log("Server is runnig on port:", ENV.PORT));