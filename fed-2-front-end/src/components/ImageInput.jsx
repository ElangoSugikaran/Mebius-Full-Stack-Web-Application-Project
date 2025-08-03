// import { Input } from "./ui/input"
// import { putImage } from "@/lib/product";

// const ImageInput = ({ onChange, value }) => {

//     const handleFileChange = async (e) => {
//         console.log(e.target.files);
//         try {

//             if(!e.target.files){
//                 return;
//             }

//             const file = e.target.files[0];
//             if(!file){
//                 return;
//             }

//             const url  = await putImage({ file }); //! File will be uploaded to a bucket and the url will be returned
//             // const url = "https://via.placeholder.com/150";
//             onChange(url); // Update the form state with the image URL
//             console.log(url);
//         } catch (error) {
//             console.error(error);
//         }
//     }

//     return (
//        <div className="grid w-full max-w-sm items-center gap-1.5">
//             <Input type="file" onChange={handleFileChange} />
//        </div>
//     )
// }

// export default ImageInput

// Updated ImageInput.jsx - ONLY change the import and handleFileChange function:

import { Input } from "./ui/input"
import { useState, useEffect } from "react";
// Import the upload functions
import { uploadCategoryImageGeneric, putCategoryImage } from "@/lib/category";
import { uploadProductImageGeneric, putProductImage } from "@/lib/product";

const ImageInput = ({ 
  onChange, 
  value, 
  entityType = "product", 
  entityId = null 
}) => {
  const [preview, setPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Update preview when value (URL string) changes
  useEffect(() => {
    if (typeof value === 'string' && value) {
      setPreview(value);
    } else {
      setPreview("");
    }
  }, [value]);

  const handleFileChange = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setIsUploading(true);
      let url;
      
      // CREATE mode (no entityId) - use generic upload
      if (!entityId) {
        if (entityType === "category") {
          url = await uploadCategoryImageGeneric({ file });
        } else {
          url = await uploadProductImageGeneric({ file });
        }
      } 
      // EDIT mode (entityId exists) - use specific upload
      else {
        if (entityType === "category") {
          url = await putCategoryImage({ file, categoryId: entityId });
        } else {
          url = await putProductImage({ file, productId: entityId });
        }
      }
      
      onChange(url); // Always pass URL string to form
      
    } catch (error) {
      console.error("Image upload failed:", error);
      alert(`Image upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Keep the rest of your component the same...
  return (
    <div className="space-y-3">
      {preview && (
        <div className="w-40 h-40 border rounded overflow-hidden">
          <img 
            src={preview} 
            alt="Preview" 
            className="object-cover w-full h-full"
          />
        </div>
      )}
      
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Input 
          type="file" 
          onChange={handleFileChange} 
          disabled={isUploading}
          accept="image/*"
        />
        {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
      </div>
    </div>
  );
};

export default ImageInput;