"use server";
import { z } from "zod";
import { FormSchema } from "../types";
import {createRouteHandlerClient} from '@supabase/auth-helpers-nextjs'
import { cookies } from "next/headers";


export async function actionLoginUser({email,password}:z.infer<typeof FormSchema>){

    // console.log("cookies: ",{cookies})
    //the auth createRouteHandlerClient: the supabase auth-helpers-js configures
    //supbase auth to store the user's session
    //in a cookie, rather than localStorage,
    //this makes it available across the client and the server of App Router,
    //client components, server components, server actions, route handlers,
    // to supabase
    const supabase = createRouteHandlerClient({cookies})
    
    //response returns AuthTokenResponse, it's a JSON object that contains
    //an access token, token type, expiration time, and refresh token. It is 
    //returned by supabase when a user successfully logs in or signs up. The 
    //access token is a JSON web token (JWT) that authorizes a client
    const response = await supabase.auth.signInWithPassword({
        email,
        password
    })

    // console.log("response: ", response)
    return response;

}

export async function actionSignUpUser({email,password}:z.infer<typeof FormSchema>){
    const supabase = createRouteHandlerClient({cookies})
    const {data} = await supabase.from("profiles").select("*").eq("email",email);
    // console.log("actionSignUpUser DDDAAATTTAAA: ",data)
    if(data?.length){
        return {
            error: {
                message: "User already exists",
                data
            }
        }
    }
    const response = await supabase.auth.signUp({
        email,
        password,
        options:{
            emailRedirectTo:`${process.env.NEXT_PUBLIC_SITE_URL}api/auth/callback`
        }
    })
    return response;
}


// response:  {
//     data: {
//       user: {
//         id: '00506bc4-3161-asdf-9ce9-asdf',
//         aud: 'authenticated',
//         role: 'authenticated',
//         email: 'fasd@sdf.com',
//         email_confirmed_at: '2023-11-30T01:02:07.011362Z',
//         phone: '',
//         confirmation_sent_at: '2023-11-30T00:59:52.924409Z',
//         confirmed_at: '2023-11-30T01:02:07.011362Z',
//         last_sign_in_at: '2024-01-13T02:27:44.750454399Z',
//         app_metadata: [Object],
//         user_metadata: {},
//         identities: [Array],
//         created_at: '2023-11-30T00:56:32.63Z',
//         updated_at: '2024-01-13T02:27:44.756936Z'
//       },
//       session: {
//         access_token: 'eyJhbGciOiJIUzI1kdfjkljadsflkjasdflkjadslfkjadsfaYiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzA1MTE2NDY0LCJpYXQiOjE3MDUxMTI4NjQsImlzcyI6Imh0dHBzOi8veHVrcHh5Z2VxZW9la2JiZGtwcXQuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6IjAwNTA2YmM0LTMxNjEtNDlhMC05Y2U5LTFiNmI1MzRlNDkxMyIsImVtYWlsIjoibWFwZWRldmVsb3BlckBwcm90b25tYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnt9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzA1MTEyODY0fV0sInNlc3Npb25faWQiOiJiMGE3lakfjlaskdjflkajsedlkfamNzRhMy1mNDM1LTQzMGItYWFiMC05OTVhYjllN2FiMGUifQ.Cg4ied3SWPqPMcl6pkj-TDiIAtLsxLBofogOIK-RMuw',
//         token_type: 'bearer',
//         expires_in: 3600,
//         expires_at: 1705116464,
//         refresh_token: 'OsVHmcnttJ-EeBU0L5Cl7w',
//         user: [Object]
//       }
//     },
//     error: null
//   }