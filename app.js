const express = require("express")
const app = express()
const ejs = require("ejs")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const bodyParser = require("body-parser")
const passport = require("passport")
app.use(bodyParser.urlencoded({extended : false}))

// EJS and CSS
app.use(express.static("public"));
app.set("view engine", "ejs");

// Middlewares
const isLoggedinAuth = (req, res, next)=>{
    if(req.user){
        next()
    }
    else{
        res.redirect("/")
    }
}
const isLoggedinGuest = (req, res,next)=>{
    if(req.user){
        res.redirect("/todolist")
    }
    else{
        next()
    }
}

// Database
const connectDB = async()=>{
    try {
        const conn = await mongoose.connect("mongodb+srv://Nithish:Nithi123@cluster0.opxxrpx.mongodb.net/Todolist?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useFindAndModify: false,
        })
        console.log(`MongoDB connected in: ${conn.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
connectDB()
const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})
const User = mongoose.model("User", UserSchema)
module.exports = User

const TodoItemSchema = new mongoose.Schema({
    item: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})
const Todoitem = mongoose.model("Todoitem", TodoItemSchema)

// Require AUTH
require("./auth")

// Passport and session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://Nithish:Nithi123@cluster0.opxxrpx.mongodb.net/Todolist?retryWrites=true&w=majority",
        mongooseConnection: mongoose.connection
    })
  }))
app.use(passport.initialize())
app.use(passport.session())

app.get("/auth/google", 
  passport.authenticate("google",{
    scope: ["email", "profile"]
  })
)
app.get("/auth/google/callback",
  passport.authenticate("google",{
    successRedirect: "/todolist",
    failureRedirect: "/"
  })
)

app.get("/", isLoggedinGuest, (req, res)=>{
    res.render("login")
})
app.get("/todolist", isLoggedinAuth, async (req, res)=>{
    try {
        const todo = await Todoitem.find({ user: req.user._id }).lean()
        if(todo.length==0){
            const todoItems = [
                {item: "Welcome to TODO"},
                {item: "Enter a new Todo"},
                {item: "Become productive"}
            ]
            res.render("index",{
                title : "TodoList",
                todoItem : todoItems
            })
        }
        else{
            res.render("index",{
                todoItem : todo
            })
        }
    }
    catch (err) {
        console.error(err);
    }
})

app.post("/todolist", async (req, res)=>{
    req.body.user = req.user._id
    try {
        let newUser = {
            item: req.body.item,
            user: req.user._id
        }
        await Todoitem.create(newUser)
        res.redirect("/todolist")
    } catch (err) {
        console.error(err);
    }
})

app.post("/delete/:topic", async (req, res)=>{
    try {
        await Todoitem.remove({ _id: req.params.topic })
        res.redirect("/todolist")
    } catch (err) {
        console.error(err);
    }
})



app.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      req.session.destroy()
      res.redirect('/');
    });
});
app.listen(process.env.PORT || 3000, () => {
    console.log("The server has started");
})


