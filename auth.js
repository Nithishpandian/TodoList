const passport = require("passport");
const User = require("./app");

const  GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

const GOOGLE_CLIENT_ID = "62854674734-5tgmddca1520frtufg5jtdtdg2hq33ot.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"
const callbackURL = "https://todolist-jh81.onrender.com/auth/google/callback" || "http://localhost:3000/auth/google/callback"

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    passReqToCallback   : true
  },
  async function(request, accessToken, refreshToken, profile, done) {
    const newUser = {
        googleId: profile.id,
        displayName: profile.displayName,
        image: profile.photos[0].value
    }
    try {
        let user = await User.findOne({ googleId: profile.id })
        if(user){
            done(null, user);
        }
        else{
            user = User.create(newUser)
            done(null, user)
        }
    } 
    catch (err) {
        console.error(err);
    }
  }
));

passport.serializeUser((user, done)=>{
    done(null, user);
})
passport.deserializeUser((user, done)=>{
    done(null, user);
})
