const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass


/////////////////////////////// Main Validators
function bodyDataHas(propertyName){
    return function (req,res,next) {
        const { data = {} } = req.body
        if (!data[propertyName]) {
            return next({
                status: 400,
                message: `Order must include a ${propertyName}`
            });
        }
            return next();   
    }
}

function validateDishes(req,res,next){
const {data: {dishes} = {}} = req.body
if (dishes.length === 0 || !Array.isArray(dishes)) {
    return next({
        status: 400,
        message: `Order must include at least one dish.`
    });
} 
    return next();
}


function quantityExists(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const index = dishes.findIndex(
    (dish) =>
      !dish.quantity || typeof dish.quantity != "number" || dish.quantity <= 0
  );
  if (index >= 0) {
    next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0`,
    });
  }
  return next();
}

function quantityIsNumber(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const index = dishes.findIndex((dish) => isNaN(dish.quantity));
  if (index >= 0) {
    next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0`,
    });
  }
  return next();
}


////////////////////////////////////////// Update Validators

function orderExists(req,res,next){
const {orderId} = req.params
const foundOrder = orders.find((order)=>order.id === orderId)
if (!foundOrder) {
    return next({
        status: 404,
        message: `Order not found: ${orderId}.`
    });
}
    res.locals.order = foundOrder
    return next();
}

function statusCheck(req,res,next){
    const { data: { status } = {} } = req.body;
    if (!status || status === "" || status === "invalid") {
      next({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
      });
    }
    if (status === "delivered") {
      next({ status: 400, message: `A delivered order cannot be changed` });
    }
    return next();
}


function deleteValidator(req,res,next){
const { order } = res.locals;
if (order.status === "pending") {
    return next();
} 
    return next({
    status: 400,
    message: `An order cannot be deleted unless it is pending`,
  })
}

/////////////////////////////// CRUD

function create(req,res,next){
const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body
const newId = nextId();
const newOrder = {
    id: newId,
    deliverTo,
    mobileNumber,
    status,
    dishes
}
orders.push(newOrder)
res.status(201).json({data: newOrder})
}

function list(req,res,next){
res.json({data: orders})
}

function read(req,res,next){
const {orderId} = req.params
const foundOrder = orders.find((order)=> order.id === orderId)
res.json({data: foundOrder})
}

function update(req,res,next){
const {orderId} = req.params
const {data: {id, deliverTo, mobileNumber, status, dishes} = {}} = req.body
if (!id || orderId === id) {
    const updatedOrder = {
        id: orderId,
        deliverTo,
        mobileNumber,
        status,
        dishes,
    }
res.json({data: updatedOrder})
}
    next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, route: ${orderId}`,
      });
}

function destroy(req,res,next){
const {orderId} = req.params
const index = orders.findIndex((order)=> order.id === orderId)
if (index >= 0) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}

module.exports = {
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    validateDishes,
    quantityExists,
    quantityIsNumber,
    create,
  ],
  list,
  read: [orderExists, read],
  update: [
    orderExists,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("status"),
    bodyDataHas("dishes"),
    validateDishes,
    quantityExists,
    quantityIsNumber,
    statusCheck,
    update,
  ],
  delete: [orderExists, deleteValidator, destroy],
};