//a better way to delete a message from the message array would be to use mongodb's $pull operator
//$pull operator removes from an existing array all instances of a value or values that match a specified condition.

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function DELETE(request:Request, {params}:{params: {messageid: string}}){
    await dbConnect()
    const messageId = params.messageid
    //getServerSession will now give the currently logged in user
    const session = await getServerSession(authOptions)
    const user: User= session?.user as User //'User' is for type safety just cuz we using typescript
    if(!session || !session.user){ //means that user not logged in
        return Response.json({
            success:false,
            message:"Not Authenticated"
        },{
            status:401
        })
    }
    try {
        const updatedResult = await UserModel.updateOne(
            {_id:user._id},//get the user with the user id (coming from session)
            {$pull:{messages:{_id:messageId}}}//compare message id and pull it out/ delete
            //note that each element in messages array is a document and so by default mongodb will have a unique id for each element which needs to be maqtched with the message id that needs to be deleted
        )
        if(updatedResult.modifiedCount === 0){//check if == or ===, cuz hitesh did ==
            return Response.json({
                success:false,
                message:"Message not found or already deleted"
            },{
                status:404
            })
        }
        return Response.json({
            success:true,
            message:"Message deleted successfully"
        },{
            status:200
        })
    } catch (error) {
        console.log("Error in delete-message api route",error)
        return Response.json({
            success:false,
            message:"Error deleting message"
        },{
            status:500
        })
    }
}