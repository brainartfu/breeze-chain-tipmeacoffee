const express = require('express')
const breej = require('breej')
const CryptoJS = require("crypto-js")
const helper = require('./helper');
const fetchTags = helper.getTags
const AccountModel = require("../utils/accounts")
require('dotenv').config();
async function login(req, res) {
        var user = req.body;  
        if (!user.username || user.username == '') { return res.send({ error: true, message: 'Enter valid username' });  };
        if (!user.pivkey || user.pivkey == '') { return res.send({ error: true, message: 'Enter valid private key' }); };
        var key = user.pivkey;
        var loginUser = user.username.trim(); 
        var username = loginUser.toLowerCase();
        breej.getAccount(username, async function (error, account) {
            if (error) { console.log('login error'); return res.send({ error: true, message: 'Not a valid user' }); }
            if(account && account.name == username){
                try { 
                    pubKey = breej.privToPub(key) 
                } catch (e) {
                    return res.send({ error: true, message: 'Password (privkey) seems incorrect' })
                }
                if (account.pub !== pubKey) { 
                    return res.send({ error: true, message: 'Password (privkey) validation fails' }); 
                } else {
                    var encrypted = CryptoJS.AES.encrypt(key, msgkey, { iv: iv }); var token = encrypted.toString();
                    res.cookie('breeze_username', username, { expires: new Date(Date.now() + 86400000000), httpOnly: true });
                    res.cookie('token', token, { expires: new Date(Date.now() + 86400000000), httpOnly: true });
                    return res.send({ error: false });
                }
            } else {return res.send({ error: true, message: 'user authentication fails' }) } 
        })
}

async function logout(req, res) {
    if(req.cookies.token && req.cookies.breeze_username) {
        res.clearCookie('breeze_username'); 
        res.clearCookie('token'); 
        return res.send({ error: false }); 
    } else { return res.send({ error: true, message: 'not a valid user session' }); }
}

async function signup(req, res) {
    let post = req.body; 
    let inputName = (post.name.toLowerCase()).trim();  
    let allowed_name = /^[0-9a-z]+$/; 
    if (inputName && !inputName.match(allowed_name)) { res.send({ error: true, message: 'Only alphanumeric usernames allowed (all lowercase)' }); return false; };
    if (inputName && inputName.length < 5) { res.send({ error: true, message: 'Username length should not be less than 5' }); return false; };

    let dtoken = (escape(req.body.dtoken)).trim();
    if(!dtoken){return res.send({ error: true, message: 'Seems some issue with activation token' }) }
    //res.send({ error: true, message: 'Signup is disabled temporarily' }); return false;
    breej.getAccounts([inputName], async function (error, accounts) {
        if(error){ return res.send({ error: true, message: 'Some issue with username. Contact support' }) }

        if (!accounts || accounts.length === 0) {

            const userData = await AccountModel.findOne({ user_token: dtoken, user_name: inputName });
            if(!userData) return res.send({ error: true, message: 'Activation token for this username is not valid' })
            if(userData.user_status === 1) return res.send({ error: true, message: 'This token is already used for account registration' })
            //res.send({ error: true, message: 'Signup is disabled temporarily' }); return false;
            let keys = breej.keypair(); 
            let pub = keys.pub; 
            let priv = keys.priv;
            let newTx = { type: 0, data: { name: inputName, pub: pub, ref: req.body.ref } }; 
            let privAc = process.env.privKey; let signedTx = breej.sign(privAc, 'breeze', newTx)
            breej.sendTransaction(signedTx, async (error, result) => {
                if (error === null) {
                    userData.user_status = 1;
                    await userData.save();
                    res.send({ error: false, priv: priv, user: inputName });
                    let newVTx = { type: 14, data: { receiver: post.name, amount: parseInt(180) } };
                    let signedVTx = breej.sign(privAc, 'breeze', newVTx);
                    breej.sendTransaction(signedVTx, (error, result) => { })
                    let newBTx = { type: 15, data: { receiver: post.name, amount: parseInt(3000) } };
                    let signedBTx = breej.sign(privAc, 'breeze', newBTx);
                    breej.sendTransaction(signedBTx, (error, result) => { })
                } else { return res.send({ error: true, message: error['error'] }); }
            })
        } else { return res.send({ error: true, message: 'phew.. Username already exist' }); }
    })
}

module.exports = { login, logout, signup}