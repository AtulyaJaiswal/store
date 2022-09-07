import "./App.css";
import { useEffect, useState } from "react";
import Header from "./component/layout/Header/Header.js";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WebFont from "webfontloader";
import React from "react";
import Footer from "./component/layout/Footer/Footer";
import Home from "./component/Home/Home";
import ProductDetails from "./component/Product/ProductDetails";
import Products from "./component/Product/Products";
import Search from "./component/Product/Search";
import LoginSignUp from "./component/User/LoginSignUp";
import store from "./Store";
import { loadUser } from "./actions/userAction";
import UserOptions from "./component/layout/Header/UserOptions";
import { useSelector } from "react-redux";
import Profile from "./component/User/Profile";
import ProtectedRoute from "./component/Route/ProtectedRoute";
import UpdateProfile from "./component/User/UpdateProfile";
import UpdatePassword from "./component/User/UpdatePassword";
import ForgotPassword from "./component/User/ForgotPassword";
import ResetPassword from "./component/User/ResetPassword";
import Cart from "./component/Cart/Cart";
import Shipping from "./component/Cart/Shipping";
import ConfirmOrder from "./component/Cart/ConfirmOrder";
import axios from "axios";
import Payment from "./component/Cart/Payment";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import OrderSuccess from "./component/Cart/OrderSuccess";
import MyOrders from "./component/Order/MyOrders.js";
import OrderDetails from "./component/Order/OrderDetails";
import Dashboard from "./component/Admin/Dashboard.js";
import ProductList from "./component/Admin/ProductList.js";
import NewProduct from "./component/Admin/NewProduct";
import UpdateProduct from "./component/Admin/UpdateProduct";
import OrderList from "./component/Admin/OrderList";
import ProcessOrder from "./component/Admin/ProcessOrder";
import UsersList from "./component/Admin/UsersList";
import UpdateUser from "./component/Admin/UpdateUser";
import ProductReviews from "./component/Admin/ProductReviews";
import Contact from "./component/layout/Contact/Contact";
import About from "./component/layout/About/About";
import NotFound from "./component/layout/NotFound/NotFound";

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.user);

  const [stripeApiKey, setStripeApiKey] = useState("");

  async function getStripeApiKey() {
    const { data } = await axios.get("/api/v1/stripeApiKey");
    console.log(data);
    setStripeApiKey(data.stripeApiKey);
  }

  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Roboto", "Droid Sans", "Chilanka"],
      },
    });

    store.dispatch(loadUser());

    getStripeApiKey();
  }, []);

  //Right click nii hoga page par
  // window.addEventListener("contextmenu", (e) => e.preventDefault());

  return (
    <Router>
      <Header />

      {isAuthenticated && <UserOptions user={user} />}

      {stripeApiKey && (
        <Elements stripe={loadStripe(stripeApiKey)}>
          <Routes>
            <Route path="/process/payment" element={<ProtectedRoute Component={Payment}/>}/>
          </Routes>
        </Elements>
      )}

      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/product/:id" element={<ProductDetails/>} />

        <Route path="/products" element={<Products/>} />

        <Route path="/products/:keyword" element={<Products/>} />

        <Route path="/search" element={<Search/>} />

        <Route path="/contact" element={<Contact/>} />

        <Route path="/about" element={<About/>} />

        <Route path="/account" element={<ProtectedRoute Component={Profile}/>}/>

        <Route path="/me/update" element={<ProtectedRoute Component={UpdateProfile}/>}/>

        <Route path="/password/update" element={<ProtectedRoute Component={UpdatePassword}/>}/>

        <Route path="/password/forgot" element={<ForgotPassword/>} />

        <Route path="/password/reset/:token" element={<ResetPassword/>} />

        <Route path="/login" element={<LoginSignUp/>} />

        <Route path="/cart" element={<Cart/>} />

        <Route path="/shipping" element={<ProtectedRoute Component={Shipping}/>}/>

        <Route path="/order/:id" element={<ProtectedRoute Component={OrderDetails}/>}/>

        <Route path="/order/confirm" element={<ProtectedRoute Component={ConfirmOrder}/>}/>

        <Route path="/orders" element={<ProtectedRoute Component={MyOrders}/>}/>

        <Route path="/success" element={<ProtectedRoute Component={OrderSuccess}/>}/>

        <Route path="/admin/dashboard" element={<ProtectedRoute isAdmin={true} Component={Dashboard}/>}/>

        <Route path="/admin/order/:id" element={<ProtectedRoute isAdmin={true} Component={ProcessOrder}/>}/>

        <Route path="/admin/orders" element={<ProtectedRoute isAdmin={true} Component={OrderList}/>}/>

        <Route path="/admin/product/:id" element={<ProtectedRoute isAdmin={true} Component={UpdateProduct}/>}/>

        <Route path="/admin/product" element={<ProtectedRoute isAdmin={true} Component={NewProduct}/>}/>

        <Route path="/admin/products" element={<ProtectedRoute isAdmin={true} Component={ProductList}/>}/>

        <Route path="/admin/reviews" element={<ProtectedRoute isAdmin={true} Component={ProductReviews}/>}/>

        <Route path="/admin/user/:id" element={<ProtectedRoute isAdmin={true} Component={UpdateUser}/>}/>

        <Route path="/admin/users" element={<ProtectedRoute isAdmin={true} Component={UsersList}/>}/>

        <Route path="*"
          element={
            window.location.pathname === "/process/payment" ? null : <NotFound/>
          }
          //condition lgaye as /process/payment bahar hai routes ke to not found overwrite kar jaiga
        />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;