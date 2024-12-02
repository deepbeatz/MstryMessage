import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection : ConnectionObject = {
    //is able to be empty cuz "isConnected?"
}

//connecting db if not connected already
//reason for the conditionality: nextjs is an edge time framework
async function dbConnect(): Promise<void> {
    if(connection.isConnected){
        console.log("DB is already connected");
        return;
    }
    try{
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {}); // {} is for options for the connection
        // console.log("db",db);
        // console.log("db's connections array",db.connections);
        // console.log("db's connections array's 0th index",db.connections[0]);
        // console.log("db's connections array's 0th index's readystate value",db.connections[0].readyState);
        connection.isConnected = db.connections[0].readyState;
        console.log("DB connected successfully")
    }catch(error:any){
        console.log("DB connection process failed", error.message);
        process.exit(1);
    }
}

export default dbConnect
