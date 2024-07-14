import { storage } from "@/firebase";
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";

export const handleUpload = async (file : any) => {
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
      return ""; // Rethrow the error for handling in the component
    }
  };