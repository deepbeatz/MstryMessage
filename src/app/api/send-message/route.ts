import dbConnect from "@/lib/dbConnect";
import { Message } from "@/model/User";
import UserModel from "@/model/User";

export async function POST(request:Request){
    await dbConnect()
    //note that message can be sent by anyone who has the link, the person doesnt have to be a user of this website, doesnt have to be logged in
    //process: 1st get current logged in user, then check if accepting messages or not, then craft the message and push into that user's message stack
    const {username, content} = await request.json()
    try {
        const user = await UserModel.findOne({username})
        if(!user){
            return Response.json({
                success:false,
                message:"User not found"
            },{
                status:404
            })
        }
        if(!user.isAcceptingMessages){
            return Response.json({
                success:false,
                message:"User is not accepting messages"
            },{
                status:403
            })
        }
        const newMessage = {content,createdAt:new Date()}
        user.messages.push(newMessage as Message)
        await user.save()
        return Response.json({
            success:true,
            message:"Message sent successfully"
        },{
            status:200
        })
    } catch (error) {
        console.log("Error adding message",error)
        return Response.json({
            success:false,
            message:"Internal server error"
        },{
            status:500
        })
    }
}