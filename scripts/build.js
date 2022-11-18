const fs  = require('fs-extra');
const srcDir = `cert`;
const destDir = `.production/cert`;

fs.copy(srcDir, destDir, function (err) {
    if (err){
        console.log('An error occured while copying the folder.')
        return console.error(err)
    }
    console.log('Copy completed!')
});