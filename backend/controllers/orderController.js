const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

//CREATE NEW ORDER
exports.newOrder = catchAsyncErrors(async(req,res,next) => {

    const{shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice} = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    res.status(201).json({
        success: true,
        order,
    });
});

//GET SINGLE ORDER
exports.getSingleOrder = catchAsyncErrors(async(req,res,next) => {

    const order = await Order.findById(req.params.id).populate("user","name email");
    //POPULATE:- user field se id lega aur database me jaakr uska name email nikaal laiga

    if(!order){
        return next(new ErrorHandler("Order not found with this ID", 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
});

//GET LOGGED IN USER ORDER
exports.myOrders = catchAsyncErrors(async(req,res,next) => {

    const orders = await Order.find({user: req.user._id});

    res.status(200).json({
        success: true,
        orders,
    });
});

//GET ALL ORDERS -ADMIN
exports.getAllOrders = catchAsyncErrors(async(req,res,next) => {

    const orders = await Order.find();

    let totalAmount=0;

    orders.forEach(order => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
});

//UPDATE ORDER STATUS -ADMIN
exports.updateOrder = catchAsyncErrors(async(req,res,next) => {

    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found with this ID",404))
    }

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler("You have delivered this order", 400));
    }

    if(req.body.status === "Shipped"){
        order.orderItems.forEach(async(ord) => {
            await updateStock(ord.product, ord.quantity);
        });
    }

    order.orderStatus = req.body.status;

    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now();
    }

    await order.save({validateBeforeSave: false});

    res.status(200).json({
        success: true,
    });
});
async function updateStock(id, quantity) {

    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({validateBeforeSave: false});
}

//DELETE ORDER -ADMIN
exports.deleteOrder = catchAsyncErrors(async(req,res,next) => {

    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found with this ID",404))
    }

    await order.remove();

    res.status(200).json({
        success: true,
        order,
    });
});
