import {z} from "zod";

export const signInSchema = z.object({
    identifier: z.string(),
    //email or username basically, but generally called as "identifier" in this case
    password: z.string(),
})