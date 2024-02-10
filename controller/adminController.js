const express = require("express")
const GraphModule = require("../module/graphval")
const isAuthenticated = require("../middlewares/jwt"); // Adjust the path accordingly

const Admin = express.Router()
const Users = require("../module/usermodule")

Admin.get("/graphcontroll", (req, res) => {
    res.render("admin/graphcontroll.hbs")
})

Admin.get("/dashboard", (req, res) => {
    res.render("admin/dashboard.hbs")
})

Admin.post("/graphdata", async (req, res) => {
    const { data } = req.body
    const newdata = new GraphModule({ data: data })
    await newdata.save()
    res.render("admin/graphcontroll.hbs", { data })

})


Admin.get("/helpservice", (req, res) => {
    res.render("helpservice.hbs")
})

Admin.get("/usersdata", async (req, res) => {

   const users=await Users.find()
   
   res.render("admin/usersdata.hbs",{users})

})


// Your route definition


const depositrequest = require("../module/Depositmodule")
const withdrawrequest = require("../module/withdraw")
Admin.get("/depositrequest", isAuthenticated, async (req, res) => {
    const deposits = await depositrequest.find();
    res.render("admin/deposit.hbs", { deposits });
});
Admin.get("/withdrawrequest", isAuthenticated, async (req, res) => {
    const withdraws = await withdrawrequest.find();
    res.render("admin/withdraw.hbs", { withdraws });
});



module.exports = Admin;

