const express = require('express');
const router = express.Router();
const User =require('../models/users');
const multer = require('multer');
const fs = require("fs");  //for image

//image upload

var storage = multer.diskStorage({
        destination:function(req, file ,cb){
                cb(null, './uploads');
        },
        filename:function(req, file ,cb){
                cb(null,file.fieldname+"_"+Date.now()+"_"+ file.originalname);
        },

});

var upload = multer({
        storage:storage,
}).single("image");  //file name attribute


//insert an user into database
router.post("/add", upload, (req ,res)=>{

        const user = new User({
                name:req.body.name,
                email:req.body.email,
                phone:req.body.phone,
                image:req.file.filename,
        });
        user.save()
    .then(() => {
        req.session.message = {
            type: 'success',
            message: 'User added successfully'
        };
        res.redirect("/");
    })
    .catch((err) => {
        res.json({ message: err.message, type: 'danger' });
    });

});

//get all user route
router.get("/", (req, res) => {
        User.find().exec()
            .then((users) => {
                res.render("index", { title: "Home page", users: users });
            })
            .catch((err) => {
                res.json({ message: err.message });
            });
    });

    // edit all users
    router.get('/edit/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const user = await User.findById(id);
    
            if (!user) {
                return res.redirect('/');
            }
    
            res.render('edit_users', {
                title: 'Edit users',
                user: user,
            });
        } catch (err) {
            console.error(err);
            res.redirect('/');
        }
    });
    // update user Route

    router.post('/update/:id', upload, async (req, res) => {
        try {
            const id = req.params.id;
            let new_image = '';
    
            if (req.file) {
                new_image = req.file.filename;
                try {
                    await fs.unlink('./uploads/' + req.body.old_image);
                } catch (err) {
                    console.error(err);
                }
            } else {
                new_image = req.body.old_image;
            }
    
            await User.findByIdAndUpdate(id, {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                image: new_image, // Use the new_image variable
            });
    
            req.session.message = {
                type: 'success',
                message: 'User updated successfully',
            };
    
            res.redirect('/');
        } catch (err) {
            console.error(err);
            res.json({ message: err.message, type: 'danger' });
        }
    });

    // Delete user Routes

    router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await User.findByIdAndDelete(id);

        if (result && result.image !== '') {
            try {
                await fs.unlink('./uploads/' + result.image);
            } catch (err) {
                console.error(err);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'User Deleted successfully',
        };

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.json({ message: err.message });
    }
});

router.get("/add", (req,res)=>{
        // res.send("Home Page")
        res.render("add_users", {title:"Add Users"});
});

module.exports=router;
