const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv= require("dotenv").config();
const cors = require("cors");
const path = require("path");
const authRoutes=require("./routes/auth.js")
const listingRoutes = require("./routes/listing.js")
const BookingRoutes=require("./routes/booking.js")
const userRoutes=require("./routes/user.js")

app.use(cors("https://homease-taupe.vercel.app/"));
app.use(express.json());
app.use(express.static("public"));

app.use("/auth",authRoutes)
app.use("/properties", listingRoutes)
app.use("/bookings",BookingRoutes)
app.use("/users",userRoutes)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
const PORT = 3001;

mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "Home-ease",
    
  })
  .then(() => {
    app.listen(PORT,  '0.0.0.0',() => console.log(`Server Port: ${PORT}`));
  })
  .catch((err) => console.log(`${err} did not connect`));


  