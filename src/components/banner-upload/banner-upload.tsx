import { appWorkspacesType, appFoldersType } from '@/lib/providers/state-provider';
import { File, Folder, workspace } from '@/lib/supabase/supabase.types'
import React from 'react'
import CustomDialogTrigger from '../global/custom-dialog-trigger';
import BannerUploadForm from './banner-upload-form';

interface BannerUploadProps{
    details: File | Folder | workspace | appWorkspacesType | appFoldersType; 
    id:string;
    dirType:"file" | "folder" | "workspace";
    children:React.ReactNode;
    className?:string;
}

const BannerUpload:React.FC<BannerUploadProps> = ({
    details,
    id,
    dirType,
    children,
    className
}) => {
  return (
    <CustomDialogTrigger header={"Upload Banner"} content={
        <BannerUploadForm details={details} dirType={dirType} id={id}>
            
        </BannerUploadForm>
    } className={className}>
        {children}
    </CustomDialogTrigger>
  )
}

export default BannerUpload