const Cart = require("../../models/Cart")
const Review = require("../../models/Review")
const Order = require("../../models/Order")
const Wjislist = require("../../models/Wishlist")

module.exports = async(product,user,type) => {
    let hasOnCart = null 
    let hasBought = null 
    let hasOnWishlist = null 
    let hasReviewed = null 
    
}