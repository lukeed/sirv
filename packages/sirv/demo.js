const fs = require('fs');
const path = require('path');
const sirv = require('.');

let key = fs.readFileSync('ssl/foobar.key');
let cert = fs.readFileSync('ssl/foobar.crt');
let dir = path.join(__dirname, 'public');

sirv(dir, { key, cert }).listen(3000, err => {
	if (err) throw err;
	console.log('> running');
})
