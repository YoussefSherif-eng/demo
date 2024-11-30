const router = require("express").Router();
const conn = require("../db/dbConnention");
const { body, validationResult } = require('express-validator');
const util = require("util");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const admin = require("../middleware/admin");
const upload = require("../middleware/uploadImage");



router.post("/register" , 
            body("email").isEmail().withMessage("please enter  a valid email"), 
            body("name").isString().withMessage("please enter  a valid name"), 
            body("phone").isNumeric().withMessage("please enter  a valid phone"), 
            body("age").isNumeric().withMessage("please enter  a valid age"), 
            body("password"), 
            async (req, res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const query = util.promisify(conn.query).bind(conn);
        const checkEmail = await query("select * from users where email =?", [req.body.email]);
        if(checkEmail.length >0 ){
            res.status(400).json({
                errors : [{
                        "mag":"email already exists"
                }]
        })
        }

        const userData = {
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password , 6),
            token: crypto.randomBytes(16).toString("hex"),
            phone: req.body.phone,
            age: req.body.age,
            role: 0 ,
        }
        
        await query("insert into users set ?" , userData );
        delete userData.password;
        res.status(200).json(userData);
        // res.json("success!")
        } 
        catch (err){    
        // res.status(500).json({err : err});
        }
})

router.post("/registerEmployers" , admin ,
            body("email").isEmail().withMessage("please enter  a valid email"), 
            body("name").isString().withMessage("please enter  a valid name"), 
            body("password"), 
            async (req, res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const query = util.promisify(conn.query).bind(conn);
        const checkEmail = await query("select * from users where email =?", [req.body.email]);
        if(checkEmail.length >0 ){
            res.status(400).json({
                errors : [{
                        "mag":"email already exists"
                }]
        })
        }

        const userData = {
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password , 6),
            token: crypto.randomBytes(16).toString("hex"),
            role : 1,
        }
        
        await query("insert into users set ?" , userData );
        delete userData.password;
        res.status(200).json(userData);
        // res.json("success!")
        } 
        catch (err){
        // res.status(500).json({err : err});
        }
})

router.post("/login" , 
            body("email").isEmail().withMessage("please enter  a valid email"), 
            body("password"), 
            async (req, res)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const query = util.promisify(conn.query).bind(conn);
        const checkEmail = await query("select * from users where email =?", [req.body.email]);
        if(checkEmail.length == 0 ){
            res.status(400).json({
                errors : [{
                        "mag":"email or password not found"
                }]
        })
        }
        
        const checkPassword = await bcrypt.compare(req.body.password , checkEmail[0].password)
        if(checkPassword){
            delete checkEmail[0].password;
            res.status(200).json(checkEmail[0])
        } else{
            res.status(400).json({
                errors : [{
                        "mag":"email or password not found"
                }]
        })
        }

        res.json("success!")
        } 
        catch (err){
        // res.status(500).json({err : err});
        }
})

module.exports = router ;