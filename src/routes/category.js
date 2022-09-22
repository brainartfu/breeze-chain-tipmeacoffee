const express = require('express')
const axios = require('axios')
const moment = require('moment')
const helper = require('./helper')
const breej = require('breej')
const fetchTags = helper.getTags

async function catgPage(req, res, next) 
{
  	let catg = req.params.catg; 
  	let thisCategory = catg.charAt(0).toUpperCase() + catg.slice(1);
  	if(categoryList.includes(thisCategory)){
	  	let catg_title = catg.charAt(0).toUpperCase() + catg.slice(1);
	  	res.locals.title = catg_title+ " News - Latest "+ catg +" updates shared on TipMeACoffee";
	  	res.locals.description = "Latest "+ catg +" updates shared on TipMeACoffee Get latest "+ catg +" News on TipMeACoffee. Share to earn with TipMeACoffee social media.";
	  	let postsAPI = await axios.get(api_url+`/new?category=${catg}`); 
	  	let nTags = await fetchTags();
	  	if (postsAPI.data.length > 0) _finalData = await Promise.all(postsAPI.data.map(async (post) => { let userAPI = await axios.get(api_url+`/account/${post.author}`); return { ...post, user: userAPI.data.json || false } })); else _finalData = postsAPI.data
	  	if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='') 
	  	// if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
	  	{
	  		loguser = req.cookies.breeze_username; 
	  		const actAPI = await getAccount(loguser)
    		if(actAPI==null){ return res.status(404).redirect('/404') }else{ userAPI = actAPI } 
	  		const notice = await getNotices(loguser); if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count } 
	  		res.render('category', { articles: _finalData, moment: moment, trendingTags: nTags, calledCatg: catg, loguser: loguser, acct: userAPI, category: categoryList, notices: notices }) 
	  	} else { 
	  		loguser = ""; 
	  		res.render('category', { articles: _finalData, moment: moment, trendingTags: nTags, calledCatg: catg, loguser: loguser, category: categoryList }) 
	  	}
	}else {return res.status(404).redirect('/404');}
}

async function tagPage(req, res, next) 
{
	let tag = req.params.tag;
	res.locals.title = "#"+ tag+" Updates. Latest "+ tag +" news shared on Tip";
	res.locals.description = "Looking for latest news and updates for #"+ tag +"? Now get all updates related to #"+ tag +" on TipMeACoffee.";
	let postsAPI = await axios.get(api_url+`/new?tag=${tag}`); 
	let nTags = await fetchTags(); 
	let _finalData = [];
	if (postsAPI.data.length > 0) _finalData = await Promise.all(postsAPI.data.map(async (post) => { let userAPI = await axios.get(api_url+`/account/${post.author}`); return { ...post, user: userAPI.data.json || false } }));
	if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  	{
	  	loguser = req.cookies.breeze_username; 
	  	const actAPI = await getAccount(loguser); if(actAPI==null){ return res.status(404).redirect('/404') }else{ userAPI = actAPI }
  		const notice = await getNotices(loguser); if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }   
  		res.render('tags', { articles: _finalData, moment: moment, trendingTags: nTags, calledTag: tag, loguser: loguser, acct: userAPI, category: categoryList, notices: notices }) 
	} else { 
		loguser = ""; res.render('tags', { articles: _finalData, moment: moment, trendingTags: nTags, calledTag: tag, loguser: loguser, category: categoryList }) 
	}
}


async function followCatg(req, res, next) 
{
  	if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
    { 
    	let post = req.body;let loguser = req.cookies.breeze_username;
    	let newTx = { type: 26, data: { category: post.catgName } };
    	let wifKey = await nkey(req.cookies.token);
	    breej.getAccount(loguser, async function (error, account) {
	      	if (breej.privToPub(wifKey) !== account.pub) { return res.send({ error: true, message: 'Not a valid user' })
	      	} else {
	      		newTx = breej.sign(wifKey, loguser, newTx)
	          	breej.sendTransaction(newTx, function (err, response) {
	          	if (err === null) { return res.send({ error: false }); } else { return res.send({ error: true, message: err['error'] }); }
	        })
	      }
	    })
  	} else { return res.send({ error: true, message: 'phew.. User Validation Fails' }); }
}

async function unfollowCatg(req, res, next) 
{
  	if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
    { 
    	let post = req.body; let loguser = req.cookies.breeze_username;
    	let newTx = { type: 27, data: { category: post.catgName.toLowerCase() } };let wifKey = await nkey(req.cookies.token);
	    breej.getAccount(loguser, async function (error, account) {
	      	if (breej.privToPub(wifKey) !== account.pub) { return res.send({ error: true, message: 'Not a valid user' })
	      	} else { 
	      		newTx = breej.sign(wifKey, loguser, newTx);
		        breej.sendTransaction(newTx, function (err, response) {
		          if (err === null) { return res.send({ error: false }); } else { return res.send({ error: true, message: err['error'] }); }
		        })
	      	}
	    })
  	} else { return res.send({ error: true, message: 'phew.. User Validation Fails' }); }
}

module.exports = { catgPage, tagPage, followCatg, unfollowCatg }