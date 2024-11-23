import dbConnect from "@/lib/dbConnect";
import { Message } from "@/model/User";
import UserModel from "@/model/User";

export async function POST(request:Request){
    await dbConnect()
    
}