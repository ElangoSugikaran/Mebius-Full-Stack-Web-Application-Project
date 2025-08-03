// File: lib/category.js

// ✅ FOR CREATE MODE - Generic category image upload (no categoryId needed)
export const uploadCategoryImageGeneric = async ({ file }) => {
  try {
    // Step 1: Get signed URL from backend
    const res = await fetch(`http://localhost:8000/api/categories/upload-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileType: file.type }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to get upload URL");
    }

    const data = await res.json();
    
    // Step 2: Upload file to cloud storage using signed URL
    const uploadRes = await fetch(data.url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Image upload to storage failed");
    }
    
    // Step 3: Return the public URL for the form to use
    return data.publicURL;
    
  } catch (error) {
    console.error("Category image upload failed:", error);
    throw error;
  }
};

// ✅ FOR EDIT MODE - Upload image for existing category
export const putCategoryImage = async ({ file, categoryId }) => {
  try {
    // Step 1: Get signed URL for specific category
    const res = await fetch(`http://localhost:8000/api/categories/${categoryId}/image`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileType: file.type }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to get upload URL");
    }

    const data = await res.json();
    
    // Step 2: Upload file to cloud storage
    const uploadRes = await fetch(data.url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Image upload to storage failed");
    }
    
    // Step 3: Return the public URL
    return data.publicURL;
    
  } catch (error) {
    console.error("Category image update failed:", error);
    throw error;
  }
};