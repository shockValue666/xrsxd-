import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider } from '../ui/tooltip';
import { TooltipTrigger } from '@radix-ui/react-tooltip';

interface TooltipComponentProps{
    children:React.ReactNode;
    message:string;
}

const TooltipComponent:React.FC<TooltipComponentProps> = ({children,message}) => {
  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger>
                {children}
            </TooltipTrigger>
            <TooltipContent>
                {message}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  )
}

export default TooltipComponent