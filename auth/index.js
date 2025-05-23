const express = require('express');
const app = express();
const {DBConnection}= require("../database/db");
const user = require('../model/user');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
DBConnection();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get("/",(req,res)=> {
    res.send("hello world is coming from backend");
});


app.post("/register",async (req,res)=> {
   try{ //get all the data
    const {firstname , lastname ,email , password} =req.body;
    //check that all the data should exist
    if(!(firstname && lastname && email && password)){
        return res.status(400).send("please enter all the information");
    }
    //check if user already exist
const existingUser= await user.findOne({email});
if(existingUser){
return res.status(400).send("user already exist");
}

//hashing/encrpyt the password
const hashedPassword= await bcrypt.hash(password,10);


//save the user in the db
const newuser = await user.create({
    firstname,
    lastname,
    email,
    password: hashedPassword,
});
// generate a token for user and send it
const token = jwt.sign({ id: newuser._id , email }, process.env.SECRET_KEY,
{expiresIn : '1h'}
);
newuser.token=token;
newuser.password= undefined;
res.status(200).json({message : 'You have succesfully registered!',user : newuser})

}
//catch any error that might be there in the above try code
catch(error){
    console.error("Register route error:", error);
    //tell that there is something wrong i.e we catched a error
    res.status(500).json({ message: "something went wrong", error: error.message });
}
});

//
app.listen(process.env.PORT, () => { 
    console.log(`server is listening on port ${process.env.PORT}!`);
});