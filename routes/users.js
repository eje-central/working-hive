
const User = require("../models/user");
const Roles = require("../models/roles")
const express = require("express");
const authRoutes = express.Router();
const ensureLogin = require("connect-ensure-login");

authRoutes.get("/users", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  User.find()
    .populate('users')
    .then(users => { 
      Roles.find()
        .populate("roles")
        .then(roles => {
          res.render("users", { users, user: req.user, roles });
        })
        .catch(err => {
          console.log(err);
        });
      
    })
    .catch(err => {
      console.log(err)
    })
}
);

authRoutes.get("/user/add", ensureLogin.ensureLoggedIn(), (req, res, next) => {
    Roles.find()
      .populate("roles")
      .then(roles => { 
        res.render("user-add", { user: req.user, roles });
      })
      .catch(err => {
        console.log(err);
      });
});

authRoutes.post("/user/add", ensureLogin.ensureLoggedIn(), (req, res, next) => { 
  const { username, name, rol_id, salary, pm } = req.body; 
  console.log(req.body);
  const newUser = new User({ username, name, password: "",rol_id, salary, pm });
  newUser
    .save()
    .then(() => { 
      res.json({ success: username });
    })
    .catch(err => console.log(err)); 
});

authRoutes.delete("/user/delete/:id",
  (req, res, next) => {
    let id = req.params.id;
    User.deleteOne({ _id: id }, function(
      err,
      results
    ) {});
    res.json({ success: id })
});

authRoutes.get("/user/update",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    User.find()
      .populate("users")
      .then(users => { 
        res.render("users", { users, user: req.user });
      })
      .catch(err => {
        console.log(err);
      });
  }
);

module.exports = authRoutes;