import CreatePostForm from '@/components/create-post-form'
import HomeBar from '@/components/homebar'
import React from 'react'

const CreatePost = () => {
  
  return (
    <div className='min-h-screen py-[120px] xs:py-3 xs:px-3 xs:pb-[80px] flex items-center justify-center bg-slate-100'>
          <HomeBar />
        <CreatePostForm/>
    </div>
  )
}

export default CreatePost