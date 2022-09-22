const breej = require('breej')
const axios = require('axios')
const moment = require('moment')
const isImageURL = require('image-url-validator').default;
const { getBaseUrl } = require("get-base-url")
const isUrl = require("is-url")
const helper = require('./helper')
const fetchTags = helper.getTags
const { limit, substr } = require('stringz')

async function profile(req, res) {res.locals.page = "profile";
	let name = req.params.name;
	if(name && name !==''){
		const actAPI = await getAccount(name)
    	if(actAPI==null){ 
    		return res.status(404).redirect('/404') 
    	}else{ 
    		uAPI = actAPI 
			res.locals.baseUrl=getBaseUrl;
    		res.locals.title= name.charAt(0).toUpperCase() + name.slice(1) +' Profile - TipMeACoffee'; 
    		let nTags = await fetchTags();
			const blogAPI = await axios.get(api_url+`/blog/${name}`);
			const likesAPI = await axios.get(api_url+`/votes/${name}`); 
    		if (blogAPI.data.length > 0) _finalData = await Promise.all(blogAPI.data.map(async (post) => { let userAPI = await axios.get(api_url+`/account/${post.author}`); return { ...post, user: userAPI.data.json || false } }));else _finalData = blogAPI.data
    		if (likesAPI.data.length > 0) _finalDataL = await Promise.all(likesAPI.data.map(async (post) => { let userLAPI = await axios.get(api_url+`/account/${post.author}`); return { ...post, user: userLAPI.data.json || false } }));else _finalDataL = likesAPI.data
			const vp = breej.votingPower(uAPI)
    		const bw = breej.bandwidth(uAPI)
    		if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
				{
    			loguser = req.cookies.breeze_username;
    			const notice = await getNotices(loguser)
				if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }
    			res.render('profile', {
					loguser: loguser, trendingTags: nTags, acct: uAPI, category: categoryList, notices: notices, moment: moment,user: uAPI,bw: bw, vp: vp,articles: _finalData, likes: _finalDataL
				})
    		} else {
				loguser='';
				res.render('profile', {
					loguser: loguser, trendingTags: nTags, category: categoryList, moment: moment,user: uAPI,bw: bw, vp: vp,articles: _finalData, likes: _finalDataL
				})
			}
    	}
	} else { return res.status(404).redirect('/404')}
}

async function profileUpdate(req, res) {
	if(req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  	{
  		let post = req.body; let loguser = req.cookies.breeze_username;
    	if(post.acc_img){ let avatarImg=await isImageURL(post.acc_img);
	      	if(avatarImg){
		        if(post.acc_cover_img){ let profCover=await isImageURL(post.acc_cover_img); if(!profCover){return res.send({error: true, message: 'Not a valid profile cover image url'});} }
	        	if(post.acc_website){if(!isUrl(post.acc_website)){return res.send({error: true, message: 'Not a valid web url'}); } }
	        	let about=post.acc_about;if(post.acc_about && post.acc_about.length>50){about=limit(post.acc_about, 50, '')};
		        let wifKey = await nkey(req.cookies.token);let content = { about: about, website: post.acc_website, location: post.acc_location, cover_image: post.acc_cover_img, avatar: post.acc_img };
		        breej.getAccount(loguser, async function (error, account) {
		            if (breej.privToPub(wifKey) !== account.pub) { return res.send({ error: true }) } else {
		              	let newTx = { type: 6, data: { json: { profile: content } } };
		              	newTx = breej.sign(wifKey, loguser, newTx)
		              	breej.sendTransaction(newTx, async function (err, response) { if (err === null) { return res.send({ error: false }); } else { return res.send({ error: true, message: err['error'] }); }  })
		            }
		        })
	      	} else {return res.send({error: true, message: 'Not a valid avatar image url'})}
    	} else {return res.send({error: true, message: 'Add valid avatar image'}) }
  	} else { return res.send({ error: true, message: 'phew.. User Validation Fails' }); }
}

async function follow(req, res) {
  	if(req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  	{
  		let user = req.cookies.breeze_username; let token = req.cookies.token;
		breej.getAccount(user, async function (error, account) {
			if(error){return res.send({ error: true, message: 'issue in user authentication' }) }
			if(account && account.name == user){
			  	let post = req.body;let wifKey = await nkey(token);
			  	if (breej.privToPub(wifKey) !== account.pub) 
			  	{
			  		return res.send({ error: true, message: 'Not a valid user' })
				} else { 
					let fTx = { type: 7, data: { target: post.followName } }; 
					newTx = breej.sign(wifKey, user, fTx);
					breej.sendTransaction(newTx, function (err, response) {
						if (err === null) { return res.send({ error: false }); } else { return res.send({ error: true, message: err['error'] }); }
					})
				}
			} else { return res.send({ error: true, message: 'phew.. user authentication fails' }); } 
		})
  	} else { return res.send({ error: true, message: 'phew.. You must be login. account validation fails' }); }
}


async function unfollow(req, res) {
	if(req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  	{
		let post = req.body; let loguser = req.cookies.breeze_username; let token = req.cookies.token;
    	let newTx = { type: 8, data: { target: post.unfollowName } }; 
    	let wifKey = await nkey(token);
	    breej.getAccount(loguser, async function (error, account) {
	    	if(error){return res.send({ error: true, message: 'issue in user authentication' }) }
	    	if(account && account.name == loguser)
	    	{
		      	if (breej.privToPub(wifKey) !== account.pub) 
		      	{ 
		      		return res.send({ error: true, message: 'Not a valid user' })
		      	} else {
		      		newTx = breej.sign(wifKey, loguser, newTx);
	        		breej.sendTransaction(newTx, function (err, response) {
	          			if (err === null) 
	          			{ 
	          				return res.send({ error: false }); 
	          			} else { 
	          				return res.send({ error: true, message: err['error'] }); 
	          			}
	        		})
	        	}
	        } else { return res.send({ error: true, message: 'phew.. user authentication fails' }); } 
	    })

	} else { return res.send({ error: true, message: 'phew.. You must be login. account validation fails' }); }
}

module.exports = { profile, profileUpdate, follow, unfollow }