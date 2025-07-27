import CreateProductForm from "@/components/CreateProductForm";
import { useGetAllCategoriesQuery } from "@/lib/api";

const CreateProductPage = () => {

  const { data: categories } = useGetAllCategoriesQuery();

  return (
    <main className='px-16 min-h-screen py-8'>
        <h2 className='text-4xl font-bold'>Create Product</h2>
        <CreateProductForm categories={categories} />
    </main>
  )
}

export default CreateProductPage