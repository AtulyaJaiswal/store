const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");

//CREATE PRODUCT--ADMIN
//catchAsyncError basically try catch har baar na likhna pde isliye ek class hai
exports.createProduct = catchAsyncErrors(async (req,res,next) => {

    let images=[];

    if(typeof req.body.images==="string"){
        images.push(req.body.images);
    }
    else{
        images=req.body.images;
    }

    const imagesLinks=[];

    for(let i=0; i<images.length; i++){
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    req.body.images=imagesLinks;
    req.body.user=req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    })
});


//GET ALL PRODUCTS
exports.getAllProducts = catchAsyncErrors(async (req,res) =>{

    const resultPerPage=8;

    const productsCount = await Product.countDocuments();
    
    const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
    //  yha se hta rhe as filter hone ke baad fir no of products le rhe taaki pagination waala maintain kar sake
    //req.query user se jo keyword milega vo laakr de dega
    //req.query.keyword hota but .keyword hum dusri jagah se access kr lenge

    // let products = await apiFeature.query;

    // let filteredProductsCount = products.length;

    // apiFeature.pagination(resultPerPage);

    const products = await apiFeature.query; //same class return kiye udhar isliye uske function mil gye saare
    // console.log(products);
    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        // filteredProductsCount,
    });
});

//GET ALL PRODUCTS --ADMIN
exports.getAdminProducts = catchAsyncErrors(async (req,res) =>{

    const products = await Product.find(); //same class return kiye udhar isliye uske function mil gye saare
    res.status(200).json({
        success: true,
        products,
    });
});


//GET PRODUCT DETAILS
exports.getProductDetails = catchAsyncErrors(async(req,res,next) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        product
    })
});


//UPDATE PRODUCTS -- ADMIN
exports.updateProduct = catchAsyncErrors(async (req,res,next) => {
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }

    //Images Updating
    let images=[];

    if(typeof req.body.images==="string"){
        images.push(req.body.images);
    }
    else{
        images=req.body.images;
    }

    if(images !== undefined){
        //Deleting Images from cloudinary
        for(let i=0; i<product.images.length; i++){
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLinks=[];

        for(let i=0; i<images.length; i++){
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        req.body.images=imagesLinks;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        userFindAndModify: false 
    })
    res.status(200).json({
        success: true,
        product
    })
});

//DELETE PRODUCT --ADMIN
exports.deleteProduct = catchAsyncErrors(async(req,res,next) => {
    const product  = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }

    //Deleting Images from cloudinary
    for(let i=0; i<product.images.length; i++){
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.remove();

    res.status(200).json({
        success:true,
        message: "Product deleted successfully"
    });
});

//CREATE NEW REVIEW/UPDATE REVIEW
exports.createProductReview = catchAsyncErrors(async(req,res,next) => {

    const {rating, comment, productId} = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment, 
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find((rev)=>rev.user.toString()===req.user._id.toString());

    if(isReviewed){
        product.reviews.forEach((rev)=>{
            if(rev.user.toString() === req.user._id.toString())
                rev.rating=rating, 
                rev.comment=comment
        });
    }
    else{
        product.reviews.push(review);
        product.numOFReviews = product.reviews.length;
    }

    let avg=0;
    product.reviews.forEach((rev) => {
        avg+=rev.rating;
    }) 
    product.ratings = avg / product.reviews.length;

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true,
    });
});

//GET ALL REVIEWS OF A PRODUCT
exports.getProductReview = catchAsyncErrors(async (req,res,next) => {

    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHandler("Product not found", 400));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

//DELETE REVIEW
exports.deleteReview = catchAsyncErrors(async (req,res,next) => {

    const product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler("Product not found", 400));
    }

    //reviews me vo reviews store kr rhe jo delete nii krna
    const reviews = product.reviews.filter((rev)=> rev._id.toString() !== req.query.id.toString());

    let avg=0;

    reviews.forEach((rev) => {
        avg+=rev.rating;
    });

    let ratings=0;
    
    if(reviews.length!==0){
        ratings = avg / reviews.length;
    }

    const numOFReviews=reviews.length;;
    

    //JB SINGLE REVIEW HAI AUR VO BHI DELETE KR DO TO ERROR AA RAA
    //SOLVED MAY BE CHECK

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOFReviews,
    },{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

