import ConnectDb from "./Db/DbConnection.js";
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config();

ConnectDb()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port:${process.env.PORT}`);
    });
    app.on("error", (error) => {
      console.log("ERROR: ", error);
      throw error;
    });
  })
  .catch((err) => {
    console.log(`Db Connection failed !!! : ${err}`);
  });
