'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useDebounceCallback } from 'usehooks-ts'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios, {AxiosError} from 'axios'
import { ApiResponse } from "@/types/ApiResponse"
import { Loader2 } from "lucide-react"

//username field will have debouncing technique cuz whenever username is being typed after every short interval it should check if its available or not, repititive api calls will choke the database and so bebouncing is necessary using a 3rd party library

const page = () => {
  const { toast } = useToast();
  const router = useRouter();
  //necessary states
  const [username,setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  //using usehooks-ts library for the debouncing
  //useDebounceValue : for the value, useDebounceCallback: for the function which sets the value - these are the two necessary hooks (we need only useDebounceCallback hook)
  const debounced = useDebounceCallback(setUsername,300);//after every 300ms
  //zod implementation and form schema
  const form = useForm<z.infer<typeof signUpSchema>>({ //<z.infer<typeof signUpSchema>> was an extra step done for typescript
    resolver: zodResolver(signUpSchema),
    defaultValues:{
      username:'',
      email:'',
      password:''
    }
  })
  useEffect(()=>{
    const checkUsernameUniqueness = async () => {
      if(username){
        setIsCheckingUsername(true);
        setUsernameMessage('');
        try{
          const response = await axios.get<ApiResponse>(`/api/check-username-unique?username=${username}`) //this api route takes username from url
          const message = response.data.message
          setUsernameMessage(message)//we get returned success and message from api
        }catch(error){
          const axiosError = error as AxiosError<ApiResponse>
          setUsernameMessage(axiosError.response?.data.message ?? "Error checking username")
        }finally{
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUniqueness()
  },[username])
  //form submission task: submitting data to signup api which is username, email, password
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => { //data coming from useForm hook's default values
    setIsSubmitting(true)
    console.log("data (in onSubmit function in sign-up page.tsx): ",data) //TODO: remove
    try {
      const response = await axios.post<ApiResponse>('/api/sign-up',data)
      toast({
        title:"Success",
        description:response.data.message
      })
      //as soon as data successfully provided to sign-up api, we need to redirect that particular user to verify tab
      router.replace(`/verify/${username}`)
    } catch (error) {
      console.error("Error in signup process ",error)
      const axiosError = error as AxiosError<ApiResponse>
      const errorMessage = axiosError.response?.data.message
      toast({
        title:"Error",
        description:errorMessage,
        variant:"destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystery Message
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="username"
                      {...field}
                      // onChange function to repititively set the repititively changing value given by user in username field into setUsername and also provide this value to "field"
                      onChange={(e)=>{
                        field.onChange(e)
                        debounced(e.target.value)
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  <p className={`text-sm ${usernameMessage==="Username is available"?'text-green-500':'text-red-500'}`}>{usernameMessage}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email"
                      {...field}
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="password"
                      {...field}
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="m-0 p-0 flex items-center justify-center">
              <Button type="submit" disabled={isSubmitting}>
                {
                  isSubmitting?(
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Please wait
                    </>
                  ):"Signup"
                }
              </Button>
            </div>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            I Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default page