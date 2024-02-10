import React from 'react'
import { Toaster } from "@/components/ui/toaster"

interface LayoutProps{
    children:React.ReactNode;
    params:any;
}

const Layout:React.FC<LayoutProps> = ({children,params}) => {
  return (
    <main className='flex overflow-hidden h-screen'>
        {children}
        <Toaster />
    </main>
  )
}

export default Layout