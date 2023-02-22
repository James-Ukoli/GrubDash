const { appendFile } = require("fs");
const path = require("path");


// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

/////////////                               Validation FUNCTIONS

function bodyDataHas(propertyName){
return function (req,res, next) {
    const {data = {}} = req.body
    if (data[propertyName]) {
        return next();
    } else {
        return next({
            status: 400,
            message: `Dish must include ${propertyName}`
        })
    }
}
}

function priceIsInteger(req, res, next){
const { data: {price} = {} } = req.body
if (price <= 0 || typeof price != "number") {
    return next({
        status: 400,
        message: "Dish must have a price that is an integer greater than 0"
    })
} else {
    return next()
}
}

function dishExists(req,res,next){
const {dishId} = req.params
const foundDish = dishes.find((dish)=>dish.id === dishId)
if (foundDish) {
    res.locals.dish = foundDish
    return next();
} else {
    return next ({
        status: 404,
        message: `Dish does not exist: ${dishId}`
    })
}
}

//////////////////                          ROUTE HANDLERS

function create(req, res, next) {
    const { data: {name, description, price, image_url} = {}} = req.body;
    const newId = nextId();
        const newDish = {
            id: newId,
            name,
            description,
            price,
            image_url
        }
        dishes.push(newDish)
        res.status(201).json({data: newDish})
    }
    

function list(req, res, next) {
    res.json({data: dishes})
}


function read(req,res,next){
const {dishId} = req.params
const foundDish = dishes.find((dish)=> dish.id === dishId)
res.json({data: foundDish})
}

function update(req,res,next){
const dish = res.locals.dish
const {dishId} = req.params
const { data: {id, name, description, price, image_url} = {}} = req.body
if (dishId === id || !id) {
    const updatedDish = {
        id: dishId,
        name,
        description,
        price,
        image_url
    }
res.json({data: updatedDish})
} else {
    return next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    })
}
}



module.exports = {
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    priceIsInteger,
    create,
  ],
  list,
  read: [dishExists, read],
  update: [
    dishExists,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    priceIsInteger,
    update,
  ],
};
