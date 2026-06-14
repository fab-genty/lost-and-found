import App from "./App";
import Home from "./pages/home/Home";
import Register from "./pages/register/Register";
import Login from "./pages/login/Login";
import DashboardLayout from "./dashboard/DashboardLayout";
import Dashboard from "./dashboard/Dashboard";
import FoundItemsManagement from "./dashboard/pages/FoundItemsManagement";
import LostItemsManagement from "./dashboard/pages/LostItemsManagement";
import ClaimsManagement from "./dashboard/pages/ClaimsManagement";
import UsersManagement from "./dashboard/pages/UsersManagement";
import CategoriesManagement from "./dashboard/pages/CategoriesManagement";
import Settings from "./dashboard/pages/Settings";
import MyFoundItems from "./dashboard/myFoundItems/MyFoundItems";
import MyLostItems from "./dashboard/myLostItems/MyLostItems";
import MyClaimReqPage from "./pages/myClaimRequest/MyClaimReqPage";
import { ObjetsPage } from "./pages/objets/ObjetsPage";
import { ObjetDetail } from "./pages/objets/ObjetDetail";
import { ObjetSignaler } from "./pages/objets/ObjetSignaler";
import { AnimauxPage } from "./pages/animaux/AnimauxPage";
import { AnimalDetail } from "./pages/animaux/AnimalDetail";
import { AnimalSignaler } from "./pages/animaux/AnimalSignaler";
import { PersonnesPage } from "./pages/personnes/PersonnesPage";
import { PersonneDetail } from "./pages/personnes/PersonneDetail";
import { PersonneSignaler } from "./pages/personnes/PersonneSignaler";
import { PersonneVu } from "./pages/personnes/PersonneVu";

export const appRoutes = [
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/objets", element: <ObjetsPage /> },
      { path: "/objets/signaler", element: <ObjetSignaler /> },
      { path: "/objets/:id", element: <ObjetDetail /> },
      { path: "/animaux", element: <AnimauxPage /> },
      { path: "/animaux/signaler", element: <AnimalSignaler /> },
      { path: "/animaux/:id", element: <AnimalDetail /> },
      { path: "/personnes", element: <PersonnesPage /> },
      { path: "/personnes/signaler", element: <PersonneSignaler /> },
      { path: "/personnes/:id", element: <PersonneDetail /> },
      { path: "/personnes/:id/vu", element: <PersonneVu /> },
      { path: "/a-propos", element: <Home /> },
      { path: "/myClaimRequest", element: <MyClaimReqPage /> },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/found-items",
    element: (
      <DashboardLayout>
        <FoundItemsManagement />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/lost-items",
    element: (
      <DashboardLayout>
        <LostItemsManagement />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/claims",
    element: (
      <DashboardLayout>
        <ClaimsManagement />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/users",
    element: (
      <DashboardLayout>
        <UsersManagement />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/categories",
    element: (
      <DashboardLayout>
        <CategoriesManagement />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/settings",
    element: (
      <DashboardLayout>
        <Settings />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/myFoundItems",
    element: (
      <DashboardLayout>
        <MyFoundItems />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/myLostItems",
    element: (
      <DashboardLayout>
        <MyLostItems />
      </DashboardLayout>
    ),
  },
  {
    path: "/dashboard/myClaimRequest",
    element: (
      <DashboardLayout>
        <MyClaimReqPage />
      </DashboardLayout>
    ),
  },
];
