const express = require("express");
const authRoutes = express.Router();
const zxcvbn = require("zxcvbn");
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
const nodemailer = require("nodemailer");
const User = require('../models/user');
const Proyecto = require('../models/proyecto');


const bcrypt = require('bcrypt')
const bcryptSalt = 10;

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "workinghivenotifier@gmail.com",
//     pass: "Enero.2019"
//   }
// });

const transporter = nodemailer.createTransport({
  host: "smtp.ionos.mx",
  port: 465,
  auth: {
    user: "sistema@ejecentral.studio",
    pass: "R-UNuw8TZn5MpaC"
  }
});

const mailOptions = (nombre,correo) => ({
  from: "sistema@ejecentral.studio",
  to: correo,
  subject: "Working Hive",
  text: `Bienvenido al sistema ${nombre}!`
});

authRoutes.get('/signup', (req, res, next) => {
  res.render('auth/signup')
})

authRoutes.post('/signup', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password
  const name= req.body.name 
  if (username == "" || username == "") {
    res.render("auth/signup", {
      message: "Indica un nombre de usuario y contraseña"
    });
    return;
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
        res.render("auth/signup", {
          message: `El usuario ${username} ya existe`
        });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        name,
        password: hashPass
      });

      newUser.save(err => {
        if (err) {
          res.render("auth/signup", {
            message:
              "Algo salió mal al guardar el usuario. Inténtalo de nuevo mas tarde"
          });
        } else {
          transporter.sendMail(mailOptions(name, username), function(
            error,
            info
          ) {
            if (error) {
              console.log(error);
              res.render("auth/signup", {
                message:
                  "Algo salió mal al enviar el correo. Inténtalo de nuevo mas tarde"
              });
            } else {
              console.log("Email sent: " + info.response);
            }
          });
          res.redirect("/private-page");
        }
      });
    })
    .catch(error => {
      next(error);
    });
})

authRoutes.get('/login', (req, res, next) => {
  res.render('auth/login', { message: req.flash("error") })
})

authRoutes.post('/login', passport.authenticate("local", {
  successRedirect: "/home",
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

authRoutes.get('/private-mess', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render('not-assigned', { user: req.user })
})

authRoutes.get('/reportes', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  Proyecto.find()
  .then(ingresos => {
    var sumaIngresos = 0;
    var datos = [];
    var proyectos = [];
    
    ingresos.forEach(element => {
      sumaIngresos = sumaIngresos + element.cotizacion 
      datos.push(element.cotizacion)
      pedo = element.nombre
      p = pedo.toString()
      proyectos.push(p)
    });

  User.find({}, 'salary')
  .then(salary => {
    var sumaSalarios = 0;
    salary.forEach(element => {
      sumaSalarios = sumaSalarios + (element.salary?element.salary:0)

    });
      res.render('reportes', { user: req.user, sumaIngresos, sumaSalarios, datos, proyectos})
    })
  })
  .catch((err) => {console.log(err)})



  
  
})

authRoutes.get('/trabajadores', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render('trabajadores', { user: req.user })
})

authRoutes.get('/trabajadores-detalle', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render('detalle-trabajador', { user: req.user })
})

authRoutes.get('/nuevo', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  
  User.find()
  .populate('users')
  .then (userses => {
    res.render('nuevo', { user: req.user, userses })
  })
  .catch((err) => {console.log(err)})
})

// authRoutes.route('/nuevo').post(function(req, res) {
//   console.log(req.body)
//   const nuevaEtapa = new Etapa(req.body)

//   console.log("Prueba de sonido:", nuevaEtapa);
//   nuevaEtapa.save()
//     .then(ets => {
//       res.status(200).jason({status: "Etapa agregada satisfactoriamente"});
//     })
//     .catch(err => {
//       res.status(400).send("No se pudo guardar en la base")
//     });
// })  

authRoutes.post('/nuevo', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const {nombre, descripcion, dineros, fechaInicio, fechaFin, etapa, resp} = req.body;
  const color = 'is-warning';
  const pesos = new Intl.NumberFormat().format(dineros)
  const mayus = nombre.toUpperCase();
  console.log("--------->",pesos)
  Proyecto.findOne({nombre})
  .then(nom => {
    if (nom !== null) {
      res.render('nuevo', {message: 'El nombre del proyecto ya existe. Intenta poner uno nuevo'});
      return;
    }

  const proyectoNuevo = new Proyecto ({
    nombre:mayus, 
    descripcion, 
    etapas:{
      nom:etapa,
      responsable:resp
    }, 
    cotizacion:dineros,
    pesos, 
    fechaInicio, 
    fechaFin, 
    color
  });

    proyectoNuevo.save((err) => {
      if (err) {
        res.render('nuevo', {message: 'Algo salió mal'})
      } else {
        res.redirect('/home')
      }
    });
  })
    .catch (error => {
      next(error)
    })
  });

authRoutes.get('/home/:id', ensureLogin.ensureLoggedIn(), (req, res) => {
  let proyectosId = req.params.id;
  Proyecto.findOne({'_id': proyectosId})
  .populate('etapas.responsable')
  //aqui debería de ir el populate de tareas
  .then(proyecto => {
    res.render('estatusProyecto', {user: req.user, proyecto})
  })
  .catch ((err) => {console.log(err)})
})

authRoutes.get('/home', ensureLogin.ensureLoggedIn(), (req, res, next) => {

  Proyecto.find()
  .populate('etapas.responsable')
  .then (proyectos => {
    res.render('dashboard', { user: req.user, proyectos })
    console.log(proyectos)
  })
  .catch((err) => {console.log(err)})
})

authRoutes.get('/proyecto', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render('detalle-proyecto', { user: req.user })
})



module.exports = authRoutes