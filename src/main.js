import express from "express";
import ConnectDb from "./Db/DbConnection.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

ConnectDb()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Db Connection failed !!! : ${err}`);
  });
