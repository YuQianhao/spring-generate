import {createMemoryRouter} from "react-router-dom";
import WelcomePage from "./pages/Welcome";
import NewProjectPage from "./pages/NewProject";
import TableEditPage from "./pages/TableEdit";

const MainRoutes = createMemoryRouter([
    {
        path: '/',
        element: <WelcomePage/>
    },
    {
        path: '/new-project',
        element: <NewProjectPage/>
    },
    {
        path: '/table-edit',
        element: <TableEditPage/>
    }
])

export default MainRoutes;