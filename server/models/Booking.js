const mongoose= require("mongoose");

const bookingschema=new mongoose.Schema(
    {
        CustomerId: {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        hostId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        listingId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        startDate:{
            type:String,
            required:true
        },
        endDate:{
            type:String,
            required:true
        },
        totalPrice:{
            type:Number,
            required:true
        },
    },
    {timestamp:true}
);

const Booking =mongoose.model("Booking",bookingschema)
module.exports=Booking;