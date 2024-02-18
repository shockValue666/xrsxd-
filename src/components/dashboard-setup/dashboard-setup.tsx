"use client";
import React ,{useEffect, useReducer, useState}from 'react'
import {AuthUser} from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import EmojiPicker from '../global/emoji-picker';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { actionLogCock } from '@/lib/server-action/auth-actions';
import { Subscription, workspace } from '@/lib/supabase/supabase.types';
import { CreateWorkspaceFormSchema } from '@/lib/types';
import { z } from 'zod';
import Loader from '../global/Loader';
import {v4} from 'uuid'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '../ui/use-toast';
import { createWorkspace } from '@/lib/supabase/queries';
import { useAppState } from '@/lib/providers/state-provider';
import { useRouter } from 'next/navigation';
import { ToastAction } from '../ui/toast';

interface DashboardSetupProps{
    user:AuthUser;
    subscription:Subscription | null;
    // cook: () => ReadonlyRequestCookies;
}


const DashboardSetup:React.FC<DashboardSetupProps> = ({
  user,subscription
}) => {
  const {toast} = useToast()
  const router= useRouter();
  const [selectedEmoji,setSelectedEmoji] = useState("🤑");
  const supabase = createClientComponentClient()
  const {register,handleSubmit,reset, formState:{isSubmitting:isLoading,errors}} = useForm<z.infer<typeof CreateWorkspaceFormSchema>>({
    mode:"onChange",
    defaultValues:{
      file:"", //only pro members can upload a custom logo for their workspace
      workspaceName:""
    }
  });
  const { dispatch } = useAppState();

  const dosth = async () =>{
    console.log("i am doing someshit")
    toast({
      variant:"destructive",
      title:"cock",
      action:(
        <ToastAction altText="Couldn't upload the cock">Errorlolcock</ToastAction>
      )
    })
  }

  const onCli:SubmitHandler<z.infer<typeof CreateWorkspaceFormSchema>> = async (value,event) => {
    event?.preventDefault();
    const file = value.file[0];
    // console.log("file: ",file);
    let filePath=null;
    const workspaceUUID = v4() //ok lol it just generates a uuid
    // console.log("workspaceuuid: ",workspaceUUID)
    if(file){
      try{
        // const {data} = await supabase.storage.from('workspace-logos').getPublicUrl('4.jpeg')
        const {data,error} = await supabase.storage.from('workspace-logos').upload(`workspaceLogoFromMyCock.${workspaceUUID}`,file,{
          cacheControl:'3600',
          // upsert:true
        })
        if(error){
          console.log("error: at uploading",error)
          toast({
            variant: 'destructive',
            title: 'Error! Could not upload your workspace logo',
            action:(
              <ToastAction altText="Couldn't upload the shit">Errorlol</ToastAction>
            )
          });
        }
        filePath=data?.path || null;
        // console.log("data: ",data);

      }catch(error){
        console.log("erorrorororo: ",error)
        toast({
          variant: 'destructive',
          title: 'Error! Could not upload your workspace logo',
          action:(
            <ToastAction altText="Couldn't upload the shit workspace logo">Errorlollogo</ToastAction>
          )
        });
      }

      try {
        const newWorkspace: workspace = {
          data:null,
          createdAt:new Date().toISOString(),
          iconId: selectedEmoji,
          id: workspaceUUID,
          inTrash:"",
          title: value.workspaceName,
          workspaceOwner:user.id,
          logo:filePath,
          bannerUrl:""
        }
        console.log("new workspace: asdsfasdfadsfasd",newWorkspace)
        const {data,error:createError} = await createWorkspace(newWorkspace);
//        bring crateWorkspace here and piece by piece fix it
        if(data) {
          console.log("data from crating new workspace: ",data)
        } else if(createError) {
          console.log("craet error: ",createError)
        }
        if(createError){
          throw new Error();
        }
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
        
        router.replace(`/dashboard/${newWorkspace.id}`);
      } catch (error) {
        console.log("error from the workspace creation ig: ", error)
        toast({
          variant: 'destructive',
          title: 'Could not create your workspace',
          description:
            "Oops! Something went wrong, and we couldn't create your workspace. Try again or come back later.",
          action:(
            <ToastAction altText="Couldn't create the workspace">Errorlolspace</ToastAction>
          )
        });
      }finally {
        reset();
      }
    }
  }

  // const onSubmit: SubmitHandler<
  //     z.infer<typeof CreateWorkspaceFormSchema>
  //   > = async (value) => {
  //       const { data, error: createError } = await createWorkspace(newWorkspace);
  //       if (createError) {
  //         throw new Error();
  //       }
  //       dispatch({
  //         type: 'ADD_WORKSPACE',
  //         payload: { ...newWorkspace, folders: [] },
  //       });

  //       toast({
  //         title: 'Workspace Created',
  //         description: `${newWorkspace.title} has been created successfully.`,
  //       });

  //       router.replace(`/dashboard/${newWorkspace.id}`);
  //     } catch (error) {
  //       console.log(error, 'Error');
  //       toast({
  //         variant: 'destructive',
  //         title: 'Could not create your workspace',
  //         description:
  //           "Oops! Something went wrong, and we couldn't create your workspace. Try again or come back later.",
  //       });
  //     } finally {
  //       reset();
  //     }
  //   };

  useEffect(()=>{console.log("logged")},[])
  return (
    <Card className='lg:w-[800px] h-screen sm:h-auto w-[100%]'>
      <CardHeader>
        <CardTitle>
          Create a workspace, i will have a tinder/tiktok like algorithm that will show trending videos and they will choose one and follow it etc
          or render from their youtube account with google authentication
        </CardTitle>
        <CardDescription>
          Lets create a private workspace to get you started.You can add
            collaborators later from the workspace settings tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onCli)} action="">
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-4'>
              <div className='text-5xl'>
                <EmojiPicker getValue={(emoji)=>{setSelectedEmoji(emoji)}} >
                  {selectedEmoji}
                </EmojiPicker>
              </div>
              <Button
                onClick={()=>{actionLogCock();dosth()}}
              >
                cock
              </Button>
              <div className='w-full'>
                <Label htmlFor='workspaceName' className='text-sm text-muted-foreground'>
                  Workspace Name
                </Label>
                <Input id="workspaceName" type='text' placeholder='Workspace Name' className='bg-transparent' disabled={isLoading}
                  {...register("workspaceName",{required:"Workspace name is required"})}
                />
                <small className='text-red-600'>
                  {errors?.root?.message?.toString()}
                </small>
              </div>
            </div>
            <div>
              <Label htmlFor='workspaceLogo' className='text-sm text-muted-foreground'>
                Workspace Logo
              </Label>
              <Input id="workspaceLogo" type='file' accept='image/*' placeholder='Workspace Name' className='bg-transparent' disabled={
                isLoading || 
                // subscription?.status!=="active"
                false
              }
                {...register("file",{required:"Workspace logo is required"})}
              />
              <small className='text-red-600'>
                {errors?.root?.message?.toString()}
              </small>
            </div>
            <div className="self-end">
              <Button
                type="submit"
                disabled={isLoading}
              >
                {!isLoading ? 'Create Workspace' : <Loader />}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default DashboardSetup