import React, { Fragment, useEffect, useState } from "react";
import "./Home.css";
import ProductCard from "./ProductCard.js";
import MetaData from "../layout/MetaData";
import { getProduct } from "../../actions/productAction";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../layout/Loader/Loader";
import {toast} from "react-toastify";
import { useParams } from "react-router-dom";
import Pagination from "../Pagination/Pagination";

const Home = () => {

  const { keyW, page:pageNum } = useParams();
  const dispatch = useDispatch();
  //USE SELECTOR IS USED TO FETCH DATA FROM STORE
  // const { loading, error, products } = useSelector((state) => state.products);
  const {
    products,
    loading,
    error,
    productsCount,
    resultPerPage,
    pages: totalPages,
  } = useSelector((state) => state.products);

  const pageNumber = pageNum || 1;
  const [page, setPage] = useState(pageNumber);
  const [pages, setPages] = useState(totalPages);
  const [price, setPrice] = useState([0, 25000]);
  const [category, setCategory] = useState("");
  const [ratings, setRatings] = useState(0);

  const keyword = keyW;

  useEffect(() => {
    if (error) {
      return toast.error(error);
      // dispatch(clearErrors());
    }

    dispatch(getProduct(keyword, page, price, category, ratings));
  }, [dispatch, keyword, page, price, category, ratings, error]);
    

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
          <div className="paginationBox">
              <Pagination 
                page={page} 
                pages={pages} 
                changePage={setPage} 
              />
            </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Home;