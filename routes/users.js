
const User = require("../models/user");
const Roles = require("../models/roles")
const express = require("express");
const authRoutes = express.Router();
const ensureLogin = require("connect-ensure-login");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ionos.mx",
  port: 465,
  auth: {
    user: "sistema@ejecentral.studio",
    pass: "R-UNuw8TZn5MpaC"
  }
});
const mailOptions = (nombre, correo, mensaje) => ({
  from: "sistema@ejecentral.studio",
  to: correo,
  subject: "Working Hive",
  text: `¡Hola! ${nombre}!, ${mensaje}`
});
authRoutes.get("/usuarios", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  User.find() 
    .populate('rol')
    .then(users => { 
      Roles.find() 
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

authRoutes.get("/user/:id", ensureLogin.ensureLoggedIn(),
  (req, res) => {
    let id = req.params.id;
    User.findOne({ '_id': id })
    .then(user => { 
      res.json({ success:true, user })
    })
    .catch(err => { 
      res.json({ success: false, err })
    });
  });

authRoutes.get("/user/add", ensureLogin.ensureLoggedIn(), (req, res) => {
    Roles.find()
      .populate("Roles")
      .then(roles => { 
        res.render("user-add", { user: req.user, roles });
      })
      .catch(err => {
        console.log(err);
      });
});

authRoutes.post("/user/add", ensureLogin.ensureLoggedIn(), (req, res, next) => { 
  const { username, name, rol, salary, pm } = req.body; 
  console.log(req.body);
  User.findOne({ username })
    .then(user => {
      if (user !== null) {
        res.json({
          success: false,
          message: `El usuario ${username} ya existe`
        }); 
      }else{ 
        const newUser = new User({ username, name, password: "", rol, salary, pm });
        newUser
          .save()
          .then(() => {
            res.json({ success: username });
          })
          .catch(err => console.log(err)); 
      }
    })
    .catch(error => {
      next(error);
    });
});

authRoutes.delete("/user/delete/:id",
  (req, res, next) => {
    let id = req.params.id;
    User.deleteOne({ _id: id }, function(
      err,
      results
    ) {
      res.json({ success: id })
    });
    
});

authRoutes.put("/user/update",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    const { username, name, rol, salary, pm } = req.body;
    User.findOne({ username }) 
      .then(user => {   
        User.updateOne({ _id: user._id }, { $set: { username, name, rol, salary, pm } })
          .then(resp => { 
            res.json({ success: true})
          })
          .catch((error) => {  
            res.json({ success: false, error })
          })
      })
      .catch(err => {
        console.log(err);
      });
  }
);

authRoutes.put("/user/updatePassword",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    let { userId, currentpwd, newpwd} = req.body;
    User.findOne({ '_id': userId })
      .then(user => {
        if (!bcrypt.compareSync(currentpwd, user.password)) {
          res.json({ success: false, mensaje: "Contraseña incorrecta" })
        }else{
          //res.json({ success: true, mensaje: "contraseña CORRECTA"  })
          const salt = bcrypt.genSaltSync(10);
          const hashPass = bcrypt.hashSync(newpwd, salt);
          User.updateOne({ _id: user._id }, { $set: { password: hashPass } })
            .then(resp => {
              transporter.sendMail(mailOptions(user.name, user.username, `tu contraseña se actualizó correctamente. <br> <b>Nueva contraseña:</b>${newpwd}`), function (
                error,
                info
              ) {
                if (error) {
                  console.log(error);
                   
                } else {
                  console.log("Email sent: " + info.response);
                }
              });
              
              res.json({ success: true, mensaje: "Contraseña actualizada correctamente." })

            })
            .catch((error) => {
              res.json({ success: false, error })
            })
        }
      })
      .catch(err => {
        console.log(err);
        res.json({ success: false })
      }); 
  }
);
 
module.exports = authRoutes;