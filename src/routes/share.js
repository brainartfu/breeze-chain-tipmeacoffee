const axios = require('axios')
const helper = require('./helper')
const fetchTags = helper.getTags

async function newPost(req, res) {
	res.locals.page = "share";
	if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  	{
  		let user = req.cookies.breeze_username; 
		try
		{
			const actAPI = await axios.get(api_url+`/account/${user}`);
			const notice = await getNotices(user)
    		if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }
			let nTags = await fetchTags(); 
			res.render('share', { loguser: user, trendingTags: nTags, acct: actAPI.data, category: categoryList, notices: notices })
		} catch (e) {
			return res.send({ error: true, message: 'api does not work' })
		}
    } else { return res.redirect('/welcome'); }
}

module.exports = { newPost }