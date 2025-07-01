import Navigation from "@/components/Navigation"
import { Outlet } from "react-router"

const RootLayout = () => {
  return (
    <>
      {/* <Navigation /> */}
      <Outlet />
    </>
  )
}

export default RootLayout