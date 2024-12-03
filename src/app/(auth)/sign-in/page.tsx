'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
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
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signInSchema } from "@/schemas/signInSchema"
import axios, {AxiosError} from 'axios'
import { ApiResponse } from "@/types/ApiResponse"
import { Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"

const page = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof signInSchema>>({ //<z.infer<typeof signInSchema>> was an extra step done for typescript
    resolver: zodResolver(signInSchema),
    defaultValues:{
      identifier:'',
      password:''
    }
  })
  //form submission task: submitting data to signin api ; signin api uses nextauth
  const onSubmit = async (data: z.infer<typeof signInSchema>) => { //data coming from useForm hook's default values
    console.log("data (in onSubmit function in sign-in page.tsx): ",data) //TODO: remove
    setIsSubmitting(true)
    const result = await signIn('credentials',{ //this function needs provider (credentials) and data '{}'
      redirect: false, //cuz we will do it manually
      indentifier: data.identifier,
      password: data.password
    })
    console.log("result:",result)
    if(result?.error){
      toast({
        title:"Login failed",
        description:result.error,
        variant:"destructive"
      })
      setIsSubmitting(false)
    }
    //after signin success we are redirected to dashboard
    if(result?.url){
      router.replace('/dashboard')
      setIsSubmitting(false)
    }
    setIsSubmitting(false)
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Mystery Message: An Anonymous Adventure
          </h1>
          <p className="mb-4">Sign in to your account</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username or Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Username/Email"
                      {...field}
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
                  ):"Signin"
                }
              </Button>
            </div>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            New to Mstry Message?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default page