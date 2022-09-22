const express = require('express')
const breej = require('breej')
require('dotenv').config();
const helper = require('./helper');
const videoParser = require("js-video-url-parser");
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { create } = require('ipfs-http-client')
const ipfsIp = process.env.IPFS_IP; const ipfsPort = process.env.IPFS_PORT; const ipfsProtocol = process.env.IPFS_PC;
const ipfsAPI = create({ host: ipfsIp, port: ipfsPort, protocol: ipfsProtocol });
const tldts = require("tldts");
const randomstring = require("randomstring")
const getSlug = require('speakingurl')
const isUrl = require("is-url")
const Meta = require('html-metadata-parser')
const { limit, substr } = require('stringz')
const { fetchSuspended } = require('../utils/db')
const fetchTags = helper.getTags

async function share(req, res) {
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  {
    let author = req.cookies.breeze_username;let token = req.cookies.token;
    let post = req.body;
    let uname=author.trim();
    if(spammers.includes(uname)){return res.send({ error: true, message: 'You are not allowed to post due to spamming!' })} 
    if (!isUrl(post.url)) {return res.send({ error: true, message: 'Not a valid URL' });
    } else {let newUrl = tldts.parse(post.url); let domainName=newUrl.domain;
      if(helper.sites.includes(domainName)){ return res.send({ error: true, message: 'unable to share form this url' })
      } else { const urlType = videoParser.parse(post.url); if(!(urlType)){type='0'}else{type='1'}
        //Meta.parser(post.url, function (err, result) { //});
        try{
          var result = await Meta.parser(post.url);
          if(result){let meta = result['og']; 
            if(!meta.title){ return res.send({ error: true, message: 'Phew.. Unable to fetch shared link' });
            } else { return res.send({ error: false, meta: meta, link: domainName, type: type });}
          } else {return res.send({ error: true, message: 'Unable to Parse URL' });}
        } catch (err) { return res.send({ error: true, message: 'Requested URL seems to have issue' }) }
      }
    }
  } else { return res.send({ error: true, message: 'phew.. User Validation Fails. You must be login' }) }
}

const addFile = async (fileName, filePath) => {
  const file = fs.readFileSync(filePath)
  const fileAdded = await ipfsAPI.add({path:fileName, content:file})
  const fileHash = fileAdded.cid
  return fileHash
}

async function post(req, res) {
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  {
    let author = req.cookies.breeze_username;let token = req.cookies.token;
      if(spammers.includes(author)){return res.send({ error: true, message: 'You are not allowed to post due to spamming!' })};
      const user = await fetchSuspended(author);
      if(user?.status == true){ return res.send({ error: true, message: 'Phew.. You have been suspended by Mod ['+user.statusUpdateBy+'] for spamming' }); }
      //console.log('ip of ' + req.clientIp + ' author is ' + author)
      let post = req.body;
      let allowed_tags=/^[a-z\d\_\s]+$/i;
      if (!allowed_tags.test(post.tags)) {return res.send({ error: true, message: 'Only alphanumeric tags, no Characters.' })}
      let tags=post.tags.replace(/\s\s+/g, ' ');let tags_arr=tags.trim().split(' ');
      if (post.description.length < 60) {return res.send({ error: true, message: 'Add description of minimum 60 characters' })}
      if (post.description.length > 300) {return res.send({ error: true, message: 'Content must be less than 300 characters' })}
      let description=post.description;
      
      let status_link=randomstring.generate({ length: 13, capitalization: 'lowercase', readable: true, charset: 'numeric'});
      let permlink = author+'-status-'+status_link;
      if (tags_arr.length < 2) {return res.send({ error: true, message: 'Add at least two related tags' })}
      let wifKey = await nkey(token);
      if(req.body.type == '3'){
        let content = { body: description, category: 'status', type: req.body.type, tags: tags_arr };
        let newTx = { type: 4, data: { link: permlink, json: content } };
        breej.getAccount(author, async function (error, account) {
          if (breej.privToPub(wifKey) !== account.pub) {return res.send({ error: true, message: 'Unable to validate user' });
          } else { newTx = breej.sign(wifKey, author, newTx);
            breej.sendTransaction(newTx, function (err, response) { if (err === null) { return res.send({ error: false, link: permlink, author:author }); } else { return res.send({ error: true, message: err['error'] }); } })
          }
        })
      }else if(req.body.type == '2') {
        const file = req.files.file;const fileName = escape(req.body.filename);const filePath = path.resolve('files/'+fileName);
        file.mv(filePath, async (err) => {
          if (err) {return res.send({error: true, message: 'IPFS issues for image uploading'});}
          const fileHash = await addFile(fileName, filePath)
          fs.unlink(filePath, (err) =>{ if (err) console.log(err); })
          image='https://tipmeacoffee.org/ipfs/'+fileHash;
          let content = { body: description, category: 'status', image: image, type: req.body.type, tags: tags_arr };
          let newTx = { type: 4, data: { link: permlink, json: content } };
          breej.getAccount(author, async function (error, account) {
            if (breej.privToPub(wifKey) !== account.pub) {return res.send({ error: true, message: 'Unable to validate user' });
            } else { newTx = breej.sign(wifKey, author, newTx);
              breej.sendTransaction(newTx, function (err, response) { if (err === null) { return res.send({ error: false, link: permlink, author:author }); } else { return res.send({ error: true, message: err['error'] }); } })
            }
          })
        })
      }else if(req.body.type == '1') {
        if(!post.title){return res.send({ error: true, message: 'Not a valid title' });
        }else{ let permlink = getSlug(post.title);let description=limit(post.description, 120, '');
          let video=videoParser.parse(post.exturl);let videoId=video.id
          let content = { title: post.title, body: description, category: post.category, url: post.exturl, image: post.image, type: req.body.type, videoid: videoId, tags: tags_arr };
          let newTx = { type: 4, data: { link: permlink, json: content } };
          breej.getAccount(author, async function (error, account) {
            if (breej.privToPub(wifKey) !== account.pub) {return res.send({ error: true, message: 'Unable to validate user' });
            } else { newTx = breej.sign(wifKey, author, newTx);
              breej.sendTransaction(newTx, function (err, response) {
                if (err === null) { return res.send({ error: false, link: permlink,author:author }); } else { return res.send({ error: true, message: err['error'] }); }
              })
            }
          })
        }
      }else if(req.body.type == '0') {
        if(!post.title){return res.send({ error: true, message: 'Not a valid title' });
        }else{ let permlink = getSlug(post.title);let description=limit(post.description, 120, '');
          let content = { title: post.title, body: description, category: post.category, url: post.exturl, image: post.image, type: req.body.type, tags: tags_arr };
          let newTx = { type: 4, data: { link: permlink, json: content } };
          breej.getAccount(author, async function (error, account) {
            if (breej.privToPub(wifKey) !== account.pub) {return res.send({ error: true, message: 'Unable to validate user' });
            } else { newTx = breej.sign(wifKey, author, newTx);
              breej.sendTransaction(newTx, function (err, response) {
                if (err === null) { return res.send({ error: false, link: permlink, author: author });} else { return res.send({ error: true, message: err['error'] }); }
              })
            }
          })
        }
      }else{
        if(!post.title){return res.send({ error: true, message: 'Not a valid title' });
        }else{ let permlink = getSlug(post.title);let description=limit(post.description, 120, '');
          let content = { title: post.title, body: description, category: post.category, url: post.exturl, image: post.image, type: '0', tags: tags_arr };
          let newTx = { type: 4, data: { link: permlink, json: content } };
          breej.getAccount(author, async function (error, account) {
              if (breej.privToPub(wifKey) !== account.pub) {return res.send({ error: true, message: 'Unable to validate user' });
              } else { newTx = breej.sign(wifKey, author, newTx);
                  breej.sendTransaction(newTx, function (err, response) {
                  if (err === null) { return res.send({ error: false, link: permlink, author: author }); } else { return res.send({ error: true, message: err['error'] }) }
                  })
              }
          })
        }
      }
  } else { return res.send({ error: true, message: 'phew.. User Validation Fails. You must be login' })}
}

module.exports = { post, share }