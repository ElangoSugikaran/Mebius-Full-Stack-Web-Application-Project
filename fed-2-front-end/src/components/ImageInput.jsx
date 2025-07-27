import { Input } from "./ui/input"
import { putImage } from "@/lib/product";

const ImageInput = ({ onChange, value }) => {

    const handleFileChange = async (e) => {
        console.log(e.target.files);
        try {

            if(!e.target.files){
                return;
            }

            const file = e.target.files[0];
            if(!file){
                return;
            }

            const url  = await putImage({ file }); //! File will be uploaded to a bucket and the url will be returned
            // const url = "https://via.placeholder.com/150";
            onChange(url); // Update the form state with the image URL
            console.log(url);
        } catch (error) {
            console.error(error);
        }
    }

    return (
       <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input type="file" onChange={handleFileChange} />
       </div>
    )
}

export default ImageInput


