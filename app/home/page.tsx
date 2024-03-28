import PostCard from '@/components/cards/post-card';
import HomeBar from '@/components/homebar';
import { getAllPosts } from '@/data/post'
import React, { useEffect } from 'react'

const Home = async() => {

    const posts = await getAllPosts();
    
  return (
    <div className='flex flex-col w-full bg-slate-50 space-y-4 justify-center items-center py-[120px] xs:py-5 xs:pb-[80px]'>
          <HomeBar />
      {posts?.reverse()?.map((post) =>(
        <PostCard post={post} key={post.id}/>
      ))}
    </div>
  )
}

export default Home