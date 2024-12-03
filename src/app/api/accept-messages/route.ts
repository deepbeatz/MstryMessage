import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
//getServerSession is used here to get the session (next-auth helps us with that) from which we can extract the user info
//getServerSession needs authOptions to get provoded with the credentials for that session
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

//post api to change message acceptance status
export async function POST(request:Request){
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
    //now as user is logged in we will extract the id and acceptMessages boolean value given by the user
    //as in the logged in user is toggling the accepting messages button and so we are trying to update that in the database in try-catch block
    const userId = user._id
    const {acceptMessages} = await request.json()
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId,{isAcceptingMessages:acceptMessages},{new:true})
        if(!updatedUser){
            return Response.json({
                success:false,
                message:"Failed to update message acceptance status"
            },{
                status:401
            })
        }
        return Response.json({
            success:true,
            message:"Message acceptance status updated successfully",
            updatedUser
        },{
            status:200
        })
    } catch (error) {
        console.log("Failed to update message acceptance status")
        return Response.json({
            success:false,
            message:"Failed to update message acceptance status"
        },{
            status:500
        })
    }
}

//get api to get acceptance status
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
    const userId = user._id
    try {
        const foundUser = await UserModel.findById(userId)
        if(!foundUser){
            return Response.json({
                success:false,
                message:"User not found"
            },{
                status:404
            })
        }
        return Response.json({
            success:true,
            // message:"",
            isAcceptingMessages : foundUser.isAcceptingMessages
        },{
            status:200
        })
    } catch (error) {
        console.log("Error in getting message acceptance status", error)
        return Response.json({
            success:false,
            message:"Error in getting message acceptance status"
        },{
            status:500
        })
    }
}