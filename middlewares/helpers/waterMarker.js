const Jimp = require('jimp');
module.exports = async (req, res, next) => {
    if (!req.files.length) {
        return next()
    }
    const options = {
        ratio: 0.6,
        opacity: 0.4,
        text: 'K I N D E E M', 
        textSize: Jimp.FONT_SANS_64_BLACK, 
    }
    const getDimensions = (H, W, h, w, ratio ) => {
        let hm, wm;
        if ((H / W) < (h / w)) { //GREATER HEIGHT
            hh = ratio * H;
            ww = hh / h * w;
        } else {        // GREATER WIDTH
            ww = ratio * W;
            hh = ww / w * h;
        }
        return [hh, ww];
    }
    let results = 
}