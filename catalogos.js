const mongoose = require('mongoose');
const catalogoRol = require('./models/roles'); 

const dbtitle = "eje-central";
mongoose.connect(`mongodb://localhost/${dbtitle}`);
catalogoRol.collection.drop(); 

const roles = [
  {
    _id: 1,
    description: "Directivo"
  },
  {
    _id: 2,
    description: "Gerente"
  },
  {
    _id: 3,
    description: "Sub Gerente"
  }
];

catalogoRol.create(roles, err => {
  if (err) {
    throw err;
  }
  console.log(`Created ${roles.length} roles`);
  mongoose.connection.close();
});