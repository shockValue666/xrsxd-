export const dynamic = 'force-dynamic';

import React from 'react'
import QuillEditor from '@/components/quil-editor/quil-editor'
import { redirect } from 'next/navigation'
import { getFolderDetails } from '@/lib/supabase/queries'


const page = async ({params}: {params: {folderId:string}}) => {
  const {data,error} = await getFolderDetails(params.folderId);
  if(error) redirect('/dashboard');
  return (
    <div className='relative'>
      <QuillEditor dirType="folder" fileId={params.folderId} dirDetails={data[0] || {}}/>
    </div>
  )
}

export default page