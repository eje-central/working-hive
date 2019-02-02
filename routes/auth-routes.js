const express = require("express");
const authRoutes = express.Router();
const zxcvbn = require("zxcvbn");
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
const nodemailer = require("nodemailer");
const User = require('../models/user');

const bcrypt = require('bcrypt')
const bcryptSalt = 10
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noedabid@gmail.com",
    pass: "Noviembre2017"
  }
});

var mailOptions = {
  from: "hector@ejecentral.com.mx",
  to: "porfirio.romo@yahoo.com.mx",
  subject: "Test from Working Hive",
  text: "Bienvenido al sistema!"
};

authRoutes.get('/signup', (req, res, next) => {
  res.render('auth/signup')
})

authRoutes.post('/signup', (req, res, next) => {
  const username = req.body.username
  const password = req.body.password
  const name= req.body.name
  if (username == "" || password == "") {
    res.render('auth/signup', {
      message: 'Indica un nombre de usuario y contraseña'
    })
    return
  }
  if (zxcvbn(password).score < 1) {
    res.render('auth/signup', {
      //message: zxcvbn(password).feedback.warning
      message: "Recuerda que tu información personal es muy importante para nosotros, ¿serías tan amable de pensar en una mejor contraseña?"
    })
    return
  }
  User.findOne({ username })
    .then(user => {
      if (user !== null) {
        res.render('auth/signup', {
          message: 'El usuario ingresado ya existe'
        })
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt)
      const hashPass = bcrypt.hashSync(password, salt)

      const newUser = new User({
        username,
        name,
        password: hashPass
      })

      newUser.save((err) => {
        if (err) {
          res.render('auth/signup', {
            message: 'Algo salió mal y no pude guardar tu registro. Inténtalo de nuevo mas tarde'
          })
        } else {
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          res.redirect('/')
        }
      })
    })
    .catch(error => {
      next(error)
    })
})

authRoutes.get('/login', (req, res, next) => {
  res.render('auth/login', { message: req.flash("error") })
})

authRoutes.post('/login', passport.authenticate("local", {
  successRedirect: "/private-page",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}))

authRoutes.get('/private-page', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render('private', { user: req.user })
})

authRoutes.get('/logout', (req, res, next) => {
  req.logout()
  res.redirect('login')
})
module.exports = authRoutes