const Review = require("../../models/Review")
module.exports = async(product,newStar) => {
    const product = req.product
    if (!product.isVerified && product.isDeleted) {
        return resizeBy.status
    }
}
