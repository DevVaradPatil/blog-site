"use client";
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import BackButton from "./auth/back-button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreatePostSchema } from "@/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useCurrentUser } from "@/hooks/use-current-user";
import { createPost } from "@/actions/create-post";
import { useRouter } from "next/navigation";
import { storage } from "@/firebase";
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";

const CreatePostForm = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, setIsPending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagInput = e.target.value;
    const tagArray = tagInput.split(",").map((tag) => tag.trim());
    setTags(tagArray);
  };

  const handleChange = (e: any) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setImagePreview(null);
    }
  };

  const handleUpload = async (file) => {
    if (!file) {
      console.error("No file selected for upload.");
      return;
    }

    try {
      // Create a reference to the storage bucket's 'images' directory and the file to be uploaded
      const storageRef = ref(storage, "images/" + file.name);

      // Upload the file to the storage bucket
      const snapshot = await uploadBytes(storageRef, file);

      // Get the download URL for the uploaded file
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log("File uploaded successfully. Download URL:", downloadURL);

      // Return the download URL for further use
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error; // Rethrow the error for handling in the component
    }
  };

  const user = useCurrentUser();
  const router = useRouter();
  const form = useForm<z.infer<typeof CreatePostSchema>>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      title: "",
      content: "",
      image: undefined,
      authorId: user?.id,
      tags: [],
      link: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof CreatePostSchema>) => {
    setError("");
    setSuccess("");
    setIsPending(true);
    if (file) {
      const imgUrl = await handleUpload(file);
      values.image = imgUrl;
    }
    values.tags = tags;
    await createPost(values)
      .then((data) => {
        if (data?.error) {
          form.reset();
          setError(data.error);
        }

        if (data?.success) {
          form.reset();
          setSuccess(data.success);
        }
        setIsPending(false);
        router.push("/home");
      })
      .catch(() => {
        setIsPending(false);
        console.log("Something went wrong!");
      });
  };

  const renderBoldText = (content: string) => {
    return content.replace(/\*\*(.*?)\*\*/g, (match, group) => {
      return `<strong>${group}</strong>`;
    });
  };

  return (
    <Card className="w-[600px] shadow-md">
      <CardHeader>
        <h1 className="text-xl font-semibold text-center">Create a Post</h1>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Insert title here"
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Insert content here"
                        value={renderBoldText(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Add comma separated tags"
                        value={tags}
                        onChange={handleTagChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Insert link here"
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input {...field} type="file" onChange={handleChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {imagePreview && (
                <div className="w-full mt-2 h-[250px] flex justify-center items-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
            </div>
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button type="submit" className="w-full" disabled={isPending}>
              Create Post
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <BackButton label={"Back to Home"} href={"/"} />
      </CardFooter>
    </Card>
  );
};

export default CreatePostForm;
