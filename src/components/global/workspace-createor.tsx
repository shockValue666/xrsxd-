"use client";
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { User, workspace } from '@/lib/supabase/supabase.types';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { SelectGroup } from '@radix-ui/react-select';
import { Lock, Share } from 'lucide-react';
import { Button } from '../ui/button';
import { v4 } from 'uuid';
import { addCollaborators, createWorkspace } from '@/lib/supabase/queries';
import { useAppState } from '@/lib/providers/state-provider';
import { ToastAction } from '../ui/toast';
import { useToast } from '../ui/use-toast';
import CollaboratorSearch from './collaborator-search';
  

const WorkspaceCreator = () => {
    const {dispatch} = useAppState();
    const {toast} = useToast();
    const [permissions,setPermissions] = useState("private");
    const [title, setTitle] = useState("");
    const [collaborators,setCollaborators] = useState<User[]>([]);
    const {user} = useSupabaseUser();
    const router = useRouter();

    const addCollaborator = (user:User) => {
        setCollaborators([...collaborators,user]);
    }

    const removeCollaborator = (user:User) => {
        setCollaborators(collaborators.filter(c=>c.id!==user.id))
    }
    const createItem = async () => {
        const uuid = v4();
        if(user?.id){
            const newWorkspace:workspace = {
                data:null,
                createdAt:new Date().toISOString(),
                iconId:"🤑",
                id:uuid,
                inTrash:"",
                title,
                workspaceOwner:user.id,
                logo:null,
                bannerUrl:""
            }
            if(permissions === "private"){
                const {data,error} = await createWorkspace(newWorkspace);
                if(error) console.log("error at creating the workspace: ",error)
                dispatch({
                    type:"ADD_WORKSPACE",
                    payload:{... newWorkspace,folders: [] }
                })
                toast({
                    title: 'Workspace Created',
                    description: `${newWorkspace.title} has been created successfully.`,
                    action:(
                        <ToastAction altText="Workspace created suxesfully">SUXES</ToastAction>
                    )
                })
                router.replace(`/dashboard/${newWorkspace.id}`)
            }

            if(permissions === "shared"){
                await createWorkspace(newWorkspace);
                await addCollaborators(collaborators,uuid);
                router.refresh;
            }
        }
    }

  return (
    <div className='flex gap-4 flex-col'>
        <div>
            <Label htmlFor='name' className='text-sm text-muted-foreground'>Name workspace creator</Label>
            <div className='flex justify-center items-center gap-2'>
                <Input name='name' value={title} placeholder='Workspace Name' onChange={(e)=>{setTitle(e.target.value)}} />
            </div>
        </div>
        <>
            <Label htmlFor='permissions' className='text-sm text-muted-foreground'>Permissions</Label>
            <Select onValueChange={(val)=>{setPermissions(val)}} defaultValue={permissions}>
                <SelectTrigger className='w-full h-26 -mt-3'>
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value='private'>
                            <div className='p-2 flex gap-4 justify-center items-center'>
                                <Lock/>
                                <article className='text-left flex flex-col'>
                                    <span> Private </span>
                                    <p>Your workspace is private to you exclusively</p>
                                </article>
                            </div>
                        </SelectItem>
                        <SelectItem value='shared'>
                            <div className='p-2 flex gap-4 justify-center items-center'>
                                <Share/>
                                <article className='text-left flex flex-col'>
                                    <span> Shared </span>
                                    <p>Your workspace is Shared to you and your friends</p>
                                </article>
                            </div>
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </>
        {permissions==="shared" && <div><CollaboratorSearch/></div>}
        <Button type={"button"} disabled={!title || (permissions==="shared" && collaborators.length===0)}
            variant={"secondary"}
            onClick={createItem}
        >Create</Button>
    </div>
  )
}

export default WorkspaceCreator

