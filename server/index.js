const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");

const authRoutes=require("./routes/auth.js")
const listingRoutes = require("./routes/listing.js")
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.static("public"));

app.use("/auth",authRoutes)
app.use("/properties", listingRoutes)
const PORT = 3001;

mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "Home-ease",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((err) => console.log(`${err} did not connect`));


  