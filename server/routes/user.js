const router=require("express").Router()
const Booking= require("../models/Booking")

router.get("/:userId/trips",async(req,res)=>{
    try{
        const {userId}=req.params
        const trips=await Bookings.find({CustomerId: userId}).populate("CustomerId hostId listingId")
        res.status(200).json(trips)

    } catch(err){
        res.status(400).json({message:"Can not find any Trips",error : err.message})


    }
});

module.exports = router ;