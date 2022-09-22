const express = require('express')
const breej = require('breej')
const axios = require('axios')
const CryptoJS = require("crypto-js")
const pathParse = require("path-parse")
const isUrl = require("is-url")
const clfeed = require('./clfeed')
const { fetchUser } = require('../utils/db')
const helper = require('./helper');
const fetchTags = helper.getTags

async function wallet(req, res) {res.locals.page = "wallet";
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  {
    let token = req.cookies.token; let user = req.cookies.breeze_username;
    var pricefeed = await clfeed.priceFeed.methods.latestRoundData().call();var bnbprice = ((pricefeed.answer)/1e8).toFixed(2);
    let decrypted = CryptoJS.AES.decrypt(token, msgkey, { iv: iv }); 
    let wifKey = decrypted.toString(CryptoJS.enc.Utf8); 
    let pubKey = breej.privToPub(wifKey);
    let earnAPI = await axios.get(api_url+`/distributed/${user}/today`); 
    let transferAPI = await axios.get(api_url+`/transfers/${user}`); 
    let userAPI = await axios.get(api_url+`/account/${user}`); 
    const notice = await getNotices(user)
    if(notice==null){ return res.status(404).redirect('/404') }else{ notices = notice.count }
    let nTags = await fetchTags(); res.render('wallet', { 
      activities: transferAPI.data, acct: userAPI.data, trendingTags: nTags, loguser: user, earnToday: earnAPI, category: categoryList,wifKey:wifKey,pubKey:pubKey, notices: notices, bnbprice: bnbprice }) 
  } else { return res.redirect('/welcome'); }
}

async function withdraw(req, res) {
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  {
    const sender = req.cookies.breeze_username;
    const user = await fetchUser(sender);
    let post = req.body;
    let amount = parseInt((post.wid_amount) * 1000000);
    if (amount <  5000000) { return res.send({ error: true, message: 'Min withdrawal amount is 5 tokens' }); }
    if(user?.status !== true){ return res.send({ error: true, message: 'Phew.. You are not a verified TMAC user. Get verified on TipMeACoffee Discord server' }); }
    let wifKey = await nkey(req.cookies.token);
    const Validator = require('wallet-validator');let valid = Validator.validate(post.wid_addr, 'ETH');
    breej.getAccount(sender, async function (error, account) {
      if (breej.privToPub(wifKey) !== account.pub) {
        return res.send({ error: true, message: 'Unable to validate user' });
      } else if (amount > account.balance) {
        return res.send({ error: true, message: 'Not enough balance' });
      } else if (amount <  10000000) { 
        return res.send({ error: true, message: 'Min withdrawal amount is 10 tokens' }); 
      } else if (!valid) {
        return res.send({ error: true, message: 'Not a valid BSC wallet address' });
      } else {
        let wAmount = parseInt(amount);
        let newTx = { type: 23, data: { destaddr: post.wid_addr, network: 'BSC', amount: wAmount } };
        let signedTx = breej.sign(wifKey, sender, newTx);
        breej.sendTransaction(signedTx, (error, result) => { if (error === null) { return res.send({ error: false }); } else { return res.send({ error: true, message: error['error'] }); } })
       }
    });
  } else { return res.send({ error: true, message: 'phew.. User Validation Fails. You must login' }); }
}

async function boost(req, res) {
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  {
    let post = req.body; let sender = req.cookies.breeze_username;let wifKey = await nkey(req.cookies.token);
    let amount = parseInt((post.boost_amount) * 1000000);
    breej.getAccount(sender, async function (error, account) {
      if (breej.privToPub(wifKey) !== account.pub) {return res.send({ error: true, message: 'Unable to validate user' });
        } else if (amount > account.balance) {
          return res.send({ error: true, message: 'Not enough balance' });
        } else if (amount < 100000) {
          return res.send({ error: true, message: 'Min bid amount is 0.1 tokens' });
        } else if (!isUrl(post.boost_url)) {
          return res.send({ error: true, message: 'Not a valid URL' });
        } else { let boostUrl = pathParse(post.boost_url); let boostLink = boostUrl.base;
          let newTx = { type: 13, data: { link: boostLink, burn: amount } };
          let signedTx = breej.sign(wifKey, sender, newTx);
          breej.sendTransaction(signedTx, (error, result) => { if (error === null) { return res.send({ error: false }); } else { return res.send({ error: true, message: error['error'] }); } })
        }
    });
  } else { return res.send({ error: true, message: 'phew.. User Validation Fails. You must login' }); }  
}

async function transfer(req, res) {
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  {
    if(spammers.includes(req.cookies.breeze_username)){return res.send({ error: true, message: 'You are not allowed to transfer due to spamming!' });return false;}
    let post = req.body; 
    let sender = req.cookies.breeze_username;
    const user = await fetchUser(sender);
    if(user?.status !== true){ return res.send({ error: true, message: 'Phew.. You are not a verified TMAC user. Get verified on TipMeACoffee Discord server' }); }
    let wifKey = await nkey(req.cookies.token);
    breej.getAccounts([post.rec_user], async function (error, account) {
      if (!account || account.length === 0) {
        return res.send({ error: true, message: 'Not a valid receiver' });
      } else if (sender == post.rec_user) {
        return res.send({ error: true, message: "Can't transfer to yourself"});
      } else {
        let amount = parseInt((post.trans_amount) * 1000000);
        breej.getAccount(sender, async function (error, account) {
          if (breej.privToPub(wifKey) !== account.pub) {
            return res.send({ error: true, message: 'Unable to validate user' });
          } else if (amount <  500000) {
            return res.send({ error: true, message: 'Min 0.5 tokens allowed' });
          } else if (post.trans_amount > (account.balance) / 1000000) {
            return res.send({ error: true, message: 'Not enough balance' });
          } else {
            let newTx = { type: 3, data: { receiver: post.rec_user, amount: amount, memo: post.memo } };
            let signedTx = breej.sign(wifKey, sender, newTx);
            breej.sendTransaction(signedTx, (error, result) => { if (error === null) { return res.send({ error: false }); } else { return res.send({ error: true, message: error['error'] }); } })
          }
        });
      }
    });
  } else { return res.send({ error: true, message: 'phew.. User Validation Fails. You must be login' }); }
}

async function updateKeys(req, res) {
  if(req.cookies && req.cookies.breeze_username && req.cookies.breeze_username !=='' && req.cookies.token && req.cookies.token !=='' && await validateToken(req.cookies.breeze_username, req.cookies.token)) 
  {
    let loguser = req.cookies.breeze_username; let wifKey = await nkey(req.cookies.token);
    breej.getAccount(loguser, async function (error, account) {
      if (breej.privToPub(wifKey) !== account.pub) {return res.send({ error: true, message: 'Unable to validate user' });
      } else { let keys=breej.keypair(); let pub=keys.pub;let priv=keys.priv;
      let newTx = { type: 12, data: {pub: keys.pub } };  let signedTx = breej.sign(wifKey, loguser, newTx);
        breej.sendTransaction(signedTx, (error, result) => {
          if (error === null) {return res.send({ error: false, priv: priv, pub:pub});
          } else { return res.send({ error: true, message: error['error']}); }
        })
      }
    })  
  } else { return res.send({ error: true, message: 'phew.. User Validation Fails' }); }
}


module.exports = { wallet, withdraw, boost, transfer, updateKeys }