const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../helpers/jwt.js');

router.post('/register', async (req, res) => {
  const { username, mobile, password, email } = req.body;
  try {
    let user = await User.findOne({ $or: [{ mobile }, { email }] });
    if (user) {
      return res.status(400).json({
        status: 'Failed',
        message: 'User with that mobile number & email address already Exists!'
      });
    }
    user = new User({ username, mobile, email, password });
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(password, salt);
    await user.save();
    return res.status(200).json({
      status: 'Success',
      message: 'User has been succesfully registered!'
    });
  } catch (err) {
    res.status(500).json({
      status: 'Failed',
      message: 'Server Error'
    });
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: 'Failed',
        message: "User with that email Address does not Exist!"
      });
    }

    //synchronously compare user entered password with hashed password
    if (bcrypt.compareSync(password, user.password)) {
      const token = auth.generateAccessToken(user.username);

      // Return User along with token as a payload
      return res.status(200).json({
        status: 'Success',
        message: `Welcome to the Salt ${user.username}!`,
        data: `${token}`
      });
    } else {
      return res.status(400).json({
        status: 'Failed',
        message: "Incorrect Password!"
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Server Error'
    });
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(400).json({
        status: 'Failed',
        message: "User with that id does not Exist!"
      });
    }
    return res.status(200).json({
      status: 'Success',
      message: `Welcome to the Salt ${user.username}!`,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Server Error'
    });
  }
});

module.exports = router;