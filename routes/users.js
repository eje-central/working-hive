
const User = require("../models/user");
const express = require("express");
const authRoutes = express.Router();
const ensureLogin = require("connect-ensure-login");

authRoutes.get("/users", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  User.find()
    .populate('users')
    .then(users => {
      console.log("users:::", users);
      res.render("users", { users, user: req.user });
    })
    .catch(err => {
      console.log(err)
    })
}
);

authRoutes.get("/user/add", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render("user-add", { user: req.user });
});

authRoutes.get("/user/delete", 
  ensureLogin.ensureLoggedIn(), 
  (req, res, next) => {
    User.find()
    .populate("users")
    .then(users => {
      console.log("users:::", users);
      res.render("users", { users, user: req.user });
    })
    .catch(err => {
      console.log(err);
    });
});

authRoutes.get("/user/update",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    User.find()
      .populate("users")
      .then(users => {
        console.log("users:::", users);
        res.render("users", { users, user: req.user });
      })
      .catch(err => {
        console.log(err);
      });
  }
);

module.exports = authRoutes;