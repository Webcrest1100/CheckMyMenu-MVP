// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import Coming from "./pages/Coming";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import MenuOne from "./pages/Menuone";
// import Menu from "./pages/Menu";
// import Template1 from "./pages/Template1";
// import Template2 from "./pages/Template2";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/coming" element={<Coming />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password/:token" element={<ResetPassword />} />
//         <Route path="/menu" element={<Menu />} />
//         {/* <Route path="/Template1" element={<Template1 />} /> */}

//         <Route path="/view/:restaurantId/Template1/:itemId" element={<Template1 />} />
//         <Route path="/template2" element={<Template2 />} />
//         {/* <Route path="/view/:restaurantId/Template1/:itemId"/> */}
//         <Route path="/view/:restaurantId/menu/:itemId" element={<MenuOne />} />

//       </Routes>
//     </BrowserRouter>
//   );
// }

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RequireAdmin from "./pages/RequireAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Coming from "./pages/Coming";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MenuOne from "./pages/Menuone";
import Menu from "./pages/Menu";
import Template1 from "./pages/Template1";
import Template2 from "./pages/Template2";
import Template3 from "./pages/Template3";
import Template4 from "./pages/Template4";
import Template5 from "./pages/Template5";
import Template6 from "./pages/Template6";
import Template7 from "./pages/Template7";
import Template8 from "./pages/Template8";
import Template9 from "./pages/Template9";
import Template10 from "./pages/Template10";
import UploadLogoPage from "./pages/UploadLogoPage";
import Redirect from "./pages/Redirect";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              {" "}
              <AdminDashboard />{" "}
            </RequireAdmin>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Redirect />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/coming" element={<Coming />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/upload-logo" element={<UploadLogoPage />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/template1" element={<Template1 />} />
        <Route path="/template2" element={<Template2 />} />
        <Route path="/template3" element={<Template3 />} />
        <Route path="/template4" element={<Template4 />} />
        <Route path="/template5" element={<Template5 />} />
        <Route path="/template6" element={<Template6 />} />
        <Route path="/template7" element={<Template7 />} />
        <Route path="/template8" element={<Template8 />} />
        <Route path="/template9" element={<Template9 />} />
        <Route path="/template10" element={<Template10 />} />
        <Route
          path="/view/:restaurantId/template1/:itemId"
          element={<Template1 />}
        />
        <Route path="/view/:restaurantId/menu/:itemId" element={<MenuOne />} />
        <Route path="/view/:restaurantId/menu" element={<Menu />} />
        <Route path="/view/:restaurantId/template1" element={<Template1 />} />
        <Route path="/view/:restaurantId/template2" element={<Template2 />} />
        <Route path="/view/:restaurantId/template3" element={<Template3 />} />
        <Route path="/view/:restaurantId/template4" element={<Template4 />} />
        <Route path="/view/:restaurantId/template5" element={<Template5 />} />
        <Route path="/view/:restaurantId/template6" element={<Template6 />} />
        <Route path="/view/:restaurantId/template7" element={<Template7 />} />
        <Route path="/view/:restaurantId/template8" element={<Template8 />} />
        <Route path="/view/:restaurantId/template9" element={<Template9 />} />
        <Route path="/view/:restaurantId/template10" element={<Template10 />} />
      </Routes>
    </BrowserRouter>
  );
}
