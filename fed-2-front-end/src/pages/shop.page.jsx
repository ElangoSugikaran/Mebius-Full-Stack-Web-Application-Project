import {  useGetAllProductsQuery} from '../lib/api';

const ShopPage = () => {
  const { data: products, isLoading, isError, error } = useGetAllProductsQuery();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  console.log(products);

  return (
    <main>
      <h1>Shop Page</h1>
      {/* <p>Category: {category}</p> */}
      <div>{isLoading ? "Loading products..." : "Products loaded"}</div>
      <div>{error}</div>
      <h2>Products</h2>
      <div>{JSON.stringify(products)}</div>
    </main>
  )
  
}

export default ShopPage


