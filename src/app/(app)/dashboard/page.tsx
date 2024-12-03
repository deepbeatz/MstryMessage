'use client'

import MessageCard from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Message } from "@/model/User"
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Loader2, RefreshCcw } from "lucide-react"
import { User } from "next-auth"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"


//in dashboard we have a switch component for accept messages toggle
//its a form element as well; so earlier as we have used react hook form for form elements; here also we will use react hook form and not states; this is for consistency
//so as we are using react hook form for just a switch and thats just one element so we will need to destructure the form while defining the form schema (read docs) - we need 3 things: watch, setValue, register
//watch - This method will watch specified inputs and return their values. It is useful to render input value and for determining what to render by condition.
//setValue - This function allows you to dynamically set the value of a registered field and have the options to validate and update the form state. At the same time, it tries to avoid unnecessary re-render.
//register - form field technically but used when destructuring is done

const page = () => {
  const [messages,setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)//for messages loading on screen
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)

  const {toast} = useToast()

  //we will create a delete message function here now for optimistic ui (it will remove the message from the screen 1st and then afterwards do the backend process such that for the user its instant)
  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message)=>message._id!==messageId))//if id aint equal include them, if equal filter it out
  }

  //get current session
  const {data: session} = useSession()

  //form schema validation using zod
  const form  = useForm({
    resolver: zodResolver(acceptMessageSchema)
  })
  //destructuring of form
  const {register, watch, setValue} = form
  //watch event
  const acceptMessages = watch('acceptMessages')//'acceptMessages' - field name in form in ui

  //api calls will be in useCallback instead of useEffect hook for more optimisation
  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading (true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages')
      setValue('acceptMessages', response.data.isAcceptingMessages)//get isAcceptingMessages status from ApiResponse and update in frontend using state
    } catch(error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to fetch message settings",
        variant: "destructive"
      })
    } finally {
      setIsSwitchLoading(false)
    }
  },[setValue])
  const fetchMessages = useCallback(async (refresh: boolean = false) => { //refresh value is for the refresh messages icon button
    setIsSwitchLoading (false)
    setIsLoading (true)
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages')
      setMessages(response.data.messages || [])
      if(refresh){
        toast({
          title: "Refreshed messages",
          description: "Showing latest messages",
        })
      }
    } catch(error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to fetch message settings",
        variant: "destructive"
      })
    } finally {
      setIsSwitchLoading(false)
      setIsLoading (false)
    }
  },[setIsLoading, setMessages])
  //lastly a useeffect hook to run both the api call functions depending on if the values in dependency array change
  useEffect (() => {
    if (!session || !session.user) return
    fetchMessages ()
    fetchAcceptMessage()
  }, [session, setValue, fetchAcceptMessage, fetchMessages])

  //handle switch change
  const handleSwitchChange = async() => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages
      })//for the backend
      setValue('acceptMessages', !acceptMessages)//for the ui
      toast({
        title: response.data.message,
      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to switch Accept Messages toggle button",
        variant: "destructive"
      })
    }
  }
  //public url & copy to clipboard
  const {username} = session?.user as User
  const baseUrl = `${window.location.protocol}//${window.location.host}`//TODO: do more research
  const profileUrl = `${baseUrl}/u/${username}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast({
      title:"URL copied",
      description:"Profile URL has been copied to clipboard"
    })
  }

  if (!session || !session.user) {
    return <div>Please login</div>
  }
  return (
    <>
      <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
          <div className="flex items-center">
            <input
              type="text"
              value={profileUrl}
              disabled
              className="input input-bordered w-full p-2 mr-2"
            />
            <Button onClick={copyToClipboard}>Copy</Button>
          </div>
        </div>
        <div className="mb-4">
          <Switch
            {...register('acceptMessages')}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
          />
          <span className="ml-2">
            Accept Messages: {acceptMessages ? 'On' : 'Off'}
          </span>
        </div>
        <Separator />
        <Button
          className="mt-4"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
        >
          {isLoading? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          ) }
        </Button>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.length > 0? (
            messages.map((message, index) => (
              <MessageCard
                key={message._id}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <p>No messages to display.</p>
          )}
        </div>
      </div>
    </>
  )
}

export default page
