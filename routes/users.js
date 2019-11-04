const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport');

let User = require('../models/user');

const { check, validationResult } = require('express-validator');

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('email').not().isEmpty().withMessage('Email is required'),
    check('email').isEmail().withMessage('Email is invalid'),
    check('username').not().isEmpty().withMessage('Username is required'),
    check('password').not().isEmpty().withMessage('Password is required'),
    check('password2').custom((value,{req, loc, path}) => { 
        if(value.length !== 0)
        {
            if (value !== req.body.password) {
                // throw error if passwords do not match
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        }
        else
        {
            throw new Error("Confirm Password is required");
        }
    })
], (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('register', {
            errors: errors.array()
        });
    }
    else{
        let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) =>{
                if(err){
                    res.render('register', {
                        errors: [{msg: "Something went wrong. Please try again!"}]
                    });
                }
                else{
                    newUser.password = hash;
                    newUser.save((err) => {
                        if(err){
                            res.render('register', {
                                errors: [{msg: "Something went wrong. Please try again!"}]
                            });
                        }
                        else{
                            req.flash('success', "You are now registered. Please login to continue");
                            res.redirect('/users/login');
                        }
                    });
                }
            });
        });
    }
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "You have been logged out");
    res.redirect('/users/login');
});

module.exports = router;