import { useAppState } from '@/lib/providers/state-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo } from 'react'
import { AccordionItem, AccordionTrigger } from '../ui/accordion';
import clsx from 'clsx';
import EmojiPicker from '../global/emoji-picker';
import { updateFolder } from '@/lib/supabase/queries';
import { useToast } from '../ui/use-toast';

interface DropdownProps{
    title:string;
    id:string;
    listType:'folder' | 'file';
    iconId:string;
    children?:React.ReactNode;
    disabled?:boolean;
    customIcon?:React.ReactNode;
}
const Dropdown:React.FC<DropdownProps> = ({title,id,listType,iconId,children,disabled,customIcon,...props}) => {
    const {toast} = useToast();
    const supabase = createClientComponentClient();
    const {state,dispatch,workspaceId,folderId} = useAppState();
    const [isEditing,setIsEditing] = React.useState(false);
    const router = useRouter();
    //folder title that synced with server data and local data
    //filetitle
    //navigate the user to a different page
    const navigatePage = (accordionId:string,type:'folder' | 'file') => {
        if(type==="folder"){
            router.push(`/dashboard/${workspaceId}/${accordionId}`)
        }
        if(type==="file"){
            router.push(`/dashboard/${workspaceId}/${folderId}/${accordionId}`)
        }
    }
    //add a file

    //double click handler
    //blur

    //onchanges
    const onChangeEmoji = async (selectedEmoji:string) =>{
        if(!workspaceId) return;
        if(listType==="folder"){

            dispatch({
                type:"UPDATE_FOLDER",
                payload:{
                    workspaceId ,
                    folderId:id,
                    folder:{iconId:selectedEmoji}
                }
            })
            const {data,error} = await updateFolder({iconId:selectedEmoji},id);
            if(error){
                toast({
                    title:"Error",
                    variant:"destructive",
                })
            }
        }
    }
    //move to trash

    //css
    const isFolder = listType === 'folder';
    const listStyles = useMemo(()=>clsx('relative',{
        'border-none text-md':isFolder,
        'border-none ml-6 text-[16px] py-1':!!isFolder
    }),[isFolder])

    const groupIdentifies = clsx('dark:text-white whitespace-nowrap flex justify-between items-center w-full relative',{
        'group/folder':isFolder,
        "group/file":!isFolder
    })

  return (
    <AccordionItem value={id} className={listStyles} onClick={(e)=>{
        //stop propagation
        e.stopPropagation();
        navigatePage(id,listType);
    }}>
        <AccordionTrigger id={listType} className='hover:no-underline p-2 dark:text-muted-foreground text-sm' disabled={listType=="file"}>
            <div className={groupIdentifies}>
                <div className='flex gap-4 items-center justify-center overflow-hidden'>
                    <div className='relative'>
                        <EmojiPicker getValue={onChangeEmoji}>
                            {iconId}
                        </EmojiPicker>
                    </div>
                </div>
            </div>
        </AccordionTrigger>
    </AccordionItem>
  )
}

export default Dropdown