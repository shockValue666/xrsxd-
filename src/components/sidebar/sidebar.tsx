import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import React from 'react'
import {cookies} from 'next/headers'
import { getFolders, getUserSubscriptionStatus } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';

interface SidebarPros{
    params:{workspaceId:string};
    className?:string
}

const Sidebar:React.FC<SidebarPros> = async ({params,className}) => {
    const supabase = createServerComponentClient({cookies})

    //check if there is a user
    const {data:{user}} = await supabase.auth.getUser()
    if(!user) return;
    //subscription status
    const {data:subscriptionData,error:subscriptionError} = await getUserSubscriptionStatus(user.id);
    //access to the folders
    const {data:folderData,error:folderError} = await getFolders(params.workspaceId);
    //error
    if(subscriptionError || folderError) redirect(`/dashboard`);

    //get all the different wokrspaces
  return (
    <div>Sidebar</div>
  )
}

export default Sidebar