//Create and send token and save in the cookie 
const sendToken = (user, statusCode, res) => {
    //Create Jwt token
    const token = user.getJwtToken();

    //Options for cookie 
    const options = {
        expires: new Date(
            Date.now() + 
        )
    }
}