const express = require('express')
const breej = require('breej')
const CryptoJS = require("crypto-js")
const axios = require('axios')
//const { fetchUser } = require('../utils/db')

async function upvote(req, res) {
	if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  	{
		let token = req.cookies.token; let voter = req.cookies.breeze_username; let post = req.body;
		//const user = await fetchUser(voter);
		//if(user?.status !== true){ return res.send({ error: true, message: 'Phew.. You are not a verified TMAC user. Get verified on TipMeACoffee Discord server' }); } 
		console.log(req.clientIp + ' voter is ' + voter)
		if(spammers.includes(voter)){return res.send({ error: true, message: 'You are not allowed to upvote due to spamming!' })}
		breej.getAccount(voter, async function (error, account) {
			if (error) { return res.send({ error: true, message: 'Issue in user authentication' }) }
			if(account && account.name == voter){
				let wifKey = await nkey(token);
				if (breej.privToPub(wifKey) !== account.pub) 
		        {
		        	return res.send({ error: true, message: 'Unable to validate user' })
		    	} else { 
		            let newTx = { type: 5, data: { link: post.postLink, author: post.author } };
		            newTx = breej.sign(wifKey, voter, newTx);
		            breej.sendTransaction(newTx, async function (err, response){ 
						if (err === null) 
						{
							let postIncomeAPI = await axios.get(api_url+`/content/${post.author}/${post.postLink}`); 
							let postIncome = postIncomeAPI.data.dist; let likes=postIncomeAPI.data.likes;
							return res.send({ error: false, income: postIncome, likes:likes }); 
						} else { 
							return res.send({ error: true, message: err['error'] }); 
						} 
					})
		    	}
			} else { return res.send({ error: true, message: 'phew.. account Validation fails' }); }
		})
	} else { return res.send({ error: true, message: 'phew.. User Validation Fails' }); }
}

module.exports = { upvote }