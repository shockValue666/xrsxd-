"use client";
import { useAppState } from '@/lib/providers/state-provider';
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';
import React, { use, useCallback, useMemo, useState } from 'react'
import "quill/dist/quill.snow.css"
import { Button } from '../ui/button';
import { deleteFile, deleteFolder, updateFile, updateFolder, updateWorkspace } from '@/lib/supabase/queries';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import EmojiPicker from '../global/emoji-picker';

interface QuillEditorProps{
  dirType: "workspace" | "file" | "folder" ;
  fileId: string;
  dirDetails: workspace | File | Folder;
}

var TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  [{ direction: 'rtl' }], // text direction

  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ['clean'], // remove formatting button
];

const QuillEditor:React.FC<QuillEditorProps> = ({
  dirDetails,
  dirType,
  fileId
}) => {
  const supabase = createClientComponentClient();
  const {state,workspaceId,folderId,dispatch} = useAppState();
  const [quill,setQuill] = useState<any>(null);
  const pathname = usePathname();
  const [collaborators,setCollaborators] = useState<{id:string;email:string;avatarUrl:string}[]>([]);
  const [saving,setSaving] = useState(false);

  const details = useMemo(()=>{
    let selectedDir;
    if(dirType==="file"){
      selectedDir = state.workspaces.find(workspace => workspace.id === workspaceId)
        ?.folders.find(folder=>folder.id===folderId)
        ?.files.find(file=>file.id===fileId); 
    }
    if(dirType==="workspace"){
      selectedDir = state.workspaces.find(workspace=>workspace.id===fileId)
    }
    if(dirType==="folder"){
      selectedDir = state.workspaces.find(workspace=>workspace.id===workspaceId)
        ?.folders.find(folder=>folderId===fileId);
    }

    if(selectedDir){
      return selectedDir;
    }
    return {
      title:dirDetails.title,
      iconId:dirDetails.iconId,
      createdAt:dirDetails.createdAt,
      data:dirDetails.data,
      inTrash:dirDetails.inTrash,
      bannerUrl:dirDetails.bannerUrl,
    } as workspace | File | Folder;
  },[state,workspaceId,folderId])

  const wrapperRef = useCallback( async (wrapper:any)=>{
    if(typeof window !== undefined){
      if(wrapper === null) return;
      wrapper.innerHTML = "";
      const editor = document.createElement('div');
      wrapper.append(editor);
      const Quill = (await import('quill')).default;
      //WIP cursors
      const q = new Quill(editor,{
        theme:"snow",
        modules:{
          toolbar:TOOLBAR_OPTIONS,
          //WIP cursors
        }
      })
      setQuill(q);
    }
  },[])

  //breadCrumbs
  const breadCrumbs = useMemo(()=>{
    if(!pathname || !state.workspaces || !workspaceId) return;
    const segments = pathname.split("/").filter(val=>val!=="dashboard" && val);
    const workspaceDetails = state.workspaces.find(workspace=>workspace.id===workspaceId)
    console.log("workspace Det details: ",workspaceDetails)
    const workspaceBreadCrumb = workspaceDetails ? `${workspaceDetails.iconId} ${workspaceDetails.title}` : "";
    console.log("workspacedetails.iconid: ",workspaceDetails?.iconId)
    if(segments.length === 1) return workspaceBreadCrumb
    
    const folderSegment = segments[1];
    const folderDetails = workspaceDetails?.folders.find(folder=>folder.id===folderSegment);
    const folderBreadCrumb = folderDetails ? `/ ${folderDetails.iconId} ${folderDetails.title}` : "";
    if(segments.length === 2) return `${workspaceBreadCrumb} ${folderBreadCrumb}`;

    const fileSegment = segments[2];
    const fileDetails = folderDetails?.files.find(file=>file.id===fileSegment);
    const fileBreadCrumb = fileDetails ? `/ ${fileDetails.iconId} ${fileDetails.title}` : ""
    if(segments.length === 3) return `${workspaceBreadCrumb} ${folderBreadCrumb} ${fileBreadCrumb}`;
  },[state,pathname,workspaceId])

  //restore-delete handler
  const restoreFileHandler = async () => {
    if(dirType==="file" || !workspaceId) return;{
      if(!folderId) return;
      dispatch({type:"UPDATE_FILE",payload:{file: {inTrash:""},fileId,workspaceId,folderId}})
      await updateFile({inTrash:""},fileId)
    }
    if(dirType==="folder"){
      if(!workspaceId) return;
      dispatch({type:"UPDATE_FOLDER",payload:{folder:{inTrash:""},folderId:fileId,workspaceId}})
      // console.log("i will fuck the world")
      await updateFolder({inTrash:""},fileId)
    }
  }

  const deleteFileHandler = async () => {
    if(dirType==="file" || !workspaceId) return;{
        if(!folderId) return;
        dispatch({type:"DELETE_FILE",payload:{fileId,workspaceId,folderId}})
        await deleteFile(fileId);
      }
      if(dirType==="folder"){
        if(!workspaceId) return;
        dispatch({type:"DELETE_FOLDER",payload:{folderId:fileId,workspaceId}})
        await deleteFolder(fileId)
      } 
  }
  //onchange icon
  const iconOnChange = async (icon:string) => {

    console.log("onchange: ",icon)
    if(!fileId) return;
    if(dirType==="workspace"){
      dispatch({
        type:"UPDATE_WORKSPACE",
        payload:{
          workspace:{iconId:icon},
          workspaceId:fileId
        }
      })
      await updateWorkspace({iconId:icon},fileId)
    }
    if(dirType==="folder"){
      
    }
    if(dirType==="file"){
      
    }
  }
  return (
    <>
      <div className='relative'>
        {details.inTrash && (<article className='py-2 bg-[#EB5757] flex md:flex-row flex-col justify-center items-center gap-4 flex-wrap'>
          <div className='flex flex-col md:flex-row gap-2 justify-center items-center'>
            <span className='text-white'>
              This {dirType} is in trash
            </span>
            <Button size={"sm"} variant={"outline"} className='bg-transparent border-white text-white hovering:bg-white hover:text-[#EB5757]'
              onClick={restoreFileHandler}
            >
              Restore
            </Button >
            <Button size={"sm"} variant={"outline"} className='bg-transparent border-white text-white hovering:bg-white hover:text-[#EB5757]'
              onClick={deleteFileHandler}>
                Delete
            </Button>
          </div> 
          <span className='text-sm text-white'>{details.inTrash}</span>
        </article>)}
        <div className='flex flex-col-reverse sm:justify-between sm:flex-row justify-center sm:items-center sm:p-2 p-8'>
          <div>
            {breadCrumbs}
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex items-center justify-center h-10'>
              {
                collaborators?.map((collaborator)=>(
                    <TooltipProvider key={collaborator.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className='-ml-3 bg-background border-2 flex items-center justify-center border-white h-8 w-8 rounded-full'>
                            <AvatarImage src={collaborator.avatarUrl ? collaborator.avatarUrl : "" } className='rounded-full'/>
                            <AvatarFallback>{collaborator.email.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          User Name
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                ))
              }

            </div>
            {
              saving ? 
              <Badge variant="secondary" className='bg-orange-600 top-4 text-white right-4 z-50'>
                Saving...
              </Badge>
              :
              <Badge variant={'secondary'} className='bg-emerald-600 top-4 text-white right-4 z-50' >
                saved
              </Badge>
            }
          </div>
        </div>
      </div>
      {details.bannerUrl && <>
        <div className='relative w-full h-[200px]'>
          <Image src={
              // supabase.storage.from('workspace-logos').getPublicUrl(details.bannerUrl).data.publicUrl
              "/BannerImage.png"
          } fill className='w-full md:h-40 h-20 object-cover' alt="Banner Image"/>
        </div>
      </>}
      <div className='flex justify-center items-center flex-col mt-2 relative'>
        <div className='w-full self-center max-w-[800px] flex flex-col px-7 lg:my-8'>
          <div className='text-[80px]'>
            <EmojiPicker getValue={iconOnChange} >
                <div className='w-[100px] cursor-pointer transition-colors h-[100px] flex items-center justify-center hover:bg-muted rounded-xl'>
                  {details.iconId}
                </div>
            </EmojiPicker>
          </div>
        </div>
        <div id="container" ref={wrapperRef} className='max-w-[800px]'>
        
        </div>
      </div>
    </>
  )
}

export default QuillEditor