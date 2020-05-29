const Router = require("express").Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../model/userModal');
const {SECRET_KEY} = require('../config');

Router.post('/signUp', (req, res) => {
    const { email, username, phoneNo, password, deviceId } = req.body;
    const data = {
        email, username, phoneNo, password, deviceId, isAdmin: deviceId ? false : true, subscribe: deviceId ? false : true
    }
    User.find({ $or: [{ email: data.email }, { phoneNo: phoneNo }] }, (err, result) => {
        if (err) res.json({status: false, message: err })
        if (result && !result.length) {
            const user = new User(data)
            user.save((err, userResult) => {
                if (err) res.json({status: false, message: err })
                else {
                    sendMail(userResult);
                    res.status(200).json({status: true, result: userResult})
                }
            })
        } else {
            res.json({ status: false, message: 'Email or Phone Number already exist' });
        }
    })
});

Router.post('/login', (req, res) => {
    const { email, password, deviceId, secretKey } = req.body;
    const data = {
        email, password
    }
    if (SECRET_KEY !== secretKey) {
        res.json({
            status: false,
            message: 'Forbidden'
        });
    } else {
        User.find(data, async (err, result) => {
            if (err) res.json({status: false, message: err })
            if (result && !result.length) {
                res.json({ status: false, message: 'Email or password is not correct' });
            } else if (result && result.length && result[0] && result[0].isAdmin) {
                const token = crypto
                    .randomBytes(28)
                    .toString('base64').slice(0, 28);
                await User.updateOne(data, { $set: { userToken: token } });
                User.find(data, (err, userResult) => {
                    if (err) res.json({ status: false, message: err })

                    res.status(200).json({status: true, result: userResult});
                }).select({'email': 1, 'username': 1, 'isAdmin': 1, 'phoneNo': 1, 'subscribe': 1, 'createdAt': 1, 'deviceId': 1, 'userToken': 1})
            } else if (result && result.length && result[0] && !result[0].subscribe) {
                res.json({ status: false,message: 'Please subscribe before login' });
            } else if (!deviceId) {
                res.json({ message: 'Device Id is mandatory' });
            } else if (result && result.length && result[0] && (!result[0].deviceId || deviceId === result[0].deviceId)) {
                const token = crypto
                    .randomBytes(28)
                    .toString('base64').slice(0, 28);
                await User.updateOne(data, { $set: { userToken: token, deviceId } });
                User.find(data, (err, userResult) => {
                    if (err) res.json({ status: false, message: err })

                    res.status(200).json({status: true, result: userResult});
                }).select({'email': 1, 'username': 1,'isAdmin': 1,  'phoneNo': 1, 'subscribe': 1, 'createdAt': 1, 'deviceId': 1, 'userToken': 1})
            } else {
                res.json({ status: false, message: 'User is already login on some other device' });
            }
        })
    }
});

Router.post('/changePassword', (req, res) => {
    const {email, password } = req.body;

    User.findOneAndUpdate({ email }, { $set: {password} }, async(err, result) => {
        if (err) res.json({status: false, message: err })
        else if(result){
            res.status(200).json({status: true, message: "success"})
        } else {
            res.json({ status: false, message: "Not exist" })
        }
    });

});

Router.get('/logoutUser', (req, res) => {
    const { userId } = req.query;
    User.updateOne({ _id: userId }, { $set: { deviceId: '', userToken: '' } }, (err, result) => {
        if (err) res.json({ status: false, message: err })
        else res.status(200).json({ status: true, message: "success" })
    });
});

Router.get('/getUser', (req, res) => {

    let { skip = 0, limit = 10 } = req.query;
    skip = typeof skip === "string" ? +skip : skip;
    limit = typeof limit === "string" ? +limit : limit;
    User.find({isAdmin: false}, async (err, result) => {
        if (err) res.json({ status: false, message: err })
        else {
            res.send({status:true, result});
        }            
    }).select({'email': 1, 'username': 1, 'phoneNo': 1, 'subscribe': 1, 'createdAt': 1, 'deviceId': 1}).skip(skip).limit(limit);
});


Router.get('/subscribeUser', (req, res) => {
    const { user_id, subscribe } = req.query;
    User.updateOne({ _id: user_id }, { $set: { subscribe: subscribe } }, (err, result) => {
        if (err) res.json({ status: false, message: err })
        else res.status(200).json({ status: true, result: "success" })
    });
});

async function sendMail (user) {
    
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
				user: 'csacedmy.admision@gmail.com',
				pass: 'csacedmy@123'
			}
        });

      let mailToAdmin = {
        to: 'csacedmy.admision@gmail.com',
        from: 'Admin',
        subject: 'New User registered',
        text: `A new user registered your app with username "${user.username}" email "${user.email}" and phone number "${user.phoneNo}" `
      };

      var mailToUser = {
        to: `${user.email}`,
        from: 'Admin',
        subject: 'Registration',
        text: `Hi ${user.username}, You are succesfully registered with Video app. Please subscribe to app for login.`
      };
      
      transporter.sendMail(mailToAdmin, function(error, info){
        if (error) {
          console.log("error with admin mail ", error);
        } else {
          console.log('Email sent to admin: ' + info);
        }
      });
      transporter.sendMail(mailToUser, function(error, info){
        if (error) {
          console.log("error with user mail", error);
        } else {
          console.log('Email sent to user: ' + info);
        }
      });
}

module.exports = Router;