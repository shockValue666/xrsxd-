import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import React from 'react'
import {cookies} from 'next/headers'
import { getCollaboratingWorkspaces, getFolders, getPrivateWorkspaces, getSharedWorkspaces, getUserSubscriptionStatus } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import WorkspaceDropdown from './workspace-dropdown';

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
    const [privateWorkspaces,collaboratingWorkspaces,sharedWorkspaces] = 
        await Promise.all([getPrivateWorkspaces(user.id),getCollaboratingWorkspaces(user.id),getSharedWorkspaces(user.id)])

    //get all the different wokrspaces
  return (
    <aside className={twMerge(
        'hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 !justify-between',
        className
    )}>
        <div>
            idk
            <WorkspaceDropdown defaultValue={[...privateWorkspaces,...collaboratingWorkspaces,...sharedWorkspaces].find(workspace=>workspace.id==params.workspaceId)} sharedWorkspaces={sharedWorkspaces} collaboratingWorkspaces={collaboratingWorkspaces} privateWorkspaces={privateWorkspaces}></WorkspaceDropdown>
        </div>
    </aside>
  )
}

export default Sidebar