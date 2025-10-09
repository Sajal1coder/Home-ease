const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const mongoose = require("mongoose");
const dotenv= require("dotenv").config();
const cors = require("cors");

const authRoutes=require("./routes/auth.js")
const listingRoutes = require("./routes/listing.js")
const BookingRoutes=require("./routes/booking.js")
const userRoutes=require("./routes/user.js");
const { Server } = require("socket.io");
const setupSocket = require('./socket');
const io = new Server(server, {
  cors: { 
    origin: ["http://localhost:3000", "https://homease-taupe.vercel.app"], 
    credentials: true 
  }
});
setupSocket(io);
app.use(cors({
  origin: ["http://localhost:3000", "https://homease-taupe.vercel.app"]
}));
app.use(express.json());
app.use(express.static("public"));

app.use('/reviews', require('./routes/review'));
app.use('/admin', require('./routes/admin'));
app.use('/user-profile', require('./routes/userProfile'));
app.use('/messages', require('./routes/message'));
app.use("/auth",authRoutes)
app.use("/properties", listingRoutes)
app.use("/bookings",BookingRoutes)
app.use("/users",userRoutes)
const PORT = 5000;

mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "Home-ease",
    
  })
  .then(() => {
    server.listen(PORT,  '0.0.0.0',() => console.log(`Server Port: ${PORT}`));
  })
  .catch((err) => console.log(`${err} did not connect`));