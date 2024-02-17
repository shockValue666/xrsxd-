export const dynamic = 'force-dynamic';

import React from 'react'
import QuillEditor from '@/components/quil-editor/quil-editor'
import { getFileDetails, getWorkspaceDetails } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'

const page = async (params:{params:{fileId:string}}) => {
  const {data,error} = await getFileDetails(params.params.fileId)
  if(error) redirect('/dashboard');
  return (
    <div className='relative'>
      <QuillEditor dirType="file" fileId={params.params.fileId} dirDetails={data[0] || {}}/>
    </div>
  )
}

export default page