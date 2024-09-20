const router=require("express").Router()
const Booking= require("../models/Booking")

router.post("/create",async(req,res)=>{
    try{
        const {CustomerId,hostId,listingId,startDate,endDate,totalPrice} =req.body
        const newBooking= new Booking({CustomerId,hostId,listingId,startDate,endDate,totalPrice})
        await newBooking.save()
        res.status(200).json(newBooking)

    } catch(err){
        console.log(err)
        res.status(400).json({message: "Failed to create a Booking " , error: err.message})
        }
    });
    module.exports = router ;