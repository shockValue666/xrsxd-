"use client";
import React ,{useEffect}from 'react'
import {AuthUser} from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

interface DashboardSetupProps{
    user:AuthUser;
    subscription:{} | null;
    // cook: () => ReadonlyRequestCookies;
}


const DashboardSetup:React.FC<DashboardSetupProps> = () => {

  const dosth = async () =>{
    
  }

  useEffect(()=>{console.log("logged")},[])
  return (
    <Card className='lg:w-[800px] h-screen sm:h-auto w-[100%]'>
      <CardHeader>
        <CardTitle>
          Create a workspace, i will have a tinder/tiktok like algorithm that will show trending videos and they will choose one and follow it etc
          or render from their youtube account with google authentication
        </CardTitle>
        <CardDescription>
          Lets create a private workspace to get you started.You can add
            collaborators later from the workspace settings tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={async ()=>{console.log("");await dosth();}} action="">
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-4'>
              <div className='text-5xl'>
                tsoloz
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default DashboardSetup