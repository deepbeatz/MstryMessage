//providers, pages, callbacks(mainly session and jwt)

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
    providers:[
        CredentialsProvider({
            id:"credentials",
            name:"Credentials",
            credentials:{
                email:{label:"Email",type:"text"},
                password:{label:"Password",type:"password"}
            },
            async authorize(credentials:any):Promise<any>{
                await dbConnect();
                try {
                    //finding user with email "or" username for signin
                    const user = await UserModel.findOne({
                        $or:[
                            {email:credentials.identifier},
                            {username:credentials.identifier}
                        ]
                    })
                    //if user not found
                    if(!user){
                        throw new Error("No user found with this email/username");
                    }
                    //user found but not verified
                    if(!user?.isVerified){
                        throw new Error("Please verify your account before login");
                    }
                    //user found and is verified
                    //so now checking if password given is correct or not
                    const isPasswordCorrect = await bcrypt.compare(credentials.password,user.password)
                    if(isPasswordCorrect){
                        return user
                    }else{
                        throw new Error("Incorrect password");
                    }
                } catch (err:any) {
                    throw new Error(err);
                }
            }
        })
    ],
    pages:{
        signIn:'/sign-in',
    },
    session:{
        strategy:"jwt"
    },
    secret:process.env.NEXTAUTH_SECRET,
    callbacks:{//modifying these 2 strategies
        async jwt({token, user}){
            //making token (also session) hold all the info we need to avoid repetitive database queries
            //one con here is that payload size inc but we dont need to worry about that
            if(user){
                token._id=user._id?.toString(); //to get user._id we need to define its type otherwise we cant access it (done in next-auth.d.ts file)
                token.isVerified=user.isVerified;
                token.isAcceptingMessages=user.isAcceptingMessages;
                token.username=user.username;
            }
            return token
        },//always return token here
        async session({session, token}){
            if(token){
                session.user._id=token._id;
                session.user.isVerified=token.isVerified;
                session.user.isAcceptingMessages=token.isAcceptingMessages;
                session.user.username=token.username;
            }
            return session
        },//always return session here
    }
}