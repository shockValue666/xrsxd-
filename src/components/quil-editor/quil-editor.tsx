"use client";
import { useAppState } from '@/lib/providers/state-provider';
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';
import React, { use, useCallback, useMemo, useState } from 'react'
import "quill/dist/quill.snow.css"
import { Button } from '../ui/button';
import { deleteFile, deleteFolder, updateFile, updateFolder } from '@/lib/supabase/queries';
import { usePathname } from 'next/navigation';

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
  const {state,workspaceId,folderId,dispatch} = useAppState();
  const [quill,setQuill] = useState<any>(null);
  const pathname = usePathname();

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
        </div>
      </div>
      <div className='flex justify-center items-center flex-col mt-2 relative'>
        <div id="container" ref={wrapperRef} className='max-w-[800px]'>
          
        </div>
      </div>
    </>
  )
}

export default QuillEditor