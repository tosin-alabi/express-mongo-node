const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

let User = require('./models/users');

//connect to mongo db
mongoose.connect('mongodb://localhost/nodekb',{useNewUrlParser:true})

let db = mongoose.connection;

//check successful connection
db.once(('open'),() => {
    console.log('connection successful')
});

//check db errors
db.on(('error'), (err) => {
    console.log(err);
});


const app = express();

//view engines
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    // cookie: { secure: true }
  }));

  //express messages middleware
  app.use(require('connect-flash')());
    app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//home route
app.get('/', (req, res) => {
    User.find({}, (err, users) => {
        if(err)
        {
            console.log(err);
            return;
        }
        else
        {
            res.render('index', {
                title : 'Users',
                users: users
            })
        }
    })
});


//express-validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg : msg,
            value : value
        };
    }
}))

// add_user route
app.get('/user', (req, res) => {
    res.render('add_user', {
        title: "Add User",
    })
})

// user/add route
app.post('/user/add', (req, res) => {

    req.checkBody('firstName','First Name is required!').notEmpty();
    req.checkBody('lastName','Last Name is required!').notEmpty();
    req.checkBody('email','Email is required!').notEmpty();
    req.checkBody('bio','Biography is required is required!').notEmpty();

    let errors = req.validationErrors();
    if(errors)
    {
        // res.render('add_user', {
        //     title: "Add User",
        //     errors : errors
        // })

        console.log(errors)

    }
    else
    {
        const user = new User();

        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        user.bio = req.body.bio;

        //console.log(user);

        user.save((err) => {
            if(err)
            {
                console.log(err);
                return;
            }
            else
            {
                req.flash('success', 'User Added')
                res.redirect('/');
            }
        })
    }  
});

app.delete("/users/delete/:id", (req, res) => {
    //console.log(req.params.id);
    User.remove({_id : Object(req.params.id)}, (err) => {
        if(err){
            console.log(err);
            return;
        }
        res.redirect('/');
    })
});

// edit user
app.get("/user/edit/:id", (req, res) => {
    User.findById(req.params.id, (err, user) => {
        //console.log(user);
        res.render('edit_user', {
            title : "Edit & Update",
            user : user
        })
    })
});

//update user
app.post("/user/update/:id", (req, res) => {
    const user = {};

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.bio = req.body.bio;
    user.email = req.body.email;

    User.findByIdAndUpdate(req.params.id, user, (err) => {
        if(err)
        {
            console.log(err);
            return;
        }
        else
        {
            res.redirect('/');
        }
    })
})




app.listen(3000, () => console.log('Server started @ port 3000'));