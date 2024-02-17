"use client";
import { useAppState } from '@/lib/providers/state-provider';
import { Folder } from '@/lib/supabase/supabase.types';
import React, { useEffect, useState } from 'react'
import TooltipComponent from '../global/tooltip-component';
import { PlusIcon } from 'lucide-react';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { v4 } from 'uuid';
import { createFolder } from '@/lib/supabase/queries';
import { useToast } from '../ui/use-toast';
import { Accordion } from '../ui/accordion';
import Dropdown from './Dropdown';

interface FoldersDropdownListProps{
    workspaceFolders:Folder[] | null;
    workspaceId:string;
}

const FoldersDropdownList:React.FC<FoldersDropdownListProps> = ({workspaceFolders,workspaceId}) => {
    //WIP local state folders 
    //WIP setup real time updates (when another user creates a folder we want to see it)
    const {state,dispatch, folderId} = useAppState(); 
    const [folders,setFolders] = React.useState<Folder[]>(workspaceFolders || []);
    const {subscription} = useSupabaseUser();
    const {toast} = useToast();

    //effect set initial state server app state
    useEffect(()=>{
        if(workspaceFolders && workspaceFolders?.length>0){
            dispatch({type:'SET_FOLDERS',payload:{workspaceId,folders:workspaceFolders.map(folder=>({...folder,files:state.workspaces.find(workspace=>workspace.id===workspaceId)?.folders.find(f=>f.id===folder.id)?.files || []}))}})
        }   
    },[workspaceFolders,workspaceId])

    //state
    useEffect(()=>{
        setFolders(state.workspaces.find((workspace)=>workspace.id===workspaceId)?.folders || [])
    },[state,workspaceId])

    //add folder 
    const addFolderHandler = async () => {
        //subscription modal
        // if(folders.length>=3 && !subscription){

        // }
        const newFolder:Folder = {
            data:null,
            id:v4(),
            createdAt:new Date().toISOString(),
            iconId:'📄',
            inTrash:null,
            title:"Untitled",
            workspaceId,
            bannerUrl:""
        }
        dispatch({type:'ADD_FOLDER',payload:{workspaceId,folder:{...newFolder,files:[]}}})
        const {data,error} = await createFolder(newFolder);
        if(error){
            toast({
                title:"Error creating folder",
                description:"There was an error creating the folder",
                variant:"destructive"
            })
        }else{
            toast({
                title:"Successfully created a folder",
                description:"the folder was crated successfully",
            })
        }
    }
  return (
    <>
    <div className='flex sticky z-20 top-0 bg-background w-full h-10 group/title justify-between items-center pr-4 text-Neutrals/neutrals-8'>
        <span className='text-Neutrals-8 font-bold text-xs'>
            Folders
        </span>
        <TooltipComponent message="Create a folder">
            <PlusIcon
            onClick={addFolderHandler}

             size={16} className='group-hover/title:inline-block hidden cursor-pointer'/>
        </TooltipComponent>
    </div>
    <Accordion type="multiple" defaultValue={[folderId || '']} className='pb-20'>
        {folders.filter(folder=>!folder.inTrash).map(folder=>(
                <Dropdown
                    key={folder.id}
                    title={folder.title}
                    listType="folder"
                    id={folder.id}
                    iconId={folder.iconId}
                />
        ))}
    </Accordion>
    </>
  )
}

export default FoldersDropdownList