const Review = require("../../models/Review")
module.exports = async(product,newStar) => {
    const product = req.product
    if (!product.isVerified && product.isDeleted) {
        return res.status(404).json({ error: 'Product not found'})
    }
    let stars = await Review.find({ product: product._id}).select('star');
    let fiveStars = 0, fourStars = 0, threeStars = 0, twoStars = 0, oneStars = 0;
    stars.forEach(s => {
        if (s.star === 5) fiveStars += 1
        if (s.star === 4) fourStars += 1
        if (s.star === 3) threeStars += 1
        if (s.star === 2)
    })
}
