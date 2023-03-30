const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { findOne } = require("../models/User");
var fetchUser = require('../middleware/fetchUser')

//Route1: creating a user using Post: api/auth/createuser
const jwt_secret = "535354";
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 5 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Enter atleast 5 letters").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let success = false
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({success,  error: "sorry user with this email already exists" });
      }
      //creating salt to protect password
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      //   console.log(secPass)
      //   .then(user => res.json(user))
      //   .catch((err)=>{console.log(err)
      // res.json({error: 'Please enter unique value for email', message : err.message})})

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, jwt_secret);
      success = true;
      res.json({success, authToken});
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some error has occured");
    }
  }
);

//Route2: authenticating a user using api/auth/login

router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "password cannot be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ error: "please try to login with correct credentials" });
      }

      const comparePass = await bcrypt.compare(password, user.password);
      if (!comparePass) {
        success = false;
        return res
          .status(400)
          .json({success,  error: "please try to login with correct credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, jwt_secret);
      success = true;
      res.json({success, authToken});
    } catch (error) {
      console.error(error.message);
      res.status(400).send("Internal server error");
    }
  }
);

//Route3: get login user details using api/auth/getuser

router.post(
  "/getuser",
  fetchUser,
  async (req, res) => {
    try {
      const userid = req.user.id;
      const user = await User.findById(userid).select("-password");
      res.send(user);
    } catch (error) {
      console.error(error.message);
      res.status(400).send("Internal server error");
    }
  }
);
module.exports = router;
