const express = require('express');
const router = express.Router();

let Article = require('../models/article');

let User = require('../models/user');

const { check, validationResult } = require('express-validator');

router.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if(err){
            console.log(err.message);
        }
        else
        {
            // res.send({"articles": articles});
            res.render('index', 
            {
                title: "Articles",
                heading: "Articles",
                articles: articles
            });
        }
    });
}); 

router.get('/add', ensureAuthenticated, (req, res) => res.render('add_article', {
    title: 'Add Article',
    heading: "Add Article"
}));

router.get('/:id', (req,res) => {
    Article.findById(req.params.id, (err, article) => {
            // res.send({"articles": {1 : article}});
        User.findById(article.author, (err, user) => {
            console.log(user.id);
            // res.render('article', {
            //     article: article,
            //     author: user.name
            // });
        });
    });
});

router.get('/edit/:id', ensureAuthenticated, (req,res) => {
    Article.findById(req.params.id, (err, article) => {
        if(article.author != req.user._id){
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
            return;
        }
        res.render('edit_article', {
            title: 'Edit Article',
            heading: 'Edit Article',
            article: article
        });
    });
});

router.post('/add', [
    check('title').not().isEmpty().withMessage('Title can\'t be empty'),
    // check('author').not().isEmpty().withMessage('Author can\'t be empty'),
    check('body').not().isEmpty().withMessage('Body can\'t be empty'),
], (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('add_article', {
            title: 'Add Article',
            heading: 'Add Article',
            errors: errors.array()
        });
    }
    else{

        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        // article.author = req.user.name;
        article.body = req.body.body;

        article.save((err)=>{
            if(err){
                // console.log(err.message);
                req.flash('danger', 'Something went wrong. Please try again!');
                res.redirect('/add');
                return;
            }
            else{
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
    }
});

router.post('/edit/:id', (req,res) => {
    let article = {};

    article.title = req.body.title;
    article.author_id = req.user._id;
    article.author = req.user.name;
    article.body = req.body.body;

    let query = {_id:req.params.id};

    Article.updateOne(query, article, (err)=>{
        if(err){
            console.log(err.message);
            return;
        }
        else{
            req.flash('success', 'Article Updated');
            res.redirect('/articles/'+req.params.id);
        }
    });
});

router.delete('/:id', (req, res) => {

    if(!req.user._id){
        res.status(500).send();
    }

    let query = {_id: req.params.id};

    Article.findById(req.params.id, (err, article) => {
        if(article.author != req.user._id){
            res.status(500).send();
        }
        else{
            Article.remove(query, (err) => {
                if(err){
                    console.log(err.message);
                }
                else{
                    res.send('Success');
                }
            });
        }
    });
});

//Access Control

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash('danger', "Please login");
        res.redirect('/users/login');
    }
}

module.exports = router;