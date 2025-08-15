import cloudinary from "./config/cloudinaryConfig.js";


async function listFolders() {
  try {
    const result = await cloudinary.api.root_folders();
    console.log(result)
  } catch (error) {
    console.log("err listing folder", error)
  }
}

listFolders();
