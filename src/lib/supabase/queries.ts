'use server';
import { files, folders, workspaces } from "../../../migrations/schema";
import db from "./db"
import {Folder, Subscription, workspace} from './supabase.types'
import {validate} from 'uuid'
import {eq} from 'drizzle-orm'

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
        logo:workspaces.logo
    }).from(workspaces)
        // .where(and(notExists(db.select().from(collaborators))))
}