import pkg from "pg"

const {Client}= pkg

const database = new Client({
    user:"postgres",
    host:"localhost",
    database:"ecommerce",
    password:"8882688138",
    port:5432,
})

try{
   await database.connect()
   console.log("database connected successfully")
}
catch(error){
    console.log("unable to connect datbase",error)
    process.exit(1);
}

export default database;