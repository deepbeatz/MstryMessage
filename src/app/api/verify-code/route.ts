import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

//didnt use zod here, we could have if we wanted to...

export async function POST(request:Request){
    await dbConnect()
    try {
        const {username,code} = await request.json()
        const decodedUsername = decodeURIComponent(username)
        //generally when we get stuff from the request url instead of request body we decode it using this above function to get the un-encoded version of the encoded component of the uri
        //here the username that comes from the frontend api call was extraxted from the params so its good to use this function here

        //now, getting the user first for it to get verified
        const user = await UserModel.findOne({username:decodedUsername})
        if(!user){
            return Response.json({
                success:false,
                message:"User not found"
            },{
                status:400
            })
        }
        //then check if code valid and not expired
        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry)>new Date()
        if(isCodeNotExpired && isCodeValid){
            //as code is valid and not expired, user can successfully get verified, for successfull signup
            user.isVerified=true
            await user.save()
            return Response.json({
                success:true,
                message:"Account verified successfully"
            },{
                status:200
            })
        }else if(!isCodeNotExpired){
            return Response.json({
                success:false,
                message:"Verification code has expired, please signup again to get a new code"
            },{
                status:400
            })
        }else{
            return Response.json({
                success:false,
                message:"Incorrect verification code, please try again"
            },{
                status:400
            })
        }
    } catch (error:any) {
        console.error("Error verifying user",error.message)
        return Response.json({
            success:false,
            message:"Error verifying user"
        },{
            status:500
        })
    }
}