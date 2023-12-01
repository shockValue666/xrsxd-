"use client";
import React from 'react'
import {AuthUser} from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface DashboardSetupProps{
    user:AuthUser;
    subscription:{} | null;
}


const DashboardSetup:React.FC<DashboardSetupProps> = () => {
  return (
    <Card className='w-[800px] h-screen sm:h-auto'>
      <CardHeader>
        <CardTitle>
          Create a workspace
        </CardTitle>
        <CardDescription>
          Lets create a private workspace to get you started.You can add
            collaborators later from the workspace settings tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={()=>{console.log("")}} action="">
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-4'>
              <div className='text-5xl'></div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default DashboardSetup