import React, { Fragment, useEffect } from "react";
import "./Home.css";
import ProductCard from "./ProductCard.js";
import MetaData from "../layout/MetaData";
import { getProduct } from "../../actions/productAction";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../layout/Loader/Loader";
import {toast} from "react-toastify";

const Home = () => {
  const dispatch = useDispatch();
  //USE SELECTOR IS USED TO FETCH DATA FROM STORE
  const { loading, error, products } = useSelector((state) => state.products);

  useEffect(() => {
    if (error) {
      return toast.error(error);
      // dispatch(clearErrors());
    }
    dispatch(getProduct());
  }, [dispatch,
     error,
    ]);
    

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title="E-COMMERCE" />

          <div className="banner">
            <p>Welcome to E-Commerce</p>
            <h1>FIND AMAZING PRODUCTS BELOW</h1>

            {/* <a href="#container">
              <button>
                Scroll <MouseIcon/>
              </button>
            </a> */}
          </div>

          <h2 className="homeHeading">Featured Products</h2>

          <div className="container" id="container">
            {products &&
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}   
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Home;