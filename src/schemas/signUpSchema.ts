import {z} from "zod";

export const UsernameValidation = z
    .string()
    .min(2, {message: "Username must be of atleast 2 characters"})
    .max(20, {message: "Username must be no more than 20 characters"})
    .regex(/^[a-zA-Z0-9_]+$/, {message: "Username must not contain special characters"})

export const signUpSchema = z.object({
    username: UsernameValidation,
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(6,{message: "password must be of atleast 6 characters"})
})