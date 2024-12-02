//messages was an array of Document type (see User.ts file in model folder)
//so straight dumping an array will not be an optimised approach, cuz array might be large and heavy
//so we will use an aggregation pipeline here

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request:Request){
    await dbConnect()
    //getServerSession will now give the currently logged in user
    const session = await getServerSession(authOptions)
    const user: User= session?.user as User //'User' is for type safety just cuz we using typescript
    //this above line might have a bug
    if(!session || !session.user){ //means that user not logged in
        return Response.json({
            success:false,
            message:"Not Authenticated"
        },{
            status:401
        })
    }
    //now as user is logged in we will extract the info
    //const userId = user._id gives a string id which will give issue in aggregation pipeline
    const userId = new mongoose.Types.ObjectId(user._id) //so we have to create a mongoose object from that string
    try {
        //aggregation pipelines
        const user = await UserModel.aggregate([
            {$match:{id:userId}},
            //internal parameters in mongodb need to be given here in this format: '$___'
            {$unwind:'$messages'},//unwinds the single array into objects (each element has the same "_id" therefore)
            {$sort:{'messages.createdAt':-1}},//-1 is for the descending order (all the objects sorted in terms of creation date)
            {$group:{_id:'$_id',messages:{$push:'$messages'}}}//lastly grouping all the objects into a single one having id and messages object (sorted)
        ])
        if(!user || user.length===0){
            return Response.json({
                success:false,
                message:"User not found"
            },{
                status:401
            })
        }
        return Response.json({
            success:true,
            // message:"",
            messages:user[0].messages
        },{
            status:200
        })
    } catch (error) {
        console.log("An unexpected error occured: ",error)
        return Response.json({
            success:false,
            message:"Error while fetching messages"
        },{
            status:500
        })
    }
}