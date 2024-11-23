import dbConnect from "@/lib/dbConnect";
import { Message } from "@/model/User";
import UserModel from "@/model/User";

export async function POST(request:Request){
    await dbConnect()
    //note that message can be sent by anyone who has the link, the person doesnt have to be a user of this website, doesnt have to be logged in
    
}