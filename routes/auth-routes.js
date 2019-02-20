const express = require("express");
const authRoutes = express.Router();
const zxcvbn = require("zxcvbn");
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
const nodemailer = require("nodemailer");
const User = require('../models/user');
const Proyecto = require('../models/proyecto');
const Tarea = require('../models/tarea');
const moment = require('moment')


const bcrypt = require('bcrypt')
const bcryptSalt = 10;

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.MAILPORT,
  auth: {
    user: process.env.USERMAIL,
    pass: process.env.USERPASS
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
  res.redirect('/')
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
    var etap = [];
    var enTiempo = 0;
    var atrasados = 0;
    var adelantados = 0;
    const now = new Date();

    
    function onlyUnique (value, index, self) {
      return self.indexOf(value) === index;
    }

    ingresos.forEach(element => {
    
      if(moment(element.fechaFin).isAfter(now)) {
        enTiempo = enTiempo + 1
      } else {
        atrasados = atrasados + 1
      }

      sumaIngresos = sumaIngresos + element.cotizacion 
      datos.push(element.cotizacion)

      pedo = element.nombre
      p = pedo.toString()
      proyectos.push(p)

      element.etapas.forEach(el => {
        et = {
          nom: el.nom[0],
          gen: el.genera
        }
        etap.push(et)
      })
    });

    var temp = {};
    var uniqueEtapas = null;

    for(var i = 0; i < etap.length; i++) {
      uniqueEtapas = etap[i];
      if(!temp[uniqueEtapas.nom]) {
        temp[uniqueEtapas.nom] = uniqueEtapas;
      } else {
        temp[uniqueEtapas.nom].gen += uniqueEtapas.gen;
      }
    }

    var uniqueRes = [];
    for (var prop in temp)
      uniqueRes.push(temp[prop]);
  
   
  User.find({}, 'salary')
  .then(salary => {
    var sumaSalarios = 0;
    salary.forEach(element => {
      sumaSalarios = sumaSalarios + (element.salary?element.salary:0)

    });
    var promedio = 0
    if(sumaIngresos !== 0) {
      promedio = sumaIngresos/proyectos.length;
    }
      
      res.render('reportes', { user: req.user, sumaIngresos, sumaSalarios, datos, proyectos, promedio, ingresos, enTiempo, atrasados, adelantados, uniqueRes})
    })
  })
  .catch((err) => {console.log(err)})
})

authRoutes.get('/trabajadores', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  Proyecto.find()
  .populate('etapas.responsable')
  .populate('users')
  //populate de tareas
  .then (userses => { 
    console.log(userses)
    var trabajador = [];
 
    userses.forEach(proyecto => {
      var a = moment(proyecto.fechaFin);
      var b = moment(proyecto.fechaInicio);

      pr = {
        fechaInicio: proyecto.fechaInicio, 
        fechaFin: proyecto.fechaFin,
        nombre: proyecto.nombre,
        periodo: a.diff(b,'days') + 1
      }
      proyecto.etapas.forEach(el => {
        console.log("EL ERROR:", el)
        et = {
          nom: el.responsable[0].name,
          id: el.responsable[0]._id,
          etapas: [el.nom[0]],
          gen: el.genera,
          tareas: [],
          proyecto: [pr.nombre],
          diarios: Number(el.genera)/Number(pr.periodo)
        }
        trabajador.push(et)
      })
    })

    var temp = {};
    var uniqueTrabajadores = null;

    for(var i = 0; i < trabajador.length; i++) {
      uniqueTrabajadores = trabajador[i];
      if(!temp[uniqueTrabajadores.id]) {
        temp[uniqueTrabajadores.id] = uniqueTrabajadores;
      } else {
        temp[uniqueTrabajadores.id].etapas = temp[uniqueTrabajadores.id].etapas.concat(uniqueTrabajadores.etapas);
        temp[uniqueTrabajadores.id].gen += uniqueTrabajadores.gen;
        temp[uniqueTrabajadores.id].diarios += uniqueTrabajadores.diarios;
        temp[uniqueTrabajadores.id].proyecto = temp[uniqueTrabajadores.id].proyecto.concat(uniqueTrabajadores.proyecto);
      }
    }

    var uniqueRes = [];
    for (var prop in temp)
      uniqueRes.push(temp[prop]);
    
    console.log(trabajador)
    console.log(uniqueRes)  

    res.render('trabajadores', { user: req.user, userses, uniqueRes })
  })
  .catch((err) => {console.log(err)})
})

authRoutes.get('/trabajadores/:id', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render('detalle-trabajador', { user: req.user })
})

authRoutes.get('/nuevo', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  User.find()
  .populate('users')
  .then (userses => {
    
    res.render('nuevo', { user: req.user, userses})
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
  const {nombre, descripcion, dineros, fechaInicio, fechaFin, etapa, resp, grado} = req.body;
  const color = 'is-warning';
  const pesos = new Intl.NumberFormat().format(dineros)
  const mayus = nombre.toUpperCase();
  var ets = [];



  Proyecto.findOne({'nombre': mayus})
  .then(nom => {
    console.log(nom)
    if (nom !== null) {
      res.redirect('/nuevo?e=' + encodeURIComponent('El nombre del proyecto ya existe. Intenta poner uno nuevo'));
      return;
    }

    function etapas(nombre, respon, grado) {
      return {
        nom: nombre,
        responsable: respon,
        tareas: [],
        finalizada: 'false', 
        grado: grado
      }
    }
    console.log(grado)
     if (etapa !== undefined && Array.isArray(etapa)) {
      for(var e = 0; e < etapa.length; e++){
        ets.push(etapas(etapa[e],resp[e],grado[e]))
      } 
     } else if (etapa !== undefined) {
        ets.push(etapas(etapa,resp,grado))
    } else if (etapa == undefined) {
        res.redirect('/nuevo?e=' + encodeURIComponent('El proyecto debe de contar por lo menos con una etapa'));
        return
    }
    
   if (ets.length >= 0) {
     var div = 0;
     

     ets.forEach(etapaProyecto => {
      div = div + Number(etapaProyecto.grado)
     })
    
     var d = dineros/div;
     ets.forEach(etapaProyecto => {
      etapaProyecto.genera = etapaProyecto.grado * d
     }) 
   } 


  const proyectoNuevo = new Proyecto ({
    nombre:mayus, 
    descripcion, 
    etapas: ets, 
    cotizacion:dineros,
    pesos, 
    fechaInicio, 
    fechaFin, 
    color,
    finalizado: 'false'
  });

  if (mayus == "" || descripcion == "" || ets == [] || dineros == 0 || pesos == "" || fechaInicio == "" || fechaFin == "") {
    res.redirect('/nuevo?e=' + encodeURIComponent('Favor de completar todos los campos'));
    return;
  }

    proyectoNuevo.save((err) => {
      if (err) {
        res.redirect('nuevo?e=' + encodeURIComponent('Por alguna razón no se pudo guardar el nombre. Intenta más tarde'))
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
    let date = proyecto.fechaFin.toDateString();
    let fecha = moment(date).format("MMM D YYYY");
    


    res.render('estatusProyecto', {user: req.user, proyecto, fecha})
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

authRoutes.get('/perfil', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render('perfil', { user: req.user })
})

authRoutes.get('/home-tareas', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  console.log(req.user)
  Proyecto.find()
  .then (proyectos => {
    
    var proyecto = [];
    var etapas = [];

    proyectos.forEach(element => {
      element.etapas.forEach(el => {
        if(el.responsable[0].equals(req.user._id)) {
          proyecto.push(element);
          etapas.push(el);
        }
      })
    })

    
    for(var i = 0; i < proyecto.length; i++) {
     
      for(var l = 0; l < proyecto[i].etapas.length; l++) {
       
        if(!proyecto[i].etapas[l].responsable[0].equals(req.user._id)) {
          
          proyecto[i].etapas.splice(l,1);
          l = l -1
        }
      }
    }
      
    res.render('home-gerente', {user: req.user, etapas, proyecto})
  })
  .catch ((err) => {console.log(err)})
})

authRoutes.get('/home-tareas/:id', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  let etapasId = req.params.id;
  console.log(etapasId)
  Proyecto.find()
  .then (proyectos => {
    
    var proyecto = [];
    var etapas = [];

    proyectos.forEach(element => {
      element.etapas.forEach(el => {
        if(el.responsable[0].equals(req.user._id)) {
          proyecto.push(element);
          etapas.push(el);
        }
      })
    })

    User.find()
    .then( users => {

    

    for(var i = 0; i < proyecto.length; i++) {
     
      for(var l = 0; l < proyecto[i].etapas.length; l++) {
       
        if(!proyecto[i].etapas[l].responsable[0].equals(req.user._id)) {
          
          proyecto[i].etapas.splice(l,1);
          l = l -1
        }
      }
    }


    console.log(proyecto)
    res.render('asignar-tareas', {user: req.user, proyecto, users})
  })
    })
  .catch ((err) => {console.log(err)})
})

authRoutes.post('/home-tareas', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  console.log("HOLAAAAAA", req.body)
  const {tarea, resp, grado, gen, id} = req.body;
 









  var ets;

  
  Proyecto.find()
  .then(proyecto => {
  
    function tareas(nombre, respon, grado, gen) {
      return {
        nom: nombre,
        responsable: respon,
        fechaI: '',
        fechaC: '',
        fechaF: '',
        finalizada: 'false', 
        grado: grado,
        creador: req.user.id
      }
    }

     if (tarea !== undefined && Array.isArray(tarea)) {
      for(var e = 0; e < tarea.length; e++){
        ets.push(tareas(tarea[e],resp[e],grado[e],gen))
      } 
     } else if (tarea !== undefined) {
        ets.push(tareas(tarea,resp,grado,gen))
    } else if (tarea == undefined) {
        res.redirect('/home-tareas/:id?e=' + encodeURIComponent('El proyecto debe de contar por lo menos con una tarea'));
        return
    }
    
   if (ets.length >= 0) {
     var div = 0;
     

     ets.forEach(etapaProyecto => {
      div = div + Number(etapaProyecto.grado)
     })
    
     var d = gen/div;
     //var rest= 0;
     ets.forEach(etapaProyecto => {
      etapaProyecto.genera = etapaProyecto.grado * d
     }) 
   } 

  if (ets == []) {
    res.redirect('/home-tareas/:id?e=' + encodeURIComponent('Favor de completar todos los campos'));
    return;
  }

  const newTarea = new Tarea ({nom: "algonoese3",
    responsable: req.user.id,
    fechaI: '',
    fechaC: '',
    fechaF: '',
    finalizada: 'false', 
    grado: '2',
    generaEtapa: 1,
    genera: 2112 ,
    creador: req.user.id,
  })
  newTarea
    .save()
    .then(() => {
      console.log("Se creo la tarea",req.user.id, "LOL")

      Tarea.findOne({"creador": req.user.id}, {}, { sort: { 'created_at' : -1 } }) 
      //Tarea.find()
      .then(rest => {


        console.log( "se optiene el elemento: ",rest._id );

      }) 
  


    })
    .catch(err => console.log(err)); 
    });
  })
module.exports = authRoutes