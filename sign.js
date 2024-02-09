const express = require("express");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.static("Frontend"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this line to handle form data
const path = require("path");
const { default: mongoose, mongo } = require("mongoose");

mongoose.connect("mongodb+srv://medhanarayan:UXSCstkGNoW7o0Rt@cluster0.rzebnsq.mongodb.net/")
    .then(() => {
        console.log("database connected");
    });

const User = mongoose.model("User", {
    username: String,
    email: String,
    password: String,
});

const validateSignup = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
});

const validateLogin = z.object({
    username: z.string(),
    password: z.string(),
});

app.post("/login", async function (req, res) {
    try{
        const {username,password}=validateLogin.parse(req.body);
        const user= await User.findOne({
            username:username,
            password:password,
        });
        if(!user){
            res.status(401).json({msg:"User deos not exist"})
        }
        const token = jwt.sign({userId:user._id},"password");
        res.send(token);
       // res.sendFile("logmsg.html", { root: path.join(__dirname, "Frontend") });
    }
    catch(error){

    }
});
app.get("/dashboard",function(req,res){
    const token= req.headers.authorization;
    if(!token){
        return res.status(401);
    }
    jwt.verify(token,"password",function(err,decoded){
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
          }
          res.sendFile("loginmsg.html", { root: path.join(__dirname, "Frontend") });    
    })
})

app.post("/signup", async function (req, res) {
    try {
        const { username, email, password } = validateSignup.parse(req.body);
        const existinguser= await User.findOne({email});
        if(existinguser){
            res.status(400).json({msg:"This email is already existed"})
        }
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).sendFile("signupmsg.html", { root: path.join(__dirname, "Frontend") });
    } catch (error) {
        console.error("Signup error:", error.errors);
        res.status(400).json({ error: error.errors });
    }
});

app.listen(3000, () => {
    console.log("Server is listening at port 3000");
});

        