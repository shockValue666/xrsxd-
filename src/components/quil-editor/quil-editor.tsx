"use client";
import { useAppState } from '@/lib/providers/state-provider';
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';
import React, { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import "quill/dist/quill.snow.css"
import { Button } from '../ui/button';
import { deleteFile, deleteFolder, getFileDetails, getFolderDetails, getWorkspaceDetails, updateFile, updateFolder, updateWorkspace } from '@/lib/supabase/queries';
import { usePathname, useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import EmojiPicker from '../global/emoji-picker';
import BannerUpload from '../banner-upload/banner-upload';
import { XCircle, XCircleIcon } from 'lucide-react';
import { useSocket } from '@/lib/providers/socket-provider';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';

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
  const [deletingBanner,setDeletingBanner] = useState(false);
  const {socket, isConnected} = useSocket();
  const router = useRouter();
  const {user} = useSupabaseUser();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();


  const details = useMemo(()=>{
    let selectedDir;
    if(dirType==="file"){
      selectedDir = state.workspaces.find(workspace => workspace.id === workspaceId)
        ?.folders.find((folder:Folder)=>folder.id===folderId)
        ?.files.find((file:File)=>file.id===fileId); 
    }
    if(dirType==="workspace"){
      selectedDir = state.workspaces.find(workspace=>workspace.id===fileId)
    }
    if(dirType==="folder"){
      selectedDir = state.workspaces.find(workspace=>workspace.id===workspaceId)
        ?.folders.find((folder:Folder)=>folderId===fileId);
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
      console.log("quill has been set and now the useEffect of fetchinformation should run. q is: ",q, " quill is: ", quill)
    }
  },[])

  useEffect(()=>{
    console.log("quill has changed state: ",quill)
  },[quill])

  //breadCrumbs
  const breadCrumbs = useMemo(()=>{
    if(!pathname || !state.workspaces || !workspaceId) return;
    const segments = pathname.split("/").filter(val=>val!=="dashboard" && val);
    const workspaceDetails = state.workspaces.find(workspace=>workspace.id===workspaceId)
    // console.log("workspace Det details: ",workspaceDetails)
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
      if(!workspaceId) return;
      dispatch({
        type:"UPDATE_FOLDER",
        payload:{
          workspaceId,
          folderId:fileId,
          folder:{iconId:icon}
        }
      })
      await updateFolder({iconId:icon},fileId);
      
    }
    if(dirType==="file"){
      if(!folderId || !workspaceId) return;
      dispatch({
        type:"UPDATE_FILE",
        payload:{
          workspaceId,
          folderId,
          fileId,
          file:{iconId:icon}
        } 
      })
      await updateFile({iconId:icon},fileId)
    }
  }

  //onClick delete banner
  const deleteBanner = async () => {
    const supabase = createClientComponentClient();
    if(!details.bannerUrl) return;
    setDeletingBanner(true)
    await supabase.storage.from('file-banners').remove([`banner-${fileId}`]);
    if(dirType==="workspace"){
      dispatch({
        type:"UPDATE_WORKSPACE",
        payload:{
          workspace:{bannerUrl:""},
          workspaceId:fileId
        }
      })
      await updateWorkspace({bannerUrl:""},fileId)
    }
    if(dirType==="folder"){
      if(!workspaceId) return;
      await supabase.storage.from('file-banners').remove([`banner-${fileId}`]);
      dispatch({
        type:"UPDATE_FOLDER",
        payload:{
          folderId:fileId,
          workspaceId,
          folder:{bannerUrl:""}
        }
      })
      await updateFolder({bannerUrl:""},fileId);
    }
    if(dirType==="file"){
      if(!workspaceId || !folderId) return;
      await supabase.storage.from('file-banners').remove([`banner-${fileId}`]);
      dispatch({
        type:"UPDATE_FILE",
        payload:{
          fileId,
          folderId,
          workspaceId,
          file:{bannerUrl:""}
        }
      })
      await updateFile({bannerUrl:""},fileId);
    }
    setDeletingBanner(false);

  }

  //refresh the cache 
  useEffect(() => {
    console.log("runninggggggg")
    if (!fileId) {
      return;
    };
    let selectedDir;
    const fetchInformation = async () => {
      if (dirType === 'file') {
        const { data: selectedDir, error } = await getFileDetails(fileId);
        if (error || !selectedDir) {
          console.log("error while trying to fetch file details, ",error)
          return router.replace('/dashboard');
        }

        if (!selectedDir[0]) {
          if (!workspaceId) return;
          return router.replace(`/dashboard/${workspaceId}`);
        }
        if (!workspaceId || quill === null) {
          console.log("workspaceId is null or quill is null widdddd: ", workspaceId, " qqquuuiiilll: ",quill )
          return
        };
        if (!selectedDir[0].data) {
          return
        };
        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        dispatch({
          type: 'UPDATE_FILE',
          payload: {
            file: { data: selectedDir[0].data },
            fileId,
            folderId: selectedDir[0].folderId,
            workspaceId,
          },
        });
      }
      if (dirType === 'folder') {
        const { data: selectedDir, error } = await getFolderDetails(fileId);
        if (error || !selectedDir) {
          return router.replace('/dashboard');
        }

        if (!selectedDir[0]) {
          router.replace(`/dashboard/${workspaceId}`);
        }
        if (quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        dispatch({
          type: 'UPDATE_FOLDER',
          payload: {
            folderId: fileId,
            folder: { data: selectedDir[0].data },
            workspaceId: selectedDir[0].workspaceId,
          },
        });
      }
      if (dirType === 'workspace') {
        const { data: selectedDir, error } = await getWorkspaceDetails(fileId);
        if (error || !selectedDir) {
          return router.replace('/dashboard');
        }
        if (!selectedDir[0] || quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        dispatch({
          type: 'UPDATE_WORKSPACE',
          payload: {
            workspace: { data: selectedDir[0].data },
            workspaceId: fileId,
          },
        });
      }
    };
    fetchInformation();
  }, [fileId, workspaceId, quill, dirType, user]);


  //create rooms for the app
  useEffect(() => {
    //maybe remove the quill and see what happens
    if (socket === null || quill === null || !fileId) return;
    socket.emit('create-room', fileId);
  }, [socket, quill, fileId]);

  //send change to all clients
  useEffect(()=>{
    if(quill===null || socket===null || !fileId || !user) return
    //WIP cursors
    const selectionChangeHandler = () => {}
    const quillHandler = (delta:any,oldDelta:any,source:any) => {
      if(source !== "user") return;
      if(saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);
      const contents = quill.getContents();
      const quillLength = quill.getLength();
      saveTimerRef.current = setTimeout(async ()=>{
        if(contents && quillLength!==1 && fileId){
          if(dirType==="workspace"){
            dispatch({
              type:"UPDATE_WORKSPACE",
              payload:{
                workspace:{data:JSON.stringify(contents)},
                workspaceId:fileId,
              }
            })
            await updateWorkspace({data:JSON.stringify(contents)},fileId);
          }
          if(dirType==="folder"){
            if(!workspaceId) return;
            dispatch({
              type:"UPDATE_FOLDER",
              payload:{
                folderId:fileId,
                workspaceId,
                folder:{data:JSON.stringify(contents)}
              }
            })
            await updateFolder({data:JSON.stringify(contents)},fileId);
          }
          if(dirType==="file"){
            if(!folderId || !workspaceId) return;
            dispatch({
              type:"UPDATE_FILE",
              payload:{
                fileId,
                folderId,
                workspaceId,
                file:{data:JSON.stringify(contents)}
              
          }})
           await updateFile({data:JSON.stringify(contents)},fileId);
          }
        }
        setSaving(false)
      },850)
      socket.emit("send-changes",delta,fileId)
    }
    quill.on("text-change",quillHandler);
    //WIP cursor, we are gonna use a selection handler
    return () => {
      quill.off("text-change",quillHandler)
      //WIP cursors
      if(saveTimerRef.current) clearTimeout(saveTimerRef.current);
    }
  },[quill,socket,fileId,user,details,folderId,workspaceId,dispatch])

  useEffect(() => {
    console.log("does this even run?")
    if (quill === null || socket === null) {
      console.log("quill or socket is null: ",quill,socket)
      return
    };
    const socketHandler = (deltas: any, id: string) => {
      // console.log("deltas: ",deltas, " id: ",id, " fileId: ",fileId)
      if (id === fileId) {
        console.log("deltas: ",deltas) 
        quill.updateContents(deltas);
      }
    };
    socket.on('receive-changes', socketHandler);
    return () => {
      socket.off('receive-changes', socketHandler);
    };
  }, [quill, socket, fileId]);
  return (
    <>
    {/* {isConnected ? "connected" : "not connected"} */}
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
              supabase.storage.from('file-banners').getPublicUrl(details.bannerUrl).data.publicUrl
              // "/BannerImage.png"
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
          <div className='flex'>
            <BannerUpload details={details} id={fileId} dirType={dirType} className='mt-2 text-sm text-muted-foreground p-2 hover:text-card-foreground transition-all rounded-md'>
              {details.bannerUrl ? "Update Banner" : "Add Banner"}
            </BannerUpload>
            {details.bannerUrl && (
              <Button disabled={deletingBanner} onClick={deleteBanner} variant={'ghost'} className='gap-2 hover:bg-background flex items-center justify-center mt-2 text-sm text-muted-foreground w-36 p-2 rounded-md' >
                <XCircleIcon size={16}/>
                <span className='whitespace-nowrap font-normal'>Remove Banner</span>
              </Button>
            )}
          </div>
          <span className='text-muted-foreground text-3xl font-bold h-9'>
            {details.title}
          </span>
          <span className='text-muted-foreground text-sm'>
              {dirType.toLowerCase()}
          </span>
        </div>
        <div id="container" ref={wrapperRef} className='max-w-[800px]'>
        
        </div>
      </div>
    </>
  )
}

export default QuillEditor