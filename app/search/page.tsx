"use client";

import UserCard from "@/components/cards/user-card";
import HomeBar from "@/components/homebar";
import { Input } from "@/components/ui/input";
import { getUserByName } from "@/data/user";
import { Post, User } from "@prisma/client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPostsByTitle } from "@/data/post";
import PostHorizontalCard from "@/components/cards/post-horizontal-card";
import LoadingSpinner from "@/components/loading-spinner";

const Search = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[] | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);

  const handleSearch = async (searchTerm: string) => {
    setIsLoading(true);
    const usersData = await getUserByName(searchTerm.toLowerCase());
    setUsers(null);
    setUsers(usersData);
    const postsData = await getPostsByTitle(searchTerm.toLowerCase());
    setPosts(null);
    setPosts(postsData);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 space-y-4 justify-start items-center py-[120px] xs:py-3 xs:pb-[80px] xs:px-3">
      <HomeBar />
      <div className="w-[550px] xs:w-full flex justify-center items-center flex-col">
        <Input
          placeholder="Search for anything"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Tabs defaultValue="people" className="w-full py-3">
          <TabsList className="w-full">
            <TabsTrigger value="people" className="w-full">
              People{" "}
              {users && users.length > 0 && (
                <span className="text-[12px] flex justify-center items-center mx-2 w-5 h-5 bg-neutral-200 rounded-full">
                  {users.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="posts" className="w-full">
              Posts
              {posts && posts.length > 0 && (
                <span className="text-[12px] flex justify-center items-center mx-2 w-5 h-5 bg-neutral-200 rounded-full">
                  {posts.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="people">
            <div className="flex justify-center items-center flex-col py-3 space-y-2">
              {users && users.length > 0 ? (
                users.map((user) => <UserCard user={user} key={user.id} />)
              ) : (
                <p className="text-neutral-500">Nothing to show.</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="posts">
            <div className="flex justify-center items-center flex-col py-3 xs:space-y-1 space-y-2">
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <PostHorizontalCard post={post} key={post.id} />
                ))
              ) : (
                isLoading ? (
                  <LoadingSpinner message="Gathering Content..."/>
                ): (
                  <p className="text-neutral-500">Nothing to show.</p>
                )
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Search;
