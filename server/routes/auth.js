const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const User = require("../models/User");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads/"); // Store uploaded files in the 'uploads' folder
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name
    },
  });

  const upload = multer({ storage });


  /* USER REGISTER */
router.post("/register", upload.single("profileImage"), async (req, res) => {
    try {
      /* Take all information from the form */
      const { firstName, lastName, email, password } = req.body;
  
      /* The uploaded file is available as req.file */
      const profileImage = req.file;
  
      if (!profileImage) {
        return res.status(400).send("No file uploaded");
      }
      const profileImagePath = profileImage.path;

    /* Check if user exists */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists!" });
    }  
     /* Hass the password */
     const salt = await bcrypt.genSalt();
     const hashedPassword = await bcrypt.hash(password, salt);
 
     /* Create a new User */
     const newUser = new User({
       firstName,
       lastName,
       email,
       password: hashedPassword,
       profileImagePath,
     });
      /* Save the new User */
    await newUser.save();

    /* Send a successful message */
    res
      .status(200)
      .json({ message: "User registered successfully!", user: newUser });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Registration failed!", error: err.message });
  }
});

/*User login */
router.post("/login", async (req, res) => {
  try {
    const {email,password}=req.body;
    const User = await User.findOne({ email });
    if (User) {
      return res.status(409).json({ message: "User doesn't exists!" });
    }  
    /*matching the hashed password */
    const isMatch=await bcrypt.compare(password,User.password)
    if(!isMatch){
      return res.status(400).json({ message: "Invalid credentials!" });

    }
    /* generate JWT token */
    const token=jwt.sign({id:user._id}, process.env.JWT_SECRET)
    delete user.password
    res.status(200).json({token,User})
  }
  catch (err) {
    console.log(err)
    res.status(500).json({error:err.message})
  }
})


module.exports=router
