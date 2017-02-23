var cookieParser = require('cookie-parser');
var session = require('express-session');

// User API
module.exports = function(app, config){
    // authentification
    app.use(cookieParser());
    app.use(session({
        secret: '1234567890QWERTY',
        resave: true,
        saveUninitialized: true
    }));

    app.requireRole = function requireRole(role) {
        return function(req, res, next) {
            if(req.session.role === role && req.session.isLoggedIn)
                next();
            else
                res.sendStatus(403);
        }
    }
    // get user
    app.get('/api/user', function(req, res){
        if(typeof req.session.role === 'undefined'){
            req.session.role = 'user';
        }
        if(typeof req.session.isLoggedIn === 'undefined'){
            req.session.isLoggedIn = false;
        }
        res.json({role: req.session.role, isLoggedIn: req.session.isLoggedIn});
    });

    // admin login
    app.post('/api/login', function(req, res){
        if(req.body.name === config.admin_user && req.body.password === config.password){
            req.session.role = 'admin';
            req.session.isLoggedIn = true;
        }
        else{
            req.session.role = 'user';
            req.session.isLoggedIn = false;
        }
        app.broadcast('admin is logged','SUCCESS');
        res.json({role: req.session.role, isLoggedIn: req.session.isLoggedIn});
    });

    // admin logout
    app.post('/api/logout', function(req, res){
        req.session.role = 'user';
        req.session.isLoggedIn = false;  
        app.broadcast('admin is logged out','SUCCESS');
        res.json({role: req.session.role, isLoggedIn: req.session.isLoggedIn});
    });
}