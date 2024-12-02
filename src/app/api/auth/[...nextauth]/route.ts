//we will use next-auth for sign-in (maximum work will be in options.ts)

import NextAuth from "next-auth";
import { authOptions } from "./options";

//we need to make a handler method here which needs to export as get and post apis for signin
const handler = NextAuth(authOptions);
export {handler as GET, handler as POST}