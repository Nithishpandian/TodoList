const express = require("express")
const app = express()
const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended : true}))
app.use(express.static("public"));

app.set("view engine", "ejs");

const todoItems = ["Buy Food","Cook Food","Eat Food"]
const workItems = ["Study"]

app.get("/", (req, res)=>{
    const date = new Date();
    let options = {
        weekday : "long",
        year : "numeric",
        month : "long",
        day : "numeric"
    }
    const day = date.toLocaleDateString("en-US", options)
    res.render("index",{
        title : day,
        todoItem : todoItems.filter(e=>e)
    })
})
app.post("/", (req, res)=>{
    const item = req.body.item
    if((req.body.button) === "Work"){
        workItems.push(item)
        res.redirect("/work")
    }
    else{
        todoItems.push(item)
        res.redirect("/")
    }
})

app.get("/work", (req, res)=>{
    res.render("index", {
        title : "Work TodoList",
        todoItem : workItems
    })
})
app.get("/about", (req, res)=>{
    res.render("about")
})

app.listen(3000, () => {
    console.log("The server is started");
})