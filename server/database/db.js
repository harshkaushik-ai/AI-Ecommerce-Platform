import {config} from "dotenv"
import pkg from "pg"
config();

const {Client}= pkg

const database = new Client({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_NAME,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT,
    ssl:{
        required:true,
    }
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