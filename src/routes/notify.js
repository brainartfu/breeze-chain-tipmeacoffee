const express = require('express')
const breej = require('breej')
const axios = require('axios')
const helper = require('./helper')
const fetchTags = helper.getTags

async function notifications(req, res, next) 
{
	if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
    { 
    	res.locals.page = "notifications"; 
    	const user = req.cookies.breeze_username;
    	const send_data = [];
    	const notice = await getNotices(user)
    	if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }
    	const actAPI = await getAccount(user)
    	if(actAPI==null){ return res.status(404).redirect('/404') }else{ userAPI = actAPI }
    	const historyAPI = await axios.get(api_url+`/history/${user}/0`);
    	let nTags = await fetchTags(); 
    	let temps = historyAPI.data;
    	temps.forEach(function (temp) { 
    		send_data.push(helper.data_process(temp)+ " " + "<a href='https://breezescan.io/#/tx/"+ temp.hash +"' target='_blank'><span class='trx_id'>" + temp.hash.substring(0,6) + "</span></a>"); 
    	})
    	res.render('notifications', { activities: send_data, acct: userAPI, trendingTags: nTags, loguser: user, category: categoryList, notices: notices })
  	} else { return res.redirect('/welcome');}
}

async function notify(req, res, next) 
{
	if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
    {
	    const loguser = req.cookies.breeze_username;
	    const notice = await getNotices(loguser)
		if(notice.count < 1){ return res.send({ error: true, message: 'No unread notification' })}
	    const timestamp = new Date().getTime();
	    let newTx = { type: 28, data: {} };
	    let wifKey = await nkey(req.cookies.token);
	    breej.getAccount(loguser, async function (error, account) {
	    	if (error) { return res.send({ error: true, message: 'Not a valid user' }); }
	    	if(account && account.name == loguser){
		      	if (breej.privToPub(wifKey) !== account.pub) { 
		      		return res.send({ error: true, message: 'Not a valid user' }) 
		      	} else {
			        newTx = breej.sign(wifKey, loguser, newTx)
			        breej.sendTransaction(newTx, async function (err, response) {
			          	if (err === null) { 
			          		return res.send({ error: false })
			          	} else { 
			          		return res.send({ error: true, message: err['error'] })
			          	}
			        })
		      	}
		    } else {return res.send({ error: true, message: 'user authentication fails' }) }
	    })
  	} else { return res.send({ error: true, message: 'phew.. User Validation Fails' }); } 
}

module.exports = { notifications, notify }