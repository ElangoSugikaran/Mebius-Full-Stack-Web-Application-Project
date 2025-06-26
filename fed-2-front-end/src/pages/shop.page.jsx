import { useParams } from "react-router"

const ShopPage = () => {
  const params = useParams();

  return (
    <div>Shop Page - Category: {params.category}</div>
  )
}

export default ShopPage