import { useAppState } from '@/lib/providers/state-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo } from 'react'
import { AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import clsx from 'clsx';
import EmojiPicker from '../global/emoji-picker';
import { createFile, updateFile, updateFolder } from '@/lib/supabase/queries';
import { useToast } from '../ui/use-toast';
import TooltipComponent from '../global/tooltip-component';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { File } from '@/lib/supabase/supabase.types';
import { v4 } from 'uuid';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';

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
    const {user} = useSupabaseUser();
    const supabase = createClientComponentClient();
    const {state,dispatch,workspaceId,folderId} = useAppState();
    const [isEditing,setIsEditing] = React.useState(false);
    const router = useRouter();
    //folder title that synced with server data and local data
    const folderTitle:string | undefined = useMemo(()=>{
        if(listType==="folder"){
            const stateTitle = state.workspaces
                .find(workspace=>workspace.id===workspaceId)
                ?.folders.find(folder=>folder.id===id)
                ?.title
            if(title === stateTitle || !stateTitle){
                return title;
            }
            return stateTitle;
        }
    },[state,listType,id,title,workspaceId])
    //filetitle
    const fileTitle: string | undefined = useMemo(() => {
        if (listType === 'file') {
          const fileAndFolderId = id.split('folder');
          const stateTitle = state.workspaces
            .find((workspace) => workspace.id === workspaceId)
            ?.folders.find((folder) => folder.id === fileAndFolderId[0])
            ?.files.find((file) => file.id === fileAndFolderId[1])?.title;
          if (title === stateTitle || !stateTitle) return title;
          return stateTitle;
        }
      }, [state, listType, workspaceId, id, title]);
    
    //navigate the user to a different page
    const navigatePage = (accordionId:string,type:'folder' | 'file') => {
        if(type==="folder"){
            router.push(`/dashboard/${workspaceId}/${accordionId}`)
        }
        if(type==="file"){
            router.push(`/dashboard/${workspaceId}/${folderId}/${accordionId.split('folder')[1]}`)
        }
    }
    //add a file
    const addNewFile = async () => {
        if(!workspaceId) return;
        const newFile:File = {
            folderId:id,
            data:null,
            createdAt:new Date().toISOString(),
            inTrash:null,
            title:'Untitled',
            iconId:'📄',
            id:v4(),
            workspaceId,
            bannerUrl:''
        }
        dispatch({
            type:'ADD_FILE',
            payload:{
                workspaceId,
                folderId :id,
                file:newFile
            }
        })
        const {data,error} = await createFile(newFile);
        console.log("data from creating a file: ",data,"error from creating a file: ",error)
        if(error){
            toast({
                title:"Error creating file",
                description:"There was an error creating the file",
                variant:"destructive"
            })
        }else{
            toast({
                title:"Successfully created a file",
                description:"the file was crated successfully",
            })
        }

    }

    //double click handler
    const handleDoubleClick = () => {
        setIsEditing(true);
    }
    //blur
    const handleBlur = async() => {
        if(!isEditing) return;
        setIsEditing(false);
        const fId = id.split('folder');
        console.log("fid: ",fId)
        if(fId?.length === 1){
            if(!folderTitle) return;
            await updateFolder({title},fId[0]);
            toast({
                title:"suxes",
                description:"successfully updated the folder title"
            })
        }
        if(fId?.length === 2 && fId[1]){
            if(!fileTitle) return;
            //WIP update file
            const {data,error} = await updateFile({title:fileTitle},fId[1]);
            if(error){
                toast({
                    title:"Error",
                    description:"There was an error updating the file title: "+ error,
                    variant:"destructive"
                })
                return;
            }else{
                toast({
                    title:"suxes",
                    description:"successfully updated the file title"
                })
            }
        }
    }

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
                    description:"There was an error updating the folder icon"
                })
            }else{
                toast({
                    title:"suxes",
                    description:"successfully updated the folder icon"
                })
            }
        }
    }

    //folder title change
    const folderTitleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        if(!workspaceId) return;
        const fId=id.split('folder');
        if(fId.length===1){
            dispatch({
                type:"UPDATE_FOLDER",
                payload:{
                    workspaceId,
                    folderId:fId[0],
                    folder:{title:e.target.value}
                }
            })
        }
    }
    //file title change
    const fileTitleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        if(!workspaceId || !folderId) return;
        console.log("fileTitleChange: ",e.target.value)
        const fId=id.split('folder');
        if(fId.length===2 && fId[1]){
            //WIP update file
            dispatch({
                type:"UPDATE_FILE",
                payload:{
                    workspaceId,
                    folderId:fId[0],
                    fileId:fId[1],
                    file:{title:e.target.value}
                }
            })
        }
    }
    //move to trash
    const moveToTrash = async () => {
        if(!user?.email || !workspaceId) return;
        const pathId = id.split("folder")
        if(listType=="folder"){
            dispatch({
                type:"UPDATE_FOLDER",
                payload:{
                    folder:{
                        inTrash:`Deleted by ${user?.email} `
                    },
                    folderId:pathId[0],
                    workspaceId
                }
            })
            const {data,error} = await updateFolder({inTrash:`Deleted by ${user?.email}`},pathId[0])
            if(error){
                toast({
                    title:"Error",
                    description:"There was an error moving the folder to the trash",
                    variant:"destructive"
                })
            }else{
                toast({
                    title:"suxes",
                    description:"successfully moved the folder to the trash"
                })
            }
        }
        if(listType=="file"){
            dispatch({
                type:"UPDATE_FILE",
                payload:{
                    file:{
                        inTrash:`Deleted by ${user?.email} `
                    },
                    fileId:pathId[1],
                    workspaceId,
                    folderId:pathId[0]
                }
            })
            const {data,error} = await updateFile({inTrash:`Deleted by ${user?.email}`},pathId[1])
            if(error){
                toast({
                    title:"Error",
                    description:"There was an error moving the file to the trash",
                    variant:"destructive"
                })
            }else{
                toast({
                    title:"suxes",
                    description:"successfully moved the file to the trash"
                })
            }
        }
    }

    //css
    const isFolder = listType === 'folder';
    const listStyles = useMemo(()=>clsx('relative',{
        'border-none text-md':isFolder,
        'border-none ml-6 text-[16px] py-1':!isFolder
    }),[isFolder])

    const groupIdentifies = clsx('dark:text-white whitespace-nowrap flex justify-between items-center w-full relative',{
        'group/folder':isFolder,
        "group/file":!isFolder
    })
    const hoverStyles = useMemo(
        () =>
            clsx(
            'h-[full] hidden rounded-sm absolute right-0 top-0 items-center justify-center',
            {
                'group-hover/file:block': listType === 'file',
                'group-hover/folder:block': listType === 'folder',
            }
            ),
        [isFolder]
    );

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
                    <input type="text" value={listType==="folder" ? folderTitle : fileTitle} className={clsx(`outline-none overflow-hidden w-[140px] text-Neutrals/neutrals-7`,{
                        "bg-muted cursor-text":isEditing,
                        "bg-transparent cursor-pointer":!isEditing,
                    })} readOnly={!isEditing} onDoubleClick={handleDoubleClick} onBlur={handleBlur} onChange={listType==='folder' ? folderTitleChange : fileTitleChange}/>
                </div>
                <div className={hoverStyles}>
                        <TooltipComponent message='Delete File'>
                            <TrashIcon onClick={moveToTrash} size={15} className='hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors' />
                        </TooltipComponent>
                    {listType==="folder" && !isEditing && 
                        <TooltipComponent message='Add File'>
                            <PlusIcon onClick={addNewFile} size={15} className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors" />
                        </TooltipComponent>
                    } 
                </div>
            </div>
        </AccordionTrigger>
        <AccordionContent>
            {
                state.workspaces
                    .find((workspace)=> workspace.id===workspaceId)
                    ?.folders.find((folder)=>folder.id===id)
                    ?.files.filter((file)=>!file.inTrash)
                    .map((file)=> {
                        const customFileId=`${id}folder${file.id}`;
                        return (
                            <Dropdown
                                key={file.id}
                                title={file.title}
                                listType='file'
                                id={customFileId}
                                iconId={file.iconId}
                            />
                        )
                    })
            }
        </AccordionContent>
    </AccordionItem>
  )
}

export default Dropdown