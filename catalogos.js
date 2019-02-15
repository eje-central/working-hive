const mongoose = require('mongoose');
const catalogoRol = require('./models/roles'); 

//const dbtitle = "eje-central";
//mongoose.connect(`mongodb://localhost/${dbtitle}`);
mongoose
  //.connect('mongodb://localhost/eje-central', {useNewUrlParser: true})
  .connect(
    "mongodb://ejecentral:ejecentral@clustercdmx-shard-00-00-wysw9.gcp.mongodb.net:27017,clustercdmx-shard-00-01-wysw9.gcp.mongodb.net:27017,clustercdmx-shard-00-02-wysw9.gcp.mongodb.net:27017/test?ssl=true&replicaSet=ClusterCDMX-shard-0&authSource=admin&retryWrites=true",
    { useNewUrlParser: true }
  )
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });
catalogoRol.collection.drop(); 

const roles = [
  {
    //_id: 1,
    description: "Directivo",
    admin: 1
  },
  {
    //_id: 2,
    description: "Gerente",
    admin: 2
  },
  {
    //_id: 3,
    description: "Sub Gerente",
    admin: 3
  }
];

catalogoRol.create(roles, err => {
  if (err) {
    throw err;
  }
  console.log(`Created ${roles.length} roles`);
  mongoose.connection.close();
});