//in general this object is used to communicate with the database, not authentication
//exclusively accessible to server components
import {drizzle} from 'drizzle-orm/postgres-js' 
//postgres client 
import postgres from 'postgres';
import * as dotenv from 'dotenv';
//you know what schema, recall the idiotites
import * as schema from '../../../migrations/schema';//handle db migrations
import { migrate } from 'drizzle-orm/postgres-js/migrator';
dotenv.config({path:".env"});

if(!process.env.DATABASE_URL){
    console.log("no database URL");
}

//postgres client setup
const client = postgres(process.env.DATABASE_URL as string,{max:1});
//drizzle DB instance
const db = drizzle(client,{schema});
const migrateDb = async () =>{
    try {
        // console.log("Migrating Client");
        await migrate(db,{migrationsFolder:"migrations"})   
        // console.log("Successfully Migrated!");
    } catch (error) {
        console.log("error at db.ts: ",error)
    }
}
migrateDb();

export default db;