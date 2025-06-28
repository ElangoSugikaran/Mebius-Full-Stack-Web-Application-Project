import { useEffect, useState } from "react";
import { getAllProducts } from "@/lib/product";
import { useParams } from "react-router"

const ShopPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllProducts(category)
      .then(data => {
        setProducts(data);
      })
      .catch(error => {
        setError(error.message);
      })
      .finally(() => setIsLoading(false));
  }, [category]);

  return (
    <main>
      <h1>Shop Page</h1>
      <p>Category: {category}</p>
      <div>{isLoading ? <p>Loading products...</p> : <p>Products loaded</p>}</div>
      <div>{error && <p>Error: {error}</p>}</div>
      <h2>Products</h2>
      <div>{JSON.stringify(products)}</div>
    </main>
  )
}

export default ShopPage
