const express = require('express')
const breej = require('breej')
const axios = require('axios')
const moment = require('moment')
const router = express.Router()
const helper = require('./helper')
const fetchTags = helper.getTags

router.get('/old', async (req, res) => {
  res.locals.title='Tip Me A Coffee - Social Media on Blockchain'; 
  res.locals.description='TipMeACoffee - A social media platform built on blockchain where you share to earn TMAC tokens. Share what you like - Earn if community likes it.';
  let index = req.query.index | 0;
  let postsAPI = await axios.get(api_url+`/new/${index}`); 
  let nTags = await fetchTags(); 
  let promotedAPI = await axios.get(api_url+`/promoted`); 
  let promotedData = []; 
  let finalData = postsAPI.data; 
  if (promotedAPI.data.length > 0) promotedData = promotedAPI.data.slice(0, 3).map(x => ({ ...x, __promoted: true }));
  if (promotedData.length > 0) finalData.splice(1, 0, promotedData[0]); 
  if (promotedData.length > 1) finalData.splice(5, 0, promotedData[1]); 
  if (promotedData.length > 2) finalData.splice(10, 0, promotedData[2]);
  let _finalData = await Promise.all( finalData.map(async (post) => { userAPI = await axios.get(api_url+`/account/${post.author}`); let ago = moment.utc(post.ts).fromNow(); return { ...post, user: userAPI.data.json, ago: ago } }) );
  let nPosts=await axios.get(api_url+`/new/${index}`); let iPosts=nPosts.data; let sPosts = await Promise.all( iPosts.map(async (post) => { let userAPI = await axios.get(api_url+`/account/${post.author}`); let ago = moment.utc(post.ts).fromNow(); return { ...post, user: userAPI.data.json, ago: ago } }) );
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  {
    let loguser = req.cookies.breeze_username;
    let actAPI = await axios.get(api_url+`/account/${loguser}`);
    const notice = await getNotices(loguser); if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }
    if(index == 0){ 
      res.render('index', { articles: _finalData, moment: moment, trendingTags: nTags, loguser: loguser, acct: actAPI.data, category: categoryList, notices: notices }) 
    } else {
      res.send({articles: sPosts, moment: moment, trendingTags: nTags, loguser: loguser, category: categoryList, notices: notices}); 
    }
  } else { 
    loguser = ""; 
    if(index == 0) 
    {
      res.render('index', { articles: _finalData, moment: moment, trendingTags: nTags, loguser: loguser, category: categoryList, notices: '0' }) 
    } else { 
      res.send({articles: sPosts, moment: moment, trendingTags: nTags, loguser: loguser, category: categoryList});
    }
  }
})

router.get('/welcome', async (req, res) => {
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  { 
    let user = req.cookies.breeze_username;
    return res.redirect('/profile/' + user); 
  } else { 
    let ref = ''; let nTags = await fetchTags(); let loguser = ''; return res.render('welcome', { ref: ref, user: loguser, loguser: loguser, trendingTags: nTags, category: categoryList }) 
  }
})

router.get('/welcome/:name', async (req, res) => {
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  { 
    let user = req.cookies.breeze_username;
    return res.redirect('/profile/' + user); 
  } else {  
    let name = req.params.name; 
    let nTags = await fetchTags(); 
    let loguser = ''; 
    res.render('welcome', { ref: name, loguser: loguser, trendingTags: nTags, category: categoryList }) 
  }
})

router.get('/trending', async (req, res) => {
  let nTags = await fetchTags(); 
  let timeNow = new Date().getTime(); 
  let postsTime = timeNow - 86400000; 
  let postsAPI = await axios.get(api_url+`/trending?after=${postsTime}`);
  if (postsAPI.data.length > 0) _finalData = await Promise.all(postsAPI.data.map(async (post) => { let userAPI = await axios.get(api_url+`/account/${post.author}`); return { ...post, user: userAPI.data.json || false } }));
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  { 
    loguser = req.cookies.breeze_username; 
    const actAPI = await getAccount(loguser); if(actAPI==null){ return res.status(404).redirect('/404') }else{ userAPI = actAPI }
    const notice = await getNotices(loguser); if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }   
    res.render('trending', { articles: _finalData, moment: moment, trendingTags: nTags, loguser: loguser, acct: userAPI, category: categoryList, notices: notices}) 
  } else { 
    loguser = ""; res.render('trending', { articles: _finalData, moment: moment, trendingTags: nTags, loguser: loguser, category: categoryList }) 
  }
})
router.get('', async (req, res) => {
  res.locals.page = "tmac"; 
  let rainAPI = await axios.get(`https://tips.breezechain.org/status`); 
  let nTags = await fetchTags(); 
  let timeNow = new Date().getTime(); 
  let postsTime = timeNow - 86400000; 
  let index = req.query.index | 0;
  let postsAPI = await axios.get(api_url+`/new/${index}`);
  if (postsAPI.data.length > 0) _finalData = await Promise.all(postsAPI.data.map(async (post) => { let userAPI = await axios.get(api_url+`/account/${post.author}`); return { ...post, user: userAPI.data.json || false } }));
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  { 
    loguser = req.cookies.breeze_username; 
    const actAPI = await getAccount(loguser); if(actAPI==null){ return res.status(404).redirect('/404') }else{ userAPI = actAPI }
    const notice = await getNotices(loguser); if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }   
    res.render('tmac', { articles: _finalData, moment: moment, trendingTags: nTags, loguser: loguser, acct: userAPI, category: categoryList, notices: notices, rain: rainAPI}) 
  } else { 
    loguser = ""; res.render('tmac', { articles: _finalData, moment: moment, trendingTags: nTags, loguser: loguser, category: categoryList, rain: rainAPI }) 
  }
})
router.get('/tmac', async (req, res) => {
  res.locals.page = "tmac"; 
  let rainAPI = await axios.get(`https://tips.breezechain.org/status`); 
  let nTags = await fetchTags(); 
  let timeNow = new Date().getTime(); 
  let postsTime = timeNow - 86400000; 
  let index = req.query.index | 0;
  let postsAPI = await axios.get(api_url+`/new/${index}`);
  if (postsAPI.data.length > 0) _finalData = await Promise.all(postsAPI.data.map(async (post) => { let userAPI = await axios.get(api_url+`/account/${post.author}`); return { ...post, user: userAPI.data.json || false } }));
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  { 
    loguser = req.cookies.breeze_username; 
    const actAPI = await getAccount(loguser); if(actAPI==null){ return res.status(404).redirect('/404') }else{ userAPI = actAPI }
    const notice = await getNotices(loguser); if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }   
    res.render('tmac', { articles: _finalData, moment: moment, trendingTags: nTags, loguser: loguser, acct: userAPI, category: categoryList, notices: notices, rain: rainAPI}) 
  } else { 
    loguser = ""; res.render('tmac', { articles: _finalData, moment: moment, trendingTags: nTags, loguser: loguser, category: categoryList, rain: rainAPI }) 
  }
})

router.get('/affiliates', async (req, res, next) => {
  res.locals.page = "mining"; 
  let nTags = await fetchTags();
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  {  
    loguser = req.cookies.breeze_username; 
    const actAPI = await getAccount(loguser); if(actAPI==null){ return res.status(404).redirect('/404') }else{ userAPI = actAPI }
    const notice = await getNotices(loguser); if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }   
    res.render('affiliates', { trendingTags: nTags, loguser: loguser, acct: userAPI, category: categoryList, notices: notices }); 
  } else { 
    loguser = ""; res.render('affiliates', { trendingTags: nTags, loguser: loguser, category: categoryList }); }
})

router.get('/staking', async (req, res, next) => { 
  res.locals.title = "TipMeACoffee Staking - Earn BNB - Top DeFi Project"; 
  res.locals.page = "staking"; 
  let nTags = await fetchTags();
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  { 
    loguser = req.cookies.breeze_username; 
    const actAPI = await getAccount(loguser); if(actAPI==null){ return res.status(404).redirect('/404') }else{ userAPI = actAPI }
    const notice = await getNotices(loguser); if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }   
    res.render('staking', { trendingTags: nTags, loguser: loguser, acct: userAPI, category: categoryList, notices: notices }) 
  } else { 
    loguser = ""; res.render('staking', { trendingTags: nTags, loguser: loguser, category: categoryList }) 
  }
})

router.get('/rewards', async (req, res) => {
  let nTags = await fetchTags(); 
  let votesAPI = await axios.get(api_url+`/votestoday`);
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  { 
    loguser = req.cookies.breeze_username; 
    const actAPI = await getAccount(loguser); if(actAPI==null){ return res.status(404).redirect('/404') }else{ userAPI = actAPI }
    const notice = await getNotices(loguser); if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }   
    res.render('rewards', { loguser: loguser, trendingTags: nTags, acct: userAPI, todayVotes: votesAPI.data, category: categoryList, notices: notices }) 
  } else { 
    loguser = ""; res.render('rewards', { loguser: loguser, trendingTags: nTags, todayVotes: votesAPI.data, category: categoryList }) 
  }
})

router.get('/explore', async (req, res, next) => {
  res.locals.page = "explore";
  let nTags = await fetchTags();
  let nTagsAll = await fetchTags(12);
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  {  
    loguser = req.cookies.breeze_username; 
    const actAPI = await getAccount(loguser); if(actAPI==null){ return res.status(404).redirect('/404') }else{ userAPI = actAPI }
    const notice = await getNotices(loguser); if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }   
    res.render('explore', { trendingTags: nTags, loguser: loguser, acct: userAPI, category: categoryList,trendingTagsAll: nTagsAll, kind: '', notices:notices })
  } else { 
    loguser = ""; res.render('explore', { trendingTags: nTags, loguser: loguser, category: categoryList,trendingTagsAll: nTagsAll, kind: '' }) 
  }
})

router.get('/explore/:kind', async (req, res, next) => {
  res.locals.page = "explore"; 
  let kind = req.params.kind; 
  let nTagsAll = await fetchTags(12); 
  let nTags = nTagsAll.slice(0, 6);
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  {  
    loguser = req.cookies.breeze_username;  
    const actAPI = await getAccount(loguser); if(actAPI==null){ return res.status(404).redirect('/404') }else{ userAPI = actAPI }
    const notice = await getNotices(loguser); if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }   
    res.render('explore', { trendingTags: nTags, trendingTagsAll: nTagsAll, loguser: loguser, acct: userAPI, kind: kind, category: categoryList, notices: notices }); 
  } else {
    loguser = ""; res.render('explore', {trendingTagsAll: nTagsAll, trendingTags: nTags, loguser: loguser, kind: kind,category: categoryList}); }
})

router.get('/feed', async (req, res, next) => {
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  {
    loguser = req.cookies.breeze_username;
    const notice = await getNotices(loguser); if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count } 
    const actAPI = await getAccount(loguser); if(actAPI==null){ return res.status(404).redirect('/404') }else{ userAPI = actAPI }
    const postsAPI = await axios.get(api_url+`/categoryfeed/${loguser}`); 
    let nTags = await fetchTags(); 
    let promotedAPI = await axios.get(api_url+`/promoted`); let promotedData = []; let finalData = postsAPI.data;
    if (promotedAPI.data.length > 0) promotedData = promotedAPI.data.slice(0, 3).map(x => ({ ...x, __promoted: true }));
    if (promotedData.length > 0) finalData.splice(1, 0, promotedData[0]); if (promotedData.length > 1) finalData.splice(5, 0, promotedData[1]); if (promotedData.length > 2) finalData.splice(10, 0, promotedData[2]);
    let _finalData = await Promise.all(finalData.map(async (post) => { let userAPI = await axios.get(api_url+`/account/${post.author}`); return { ...post, user: userAPI.data.json } }));
    res.render('feed', {  articles: postsAPI.data, moment: moment, trendingTags: nTags, loguser: loguser, acct: userAPI, category: categoryList, notices: notices }); 
  } else { return res.redirect('/')}
})

router.get('/tos', async (req, res) => { 
  let nTags = await fetchTags(); 
  if (await validateToken(req.cookies.breeze_username, req.cookies.token))
    { 
      loguser = req.cookies.breeze_username; 
      const actAPI = await getAccount(loguser); if(actAPI==null){ return res.status(404).redirect('/404') }else{ userAPI = actAPI } 
      const notice = await getNotices(loguser); if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count } 
      res.render('common/tos', { trendingTags: nTags, loguser: loguser, acct: userAPI, category: categoryList, notices: notices }); 
    } else { 
      loguser = ""; res.render('common/tos', { trendingTags: nTags, loguser: loguser, category: categoryList }); 
    } 
})
router.get('/robots.txt', async function (req, res) { res.type('text/plain'); res.send("User-agent: *\nDisallow:"); });
router.use(async (req, res) => { 
  let nTags = await fetchTags(); 
  if (await validateToken(req.cookies.breeze_username, req.cookies.token)) 
    { loguser = req.cookies.breeze_username; 
      const actAPI = await getAccount(loguser); if(actAPI==null){ return res.status(404).redirect('/404') }else{ userAPI = actAPI } 
      const notice = await getNotices(loguser); if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }  
      return res.status(404).render('common/404', { trendingTags: nTags, loguser: loguser, acct: userAPI, category: categoryList, notices: notices }); 
    } else { loguser = ""; return res.status(404).render('common/404', { trendingTags: nTags, loguser: loguser, category: categoryList }); 
  } 
})

module.exports = router;