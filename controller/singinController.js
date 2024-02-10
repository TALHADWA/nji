const express = require("express")
const logincontroller = express.Router()
const Users = require("../module/usermodule")
const isAuthenticated = require("../middlewares/jwt"); // Adjust the path accordingly
const secretKey = "thisisthesecretkeyforjwttokentoverifyusers";
const jwt = require("jsonwebtoken")
const cookie = require('cookie');

const resultcontroller= require("../module/result")
const usermodule = require("../module/usermodule");
const Withdraw = require("../module/withdraw");
logincontroller.post("/register", async (req, res) => {

  try {

    const { name, email, phone, password,referal } = req.body
    const newuser = new Users({
      name: name,
      email: email,
      password: password,
      phone: phone
    })
    await newuser.save()

    const findrefered=await usermodule.findOne({email:referal})
    if (findrefered) {
     
      findrefered.balance += 2; // Assuming you have a 'balance' field for the user
      await findrefered.save();
    }
    res.render("login.hbs", { message: "User registered You can login now!" })

  } catch (e) {
    res.render("login.hbs", { message: "Already present login now" })

    console.log(e);
  }

})
logincontroller.post("/signin", async (req, res) => {

  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email: email });
    if (!user) {
      res.render("login.hbs", { message: "Incorrect email" });
    } else {
      // Perform password comparison logic
      const userpass = user.password

      if (userpass == password) {

        const token = jwt.sign({ userId: user._id, email: user.email, phone: user.phone, name: user.name }, secretKey, { expiresIn: "1h" });
        res.setHeader('Set-Cookie', cookie.serialize('token', token, {
          httpOnly: true,
          maxAge: 3600, // 1 hour in seconds
          sameSite: 'strict', // Adjust according to your security requirements
          path: '/' // Adjust the path as needed
        }));


        res.redirect("/userdash")


      } else {
        res.render("login.hbs", { message: "Incorrect Password" });
        // res.render("login.hbs", { Message: "Incorrect password" });
      }
    }
  } catch (e) {
    return res.status(400).render("login.hbs", { message: "Error" });
  }
});
const withdrawModel = require("../module/withdraw")
const DepositModel = require("../module/Depositmodule")

logincontroller.get("/userdash", isAuthenticated, async (req, res) => {
  const userinfo = req.user
  const user=await usermodule.findOne({email:userinfo.email})
  const userresults= await resultcontroller.find()
  const userEmail = user.email;

  const filteredData = userresults.filter(entry => entry.useremail === userEmail);
  res.render("users/userpanel.hbs", { user,filteredData })
})

logincontroller.post('/approve-deposit', async (req, res) => {
  const { email, deposit } = req.body;
  try {
      // Find the deposit request by email
      const depositRequest = await DepositModel.findOne({ email });
      if (!depositRequest) {
          return res.status(404).json({ error: 'Deposit request not found' });
      }
      // Update the user's balance
      const user = await usermodule.findOne({ email });
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      user.balance += deposit;
      await user.save();

      // Optionally, you can delete the deposit request after approval
      await DepositModel.deleteOne({ email });

      res.status(200).json({ message: 'Deposit request approved successfully' });
  } catch (error) {
      console.error('Error approving deposit request:', error);
      res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

logincontroller.get("/deposit", isAuthenticated, async(req, res) => {
  const userinfo = req.user
  const user=await usermodule.findOne({email:userinfo.email})
  res.render("users/deposit.hbs", { user })
})

logincontroller.post("/userdepositrequest", isAuthenticated, async (req, res) => {
  const userinfo = req.user
  const user=await usermodule.findOne({email:userinfo.email})
  const { ammount, account } = req.body
  const newrequest = new DepositModel({
    name: user.name,
    deposit: ammount,
    email: user.email,
    phone: user.phone,
  })
  await newrequest.save()

  res.render("users/deposit.hbs", { user })
})
logincontroller.post("/userwithdrawrequest", isAuthenticated, async (req, res) => {
  const userinfo = req.user;
  const user = await usermodule.findOne({ email: userinfo.email });
  const { ammount, account } = req.body;

  if (ammount < 15) {
    res.render("users/withdraw.hbs", { user, message: "you can withdraw a minimum of $15" });
  } else {
    if (user.balance < ammount) {
      res.render("users/withdraw.hbs", { user, message: "Insufficient balance" });
    } else {
      // Deduct withdrawal amount from user's balance
      user.balance -= ammount;
      await user.save();

      const newrequest = new withdrawModel({
        name: user.name,
        withdraw: ammount,
        email: user.email,
        phone: user.phone,
        accountnumber: account,
      });
      await newrequest.save();

      res.render("users/withdraw.hbs", { user, message: "Your request is received. Thank you for playing" });
    }
  }
});

logincontroller.post('/users/:userId/update-balance', async (req, res) => {
  const userId = req.params.userId;
  const newBalance = req.body.balance;

  try {
    // Find the user by ID
    const user = await usermodule.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user's balance
    user.balance = newBalance;
    await user.save();

    // Respond with updated user data
    res.json(user);
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ error: 'Failed to update balance' });
  }
});



logincontroller.post('/result', async (req, res) => {
  try {
    const { currentbalance, profit, useremail,result } = req.body;

    const newResult = new resultcontroller({ currentbalance:currentbalance,profit:profit, result:result, useremail:useremail });

    await newResult.save();
    
    // Send a JSON response instead of redirecting
    res.status(200).json({ success: true, message: 'Result saved successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

logincontroller.post("/updateuserbalance", async (req, res) => {
  try {
    const { currentbalance, useremail } = req.body;

    // Find the user by email
    const existingUser = await resultcontroller.findOne({ useremail: useremail });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Update the balance field only
    existingUser.currentbalance = currentbalance;

    // Save the updated user
    await existingUser.save();

    // Send a JSON response indicating success
    res.status(200).json({ success: true, message: 'Balance updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});



// add the profit value in the by double if user win 

logincontroller.get("/withdraw", isAuthenticated,async (req, res) => {
  const userinfo = req.user
  const user=await usermodule.findOne({email:userinfo.email})
  res.render("users/withdraw.hbs", { user })
})


const adminModule = require("../module/adminmodule")

logincontroller.get("/admin", (req, res) => {
  res.render("admin/admin.hbs")
})


logincontroller.post("/adminlogin", async (req, res) => {
  try {

    const { email, password } = req.body
    const userfind = await adminModule.findOne({ email: email })
    if (!userfind) {
      res.render("admin/admin.hbs", { message: "invalid email" })
    }
    else {
      const pass = userfind.password;
      if (pass == password) {



        const token = jwt.sign({ userId: userfind._id, email: userfind.email }, secretKey, { expiresIn: "1h" });
        res.setHeader('Set-Cookie', cookie.serialize('token', token, {
          httpOnly: true,
          maxAge: 3600, // 1 hour in seconds
          sameSite: 'strict', // Adjust according to your security requirements
          path: '/' // Adjust the path as needed
        }));


        res.render("admin/dashboard.hbs")
      } else {
        res.render("admin/admin.hbs", { message: "invalid Password" })

      }
    }
  } catch (e) {
    res.render("admin/admin.hbs", { message: "invalid details" })

  }
})

  logincontroller.get("/referal",isAuthenticated,async(req,res)=>{
    const userinfo = req.user
    const user=await usermodule.findOne({email:userinfo.email})
    res.render("users/referal.hbs", { user })
  })

logincontroller.post('/update-balance', async (req, res) => {
  const userEmail = req.body.useremail;
  const newBalance = req.body.newBalance;

  try {
    // Find the user by email
    const user = await usermodule.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user's balance
    user.balance = newBalance;
    await user.save();

    // Respond with updated user data
    res.json(user);
  } catch (error) {
    console.error('Error updating user balance:', error);
    res.status(500).json({ error: 'Failed to update user balance' });
  }
});
const Result=require("../module/result")





const AdminController = require("./adminController");

logincontroller.use(AdminController)

module.exports = logincontroller