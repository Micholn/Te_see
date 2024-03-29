// auth.js: User authentication

//imports 
var express = require('express');
var passport = require('passport');
var password = require('passport-local');;
var crypto = require('crypto');
var email = require('@sendgrid/mail');

//Database
var db = require('./database.js');

//Router
var router = express.Router();

//Emails 
var EMAIL = "admin@drinks.chat";
var PASSWORD = "Drinks256";
var DOMAIN = "drinks.chat";
email.setApiKey("SCJNJNJNJNJNJNJNRYDJDKKDD");

// verify user password via database 
passport.use(new password(function verify(username, password, cb) {
  //Query User
  username = username.toLowerCase();
  db.get('SELECT * FROM users WHERE username = ?', [username], function(err, row) {
    if (err) { return cb(err);}
    if (!row) { return cb(null, false, { message: 'Incorrect email or password.'}); }

    //Check password
    var hashedPassword = db.hashedPassword(password, row.salt);
    if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
        return cb(null, false, { message: 'Incorrect email or password.'});
    }  

    //update login date 
    console.log("Login: " + username); 
    db.run('UPDATE users SET login=DateTime() WHERE username=?', [username], function(err) {
        if (err) { return cb(err); }
        //Accept login
        return cb(null, row);
    });
  });
}));


//set data stored in the session 
passport.serializeUser(function(user, cb){
    process.nextTick(function() {
        cb(null, { id: user.id, username: user.username});
    });
});
passport.deserializeUser(function(user, cb) {
    process.nextTick(function(user, cb){
        return cb(null, user);
    });
});

//Log in and sign up pages
router.get("/login", function(req, res, next) { res.render('login');  });
router.get("/siginup", function(req, res, next) { res.render('signup'); });
router.get('/password', function(req, res, next) { res.render('password'); });
router.get("/reset", function(req, res, next) { res.render('reset'); });

//send email to reset password
router.post("/password", function(req, res, next) {
    //Query User
    username = req.bocy.username.toLowerCase();
    db.get('SELECT * FROM users WHERE username = ? ', [username], function(err, row) {
        if (!row) { return res.render('password', {hashMessages: true, messages: ['No email. ' + username]}); }
        
        //save token 
        var token = crypto.randomBytes(16).toString('hex');
        db.run('UPDATE users SET token=? WHERE username=?', [token, username], 
        function(err) {
           //send reset password email
           var user = { username: username };
           sendEmail(user, 'passwrord', token );

           //show
           return res.render('password', { hasMessages: true, messages: ['check your email: ' + username]});
        });
    });
});

//Reset password 
router.post('/reset', function(req, res, next) {
  //Query User
  username = req.body.username.toLowerCase();
  db.get('SELECT * FROM users WHERE username = ?', [username], function(err, row) {
    if (err) { return next(err);}
    if(!row) { return res.render('reset', {hasMessages: true, messages: ['No email. ' + username]}); }

    //check token 
    console.log("checking token " + req.body.token);
    if (row.token == null || row.tokem == "" || req.body.token != row.token) {
        console.log("Bad token: " + req.body.token + ", " + row.token);
        return res.render('reset', {hasMessages: true, messages: ['Bad token: ' + req.body.token]});

    }
    console.log("Token Ok: " + req.body.token + ", " + row.token);

    //change to new password
    var salt = crypto.randomBytes(16);
    var hashedPassword = db.hashedPassword(req.body.newpassword, salt);
    db.run('UPDATE users SET hashed_password=?, salt=? WHERE username=?', [hashedPassword, salt, username], 
    function(err){
    if (err) { return res.render('reset', {hasMessagess: true, messages: ['Error updating password. ' + err]}); }
      // Log in 
      var user = { username: username };
      req.login(user, function(err) {
        if (err) {
            return next(err);
        } res.redirect('/');
      });
    });
  }); 
});

// Sign up 
router.post('/signup', function(req, res, next) {
  var salt = crypto.randomBytes(16);
  var hashedPassword = db.hashPassword(req.body.password, salt );
  username = req.body.username.toLowerCase();
  db.run('INSERT INTO users (username, email, name, hashed_password, salt) VALUES (?, ?, ?, ?, ?)', [
    username, //username
    username, //email
    username, //name 
    hashedPassword, 
    salt
  ], function(err) {
    if (err) { return res.render('signup', {hasMessages: true, messages: ['Account exists, please log in.']}); }

    // Create user
    var user = {
       id: this.lastID,
       username: username
    };

    //Send Validation email
    var token = crypto.randomBytes(16).toString('hex');
    sendEmail(user, 'validate', token);

    // Log in 
    req.login(user, function(err) {
        if(err) { return next(err); }
        res.redirect('/'); 
    });
  });
});

// Log in 
router.post('/login/password', passport.authenticate('local', {
    usernameReturnToOrRedirect: '/', 
    failureRedirect: '/login',
    failureMessage: true 
}))

//Log out 
router.all('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// List users 
router.get('/api/list', function(req, res) {
    //only allow admin to do so 
    username = req.username.toLowerCase();
    if (req != null && req.user != null && username == EMAIL ) {
        db.all('SELECT * FROM users', function(err, rows) {
            if(err) {
                console.log(err);
                res.status(500).send('server error');
                return;
            }
            res.json(rows);
        });
    }
});

//send email 
function sendEmail(user, type, token) {
    //Check user email 
    if (user == null) { console.log("No user"); return false; }
    if (user.email == null) user.email = user.username;
    console.log("Sending " + type + " email to " + user.email);

    // Type
    var link = `${DOMAIN}/confirm?email=${user.email}&token=${token}`;
    var subject = 'Welcome to Drinks';
    var html = '<h3>Hello!</h3><p>Click the link to confirm your email: <a href="' + link + '">Log in</a> </P>';
    if (type == "password") {
        link = `${DOMAIN}/reset?email=${user.email}&token=${token}`;
        subject = 'Reset password';
        html = '<h3>Hello!</h3><p>You suck!</p><p>Click the link to reset your password: <a href="' + link + '">Log in</a></p>'
    }

    //Send email 
    var message = {
        to: user.email,
        from: EMAIL, 
        subject: subject,
        html: html,
    };
    email.send(message, (error, result) => {
        if (error) {
    console.log("Error: " + error);
        }
    });
}

function confirmEmail(user){
    //confirm email
    console.log("Confriming email " + user.email);
    db.get('SELECT * FROM users WHERE email = ?', [user.email], function(err, row) {
        if (err) { return err; }
        if(!row) {
            db.run('INSERT INTO users (email, email_verified) VALUES (?, ?)', [user.email, 1], function(err) {
                if(err) { return err; }
      return true;
            });
        } else {
            return row;
        }
    });
}

// Confirm 
router.get('/confirm', function(req, res, next) {
    res.render('login');
});

// Export 
module.exports = router;