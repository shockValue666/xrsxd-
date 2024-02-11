"use client";
import { useAppState } from '@/lib/providers/state-provider';
import { workspace } from '@/lib/supabase/supabase.types'
import React, { useEffect, useState } from 'react'

interface WorkspaceDropdownProps{
    privateWorkspaces: workspace[] | [];
    sharedWorkspaces: workspace[] | [];
    collaboratingWorkspaces: workspace[] | [];
    defaultValue: workspace | undefined;
}

const WorkspaceDropdown:React.FC<WorkspaceDropdownProps> = ({
    privateWorkspaces,
    collaboratingWorkspaces,
    sharedWorkspaces,
    defaultValue
}) => {
    const {dispatch,state} = useAppState() //the equivalent of useContext in order to access those values ig or not
    const [selectedOption,setSelectedOption] = useState(defaultValue)
    const [isOpen,setIsOpen] = useState(false)

    useEffect(()=>{
        if(!state.workspaces.length){
            dispatch({
                type:"SET_WORKSPACES",
                payload:{
                    workspaces:
                        [...privateWorkspaces,...sharedWorkspaces,...collaboratingWorkspaces]
                        .map((workspace)=>({...workspace,folders:[]}))
                }
            })
        }
    },[privateWorkspaces,collaboratingWorkspaces,sharedWorkspaces])

    const handleSelect = (option:workspace) => {
        setSelectedOption(option);
        setIsOpen(false);
    } 
  return (
    <div className='relative inline-block text-left'>
        <div>
            <span onClick={()=>{setIsOpen(!isOpen)}}></span>
        </div>
    </div>
  )
}

export default WorkspaceDropdown