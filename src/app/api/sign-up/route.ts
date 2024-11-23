import dbConnect from "@/lib/dbConnect";//necessary in every api route file cuz nextjs is edge time framework
import UserModel from "@/model/User";
import bcrypt from "bcryptjs"; //for password encryption, decryption
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

//making post api in nextjs
export async function POST(request: Request){
    await dbConnect();
    try{
        const {username, email, password} = await request.json();
        //now checking if username already exists and is verified
        //in that case that username is already taken and we cant signup using that username
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified:true
        })
        if(existingUserVerifiedByUsername){
            return Response.json({
                success:false,
                message:"Username is already taken"
            },{
                status:400
            })
        }
        //now checking if email already exixts in db or not
        const existingUserByEmail = await UserModel.findOne({email});
        const verifyCode = Math.floor(100000+Math.random()*900000).toString();
        if(existingUserByEmail){
            //email already exists in db
            if(existingUserByEmail.isVerified){
                //email already exists (and is verified)
                return Response.json({
                    success:false,
                    message:"User already exists with this email"
                },{
                    status:400
                })
            }else{
                //email already exists (but is not verified)
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now()+3600000); //1hr added
                await existingUserByEmail.save();
            }
        }else{
            //no existence of user by that particular email, so we need to create one
            const hashedPassword = await bcrypt.hash(password, 10); //given password is hashed
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours()+1); //verification code expiry time given as 1 hour
            const newUser = new UserModel({ //creating the new user
                username,
                email,
                password:hashedPassword,
                verifyCode,
                verifyCodeExpiry:expiryDate,
                isAcceptingMessage:true,
                isVerified:false,
                messages:[]
            })
            await newUser.save(); //saving the new user
        }
        //send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode)
        if(!emailResponse.success){
            return Response.json({
                success:false,
                message:emailResponse.message
            },{
                status:500
            })
        }
        return Response.json({
            success:true,
            message:"Verify email to complete user registration"
        },{
            status:201
        })
    }catch(error){
        console.log("Error registering user",error);
        return Response.json({
            success:false,
            message:"Error registering user"
        },{
            status:500
        })
    }
}
