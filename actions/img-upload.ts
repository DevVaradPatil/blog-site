import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import { v4 as uuidv4 } from "uuid";
import {storage} from '@/firebase'

interface ImageUploadEvent {
  target: {
    files: FileList;
  };
}

async function handleImageUpload(event: ImageUploadEvent) {
  const file = event.target.files[0];

  if (!file) {
    // Handle no file selected case
    console.log("No file selected");
    
    return;
  }

  const storageRef = ref(storage, `images/${uuidv4()}-${file.name}`);
  const uploadTask = uploadBytes(storageRef, file);

  try {
    await uploadTask;
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Image uploaded successfully:", downloadURL);
    // Use the downloadURL to display the image or perform other actions
  } catch (error) {
    console.error("Error uploading image:", error);
    // Handle errors appropriately, e.g., display an error message to the user
  }
}

export default handleImageUpload;
