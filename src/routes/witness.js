const express = require('express')
const breej = require('breej')
const axios = require('axios')
const helper = require('./helper')
const fetchTags = helper.getTags

async function witnesses(req, res, next) 
{
	res.locals.title = "Breeze Witnesses";
	res.locals.page = "witness";
	let nTags = await fetchTags(); 
	let witnessAPI = await axios.get(api_url+`/rank/witnesses`); 
	let approved = [];
	if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
    { 
  		loguser = req.cookies.breeze_username; 
  		const userAPI = await getAccount(loguser)
  		const notice = await getNotices(loguser)
    	if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }
  		let approved = userAPI.approves; res.render('witnesses', { witnesses: witnessAPI.data, approved: approved, trendingTags: nTags, loguser: loguser, acct: userAPI, category: categoryList, notices: notices }); 
	} else { 
		loguser = ""; res.render('witnesses', { witnesses: witnessAPI.data, approved: approved, trendingTags: nTags, loguser: loguser, category: categoryList }); 
	}
}

async function witup(req, res, next) 
{
	if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
    { 
	    let post = req.body;
	    let voter = req.cookies.breeze_username;
	    let wifKey = await nkey(req.cookies.token);
	    let newTx = { type: 1, data: { target: post.nodeName } }; 
	    breej.getAccount(voter, async function (error, account) {
	    	if (breej.privToPub(wifKey) !== account.pub) { return res.send({ error: true, message: 'Not a valid user' }) }
	        newTx = breej.sign(wifKey, voter, newTx)
	        breej.sendTransaction(newTx, async function (err, response) { 
	        	if (err === null) { 
	        		return res.send({ error: false }); 
	    		} else { 
	    			return res.send({ error: true, message: err['error'] }); 
				} 
			})
	    })
	} else { return res.send({ error: true, message: 'phew.. User Validation Fails' }); } 
}

async function witunup(req, res, next) 
{
	if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
    {
	    let post = req.body;
	    let voter = req.cookies.breeze_username;
	    let newTx = { type: 2, data: { target: post.nodeName } }
	    let wifKey = await nkey(req.cookies.token)
	    breej.getAccount(voter, async function (error, account) {
	    	if (breej.privToPub(wifKey) !== account.pub) { return res.send({ error: true, message: 'Not a valid user' }) }
	        newTx = breej.sign(wifKey, voter, newTx)
	        breej.sendTransaction(newTx, async function (err, response) {
	        	if (err === null) { 
	        		return res.send({ error: false }); 
	        	} else { 
	        		return res.send({ error: true, message: err['error'] })
	        	}
	        })
	      
	    })
	} else { return res.send({ error: true, message: 'phew.. User Validation Fails' }); } 
}

module.exports ={ witnesses, witup, witunup }