const fs = require("fs");

module.exports = files => {
    return Promise.all(
        files.map(
            new Promise((res, rej) => {
                try {
                    setTimeout(() => {
                        fs.unlink(file, err => {
                            if (err) throw err;
                            res();
                        })
                    })

                } catch (err) {
                    console.error(err);
                    rej(err);
                }
            })
        )
    );
}