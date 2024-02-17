export const dynamic = 'force-dynamic';

import QuillEditor from '@/components/quil-editor/quil-editor'
import { getWorkspaceDetails } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import React from 'react'

const WorkspacePage = async ({params}: {params: {workspaceId:string}}) => {
  const {data,error} = await getWorkspaceDetails(params.workspaceId)
  if(error) redirect('/dashboard');
  return (
    <div className='relative'>
      <QuillEditor dirType="workspace" fileId={params.workspaceId} dirDetails={data[0] || {}}/>
    </div>
  )
}

export default WorkspacePage