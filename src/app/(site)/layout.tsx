import React from 'react'

interface LayoutProps{
    children:React.ReactNode
}

const layout:React.FC<LayoutProps> = ({
    children
}) => {
  return (
    <main>
        {children}
    </main>
  )
}

export default layout