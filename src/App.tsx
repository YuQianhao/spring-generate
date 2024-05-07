import {RouterProvider} from "react-router-dom";
import MainRoutes from "./routes.tsx";

export default function App() {
    return <RouterProvider router={MainRoutes}/>
}