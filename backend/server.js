const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRouter = require('./routers/auth/auth-router');
//mongodb+srv://bharath2005goo:<db_password>@cluster0.hssjvxz.mongodb.net/

require('dotenv').config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));



const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
      origin: "http://192.168.1.3:19006",
      methods: ["GET", "POST", "DELETE", "PUT"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Cache-Control",
        "Expires",
        "Pragma",
      ],
      credentials: true,
    })
);

app.use(passport.initialize());

app.use(cookieParser());
app.use(express.json());
app.use('/api/auth',authRouter);

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
