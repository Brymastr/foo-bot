const 
  passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy,
  BearerStrategy = require('passport-http-bearer').Strategy
  usersController = require('./controllers/usersController');

module.exports = (config, passport) => {

  passport.use(new FacebookStrategy({
      clientID: config.facebook.app_id,
      clientSecret: config.facebook.app_secret,
      callbackURL: config.url + '/auth/facebook/callback',
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
      console.log(req.query.state);
      let params = JSON.parse(req.query.state);
      console.log(req.query.state);      
      
      usersController.getUserByPlatformId(params.user_id, user => {
        user.facebook_id = profile.id;
        user.facebook_token = accessToken;
        user.save((err, doc) => {
          doc.chat_id = params.chat_id;
          done(null, doc);
        });
      });
    }
  ));

  passport.use(new BearerStrategy((token, done) => {
    User.findOne({facebook_token: token}, (err, user) => {
      if(err) return done(err);
      if(!user) return done(null, false);
      return done(null, user, {scope: 'all'})
    });
  }));
}

