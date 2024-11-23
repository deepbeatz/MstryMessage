import 'next-auth'
import { DefaultSession } from 'next-auth';

//not "interface" cuz its a module/package here 
declare module 'next-auth'{
    interface User{
        _id?:string;
        isVerified?:boolean;
        isAcceptingMessages?:boolean;
        username?:string;
    }
    interface Session{
        user:{
            _id?:string;
            isVerified?:boolean;
            isAcceptingMessages?:boolean;
            username?:string;
        } & DefaultSession['user']
        //default session has to have atleast a key and that is the user which may or may not have these values above
    }
}

declare module 'next-auth/jwt'{
    interface JWT{
        _id?:string;
        isVerified?:boolean;
        isAcceptingMessages?:boolean;
        username?:string;
    }
}