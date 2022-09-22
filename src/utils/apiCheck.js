const fetch = require("node-fetch");
const breej = require('breej')

API_BREEZE_SCAN = 'https://api.breezechain.org';
API_BREEZE_CHAIN = "https://api.breezescan.io";

const apiCheck = (req, res, next) => {
	fetch(global.api_url)
	.then((resp) => {
        if(resp.status >= 500) {
            return Promise.reject("Network Error");
        }
		next();
	})
	.catch((err) => {
        console.log(err)
        global.api_url = global.api_url === API_BREEZE_CHAIN ? API_BREEZE_SCAN : API_BREEZE_CHAIN;
        breej.init({ api: global.api_url, bwGrowth: 36000000000, vpGrowth: 120000000000 })
		next();
	});	
} 
module.exports = { apiCheck };