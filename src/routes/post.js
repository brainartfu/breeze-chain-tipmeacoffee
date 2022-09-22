const express = require('express')
const breej = require('breej')
const axios = require('axios')
const fetch = require("node-fetch");
const moment = require('moment')
const tldts = require("tldts");
const helper = require('./helper')
const fetchTags = helper.getTags

async function page(req, res) {
    let author = req.params.name; let link = req.params.link;
    const content = await getPost(author, link)
    if(content==null){ 
        return res.status(404).redirect('/404') 
    }else{ 
        let nTags = await fetchTags(); 
        let post_title = content.json.title ?? content.json.body.slice(0, 50);
        res.locals.title = post_title;
        let post_body = content.json.body.replace(/"/g, "'"); 
        let post_description = post_body.split(" ").splice(0,20).join(" ").replace(/\s+((?=\<)|(?=$))/g, ' ').replace(/(?:&nbsp;|<br>)/g,''); 
        res.locals.description = post_description.replace(/(<([^>]+)>)/gi, '').replace(/\s\s+/g, ' ');
        let post_link = content._id;res.locals.link='https://tipmeacoffee.com/post/'+post_link;
        let post_img = content.json.image;res.locals.image=post_img;
        let newUrl = tldts.parse(content.json.url); let domain=newUrl.domain;
        let userAPI = await axios.get(api_url+`/account/${content.author}`);
        //related post
            let count = 0;
            let tagIndex = 0;
            let _realtedData = [];
            while (count < 10) {
                let postsAPI = await axios.get(api_url+`/new?tag=${content.json.tags[tagIndex]}`); 
                postsAPI.data = postsAPI.data.filter((dd)=>{return dd.author!==content.author&&dd.link!==content.link});
                if (postsAPI.data.length >= 10) {
                    count = 10;
                    postsAPI.data = postsAPI.data.splice(0, 10);
                } else {
                    count += postsAPI.length;
                    tagIndex++;
                }
                if (postsAPI.data.length > 0) tempData = await Promise.all(postsAPI.data.map(async (post) => { let userAPI = await axios.get(api_url+`/account/${post.author}`); return { ...post, user: userAPI.data.json || false } }));
                for (var i = 0; i < tempData.length; i++) _realtedData.push(tempData[i]);
                if (tagIndex+1===content.json.tags.length) break ;
            }
        if(req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
        {
            loguser=req.cookies.breeze_username;
            let actAPI = await axios.get(api_url+`/account/${loguser}`);
            const notice = await getNotices(loguser)
            if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }
            res.render('post', {
                article: content, 
                moment: moment, 
                trendingTags: nTags, 
                loguser: loguser, 
                acct: actAPI.data, 
                user: userAPI.data, 
                category: categoryList,
                notices:notices, 
                domain: domain,
                articles: _realtedData 
            })
        } else {
            loguser='';
            res.render('post', { 
                article: content,  
                moment: moment, 
                trendingTags: nTags, 
                loguser: loguser, 
                user: userAPI.data, 
                category: categoryList, 
                domain: domain,
                articles: _realtedData 
            }) 
        }
    }
}

module.exports = { page}