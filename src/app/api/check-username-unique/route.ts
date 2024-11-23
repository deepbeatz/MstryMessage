import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request){
    await dbConnect()
    try {
        //get the given username from link
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }//has to be an object (given in zod docs too)
        //validate username with zod
        const result = UsernameQuerySchema.safeParse(queryParam)//parsing will be safe if schema was followed
        console.log("UsernameQuerySchema.safeParse(queryParam)=",result)//TODO: remove
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || [] //collecting only username errors from the error array
            return Response.json({
                success:false,
                message: usernameErrors?.length>0
                            ? usernameErrors.join(', ')
                            :'Invalid query parameters'
            },{
                status:400
            })
        }
        //validation done, now checking if username available or not
        //note that already stored uernames in db which aren't verified will be available and given to the person wanting it to sign-up
        const {username} = result.data
        const existingVerifiedUser = await UserModel.findOne({username,isVerified:true})
        if(existingVerifiedUser){
            return Response.json({
                success:false,
                message:"Username is already in use"
            },{
                status:400
            })
        }
        return Response.json({
            success:true,
            message:"Username is available"
        },{
            status:200
        })
    } catch (error:any) {
        console.error("Error checking username",error.message)
        return Response.json({
            success:false,
            message:"Error checking username"
        },{
            status:500
        })
    }
}