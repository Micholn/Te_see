const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');
const ErrorHandler = require('../../utils/errrorHandler');
const asyncErrorHandler = require('../helpers/asyncErrorHandler');

exports.isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {

    const { token } = req.cookes;

    if (!token) {
        return next(new ErrorHandler("Please Login to Access"))
    }
})