import React from 'react'

interface anotherAouterProps{
    children:React.ReactNode
}

const anotherAouter:React.FC<anotherAouterProps> = ({children}) => {
  return (
    <div className='border border-red-500'>{children}</div>
  )
}

export default anotherAouter