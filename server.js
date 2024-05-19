const express = require("express");
const dotenv = require("dotenv");
const userRouter=require('./routes/user')
dotenv.config();
require("./db/conn");

const app = express();


app.use(express.json());

app.use("/api/v1", userRouter);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(
   `server is running on port number ${PORT}`
  );
});
