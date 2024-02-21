'use server';
import { files, folders, users, workspaces } from "../../../migrations/schema";
import db from "./db"
import {Folder, Subscription, User, workspace} from './supabase.types'
import {validate} from 'uuid'
import {and, eq, ilike, notExists} from 'drizzle-orm'
import { collaborators } from "./schema";
import { File } from "./supabase.types";
import { revalidatePath } from "next/cache";

export const getUserSubscriptionStatus = async (userId:string) =>{

    try {
        const data = await db.query.subscriptions.findFirst({
            where:((subscription,{eq})=> eq(subscription.userId,userId))
        })
        if(data){
            return {
                data:data as Subscription,
                error:null
            }
        }else{
            return {
                data:null,
                error:null
            }
        }
    } catch (error) {
        console.log("error: ",error)
        return {
            data:null,
            error:`Error: ${error}`
        }
    }
}


export const createWorkspace = async (workspace:workspace) => {
    try {
        // console.log("workspace: ",workspace)
        const response = await db.insert(workspaces).values(workspace)
        // console.log("response: ",response)
        return {data:null,error:null}
    } catch (error) {
        console.log("error at creating workspace :",error)
        return {data:null, error: "Error"}
    }
}

export const getFiles = async (folderId:string) => {
    const isValid = validate(folderId)
    if(!isValid){
        return {data:null,error:"Error validating the folderId"}
    }
    try {
        const results = (await db
            .select()
            .from(files)
            .orderBy(files.createdAt)
            .where(eq(files.folderId,folderId))) as File[] | [];
        return {data:results,error:null} 
    } catch (error) {
        console.log(error)
        return {data:null,error:"Error at creating"}
        
    }
}

export const getFolders = async (workspaceId:string)=> {
    const isValid=validate(workspaceId)
    if(!isValid){
        return {
            data:null,
            error:"error, invalid workspace id from uuid"
        }
    }
    try {
        const results: Folder[] | [] = await db
            .select()
            .from(folders)
            .orderBy(folders.createdAt)
            .where(eq(folders.workspaceId,workspaceId))
            return {
                data:results,
                error:null
            }
    } catch (error) {
        return{
            data:null,
            error:`error retrieving the folders lol danah tsaf ${error}`
        }   
    }
}

export const  getPrivateWorkspaces = async (userId:string) => {
    if(!userId) return [];
    const privateWorkspaces = await db.select({
        id:workspaces.id,
        createdAt:workspaces.createdAt,
        workspaceOwner:workspaces.workspaceOwner,
        title: workspaces.title,
        iconId:workspaces.iconId,
        data:workspaces.data,
        inTrash:workspaces.inTrash,
        logo:workspaces.logo,
        bannerUrl:workspaces.bannerUrl
    })
    .from(workspaces)
    .where(
        and(
          notExists(
            db
              .select()
              .from(collaborators)
              .where(eq(collaborators.workspaceId, workspaces.id))
          ),
          eq(workspaces.workspaceOwner, userId)
        )
      ) as workspace[];
    return privateWorkspaces;
}

export const getCollaboratingWorkspaces = async (userId:string) => {
    if(!userId) return [];
    const collaboratedWorkspaces = await db.select({
        id:workspaces.id,
        createdAt:workspaces.createdAt,
        workspaceOwner:workspaces.workspaceOwner,
        title: workspaces.title,
        iconId:workspaces.iconId,
        data:workspaces.data,
        inTrash:workspaces.inTrash,
        logo:workspaces.logo,
        bannerUrl:workspaces.bannerUrl
    })
        .from(users)
        .innerJoin(collaborators,eq(users.id,collaborators.userId))
        .innerJoin(workspaces,eq(collaborators.workspaceId,workspaces.id))
        .where(eq(users.id,userId)) as workspace[]

    return collaboratedWorkspaces;

}

export const getSharedWorkspaces = async (userId:string) => {
    if(!userId) return [];
    const sharedWorkspaces = (await db
        .selectDistinct({
          id: workspaces.id,
          createdAt: workspaces.createdAt,
          workspaceOwner: workspaces.workspaceOwner,
          title: workspaces.title,
          iconId: workspaces.iconId,
          data: workspaces.data,
          inTrash: workspaces.inTrash,
          logo: workspaces.logo,
          bannerUrl: workspaces.bannerUrl,
        })
        .from(workspaces)
        .orderBy(workspaces.createdAt)
        .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
        .where(eq(workspaces.workspaceOwner, userId))) as workspace[];
    
        return sharedWorkspaces;

}

export const addCollaborators = async (users:User[],workspaceId:string) => {
    const response = users.forEach(async (user:User) => {
        const userExists = await db.query.collaborators.findFirst({
            where:(u,{eq})=> and(eq(u.userId,user.id),eq(u.workspaceId,workspaceId))
        });
        if(!userExists) await db.insert(collaborators).values({workspaceId,userId:user.id})
    })
}

export const getUsersFromSearch = async (email:string) => {
    if(!email) return [];
    const account = db.select().from(users).where(ilike(users.email,`${email}%`)); //one or 2? 
    return account;
}

export const createFolder = async(folder:Folder) => {
    try{
        const response = await db.insert(folders).values(folder);
        return {data:null,error:null}
    }catch(err){
        console.log("error at creating folder: ",err)
        return {data:null,error:"Error at creating a folder"}
    }
}

export const updateFolder = async (folder:Partial<Folder>,folderId:string) => {
    try {
        const result = await db.update(folders).set(folder).where(eq(folders.id,folderId))
        // console.log("from updating: the fucking folder: ",result)
        return {data:null,error:null}
    } catch (error) {
        return {data:null,error:`Error at updating the folder: ${error}`} 
    }
}

export const createFile = async (file:File) => {
    try {
        await db.insert(files).values(file)
        return {data:null,error:null}
    } catch (error) {
        return {data:null, error:`Error at creating the file: ${error}`}
    }
}

export const updateFile = async (file:Partial<File>,fileId:string) => {
    try {
        await db.update(files).set(file).where(eq(files.id,fileId))
        return {data:null,error:null}
    } catch (error) {
        return {data:null,error:`error at updating the file: ${error}`}
    }
}

export const updateWorkspace = async (workspace:Partial<workspace>,workspaceId:string) => {
    if(!workspaceId) return {data:null,error:"Error, no workspace id"}
    try {
        await db.update(workspaces).set(workspace).where(eq(workspaces.id,workspaceId))
        return {data:null,error:null}
        revalidatePath(`/dashboard/${workspaceId}`); // it helps to revalidate the path
        //revalidate the path means that the page will be revalidated and the data will be updated
    } catch (error) {
        return {data:null,error:`Error at updating the workspace: ${error}`}
    }
}

export const removeCollaborators = async (users:User[],workspaceId:string) => {
    const reponse = users.forEach(async (user:User)=> {
        const userExists = await db.query.collaborators.findFirst({
            where:(u,{eq})=> and(eq(u.userId,user.id),eq(u.workspaceId,workspaceId))
        })
        if(userExists) await db.delete(collaborators).where(and(eq(collaborators.workspaceId,workspaceId),eq(collaborators.userId,user.id)));        
    })
}


export const deleteWorkspace = async (workspaceId:string) => {
    await db.delete(workspaces).where(eq(workspaces.id,workspaceId))
}

export const getWorkspaceDetails = async(workspaceId:string) => {
    const isValid = validate(workspaceId);
    if(!isValid) return {data:[],error:"Error, invalid workspace id from uuid"}
    try {
        const result = await (db.select().from(workspaces).where(eq(workspaces.id,workspaceId)).limit(1)) as workspace[] | [];
        return {data:result,error:null}
    } catch (error) {
        return {data:[],error:`Error at getting the workspace details: ${error}`}
    }
}

export const getFolderDetails = async(folderId:string) => {
    const isValid = validate(folderId);
    if(!isValid) return {data:[],error:"Error, invalid file id from uuid"}
    try {
        const result = await (db.select().from(folders).where(eq(folders.id,folderId)).limit(1)) as Folder[] | [];
        return {data:result,error:null}
    } catch (error) {
        return {data:[],error:`Error at getting the folder details: ${error}`}
    }
}

export const getFileDetails = async(fileId:string) => {
    const isValid = validate(fileId);
    if(!isValid) return {data:[],error:"Error, invalid file id from uuid"}
    try {
        const result = await (db.select().from(files).where(eq(files.id,fileId)).limit(1)) as File[] | [];
        return {data:result,error:null}
    } catch (error) {
        return {data:[],error:`Error at getting the file details: ${error}`}
    }
}

export const deleteFile = async (fileId:string) => {
    await db.delete(files).where(eq(files.id,fileId));
}

export const deleteFolder = async (folderId:string) => {
    await db.delete(folders).where(eq(folders.id,folderId));
}


export const getCollaborators = async (workspaceId:string) => {
    const response = await db.select().from(collaborators).where(eq(collaborators.workspaceId,workspaceId));
    if(!response.length) return []
    const userInformation:Promise<User | undefined>[] = response.map(async (user) => {
        const exists = db.query.users.findFirst({
            where:(u,{eq})=> eq(u.id,user.userId)
        })
        return exists;
    })
    const resolvedUsers = await Promise.all(userInformation);
    return resolvedUsers.filter(Boolean) as User[];
}