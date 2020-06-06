const Router = require("express").Router();
const crypto = require('crypto');
const User = require('../model/userModal');
const Video = require('../model/videoModal');

const {ENCRYPTION_ALGORITHM, ENCRYPTION_KEY} = require('../config');

Router.get('/getVideo', verifyToken, (req, res) => {

    if (!req.token) {
        return res.json({
            success: false,
            message: 'Forbidden'
        });
    } else {
        let { skip = 0, limit = 0, subcat_id } = req.query;
        skip = typeof skip === "string" ? +skip : skip;
        limit = typeof limit === "string" ? +limit : limit;
        User.find({ userToken: req.token }, (err, result) => {
            if (err) res.json({ status: false, message: err })
            if (result && result.length && result[0].subscribe) {
                const filter = {

                }
                if(subcat_id) {
                    filter.subcat_id = subcat_id
                }
                Video.find(filter, (err, result) => {
                    if (err) res.json({ status: false, message: err })
                    res.status(200).json({ status: true, result });
                }).skip(skip).limit(limit).populate([
                    {
                        path: "cat_id",
                        select: "cat_name"
                    },
                    {
                        path: "subcat_id",
                        select: "subcat_name",
                    }
                ]);
            } else {
                res.status(401).json({ status: false, message: 'Unauthorized user' })
            }
        });
    }
});

Router.post('/saveVideo', (req, res) => {
    const { video_url,video_image,video_description, video_title, cat_id, subcat_id, view } = req.body;

    const crypted = encryptData(video_url);
    if (crypted) {
        const data = {
            video_url: crypted,
            video_title,
            cat_id, 
            subcat_id,
            video_image,
            video_description,
            view
        }
        const video = new Video(data)
        video.save((err, videoResult) => {
            if (err) res.json({ status: false, message: err })
            else res.status(200).json({ status: true, result: videoResult })
        });
    } else {
        res.json({ status: false, message: 'Not valid text' })
    }
});

Router.get('/video_view_count', verifyToken, (req, res) => {
    if (!req.token) {
        return res.status(403).json({
            status: false,
            message: 'Forbidden'
        });
    } else {
        const { video_id } = req.query;
        User.find({ userToken: req.token }, (err, result) => {
            if (err) res.json({ status: false, message: err })
            if (result && result.length && result[0].subscribe) {
                Video.findOneAndUpdate({ _id: video_id }, { $inc: { view: 1 } }, async (err, result) => {
                    if (err) res.json({ status: false, message: err })
                    else if (result) {
                        const videoResult = await Video.findOne({ _id: video_id });
                        res.status(200).json({ status: true, result: videoResult })
                        // res.status(200).json({status: true, result: "success" })
                    } else {
                        res.json({ status: false, message: "Not exist" })
                    }

                });
            } else {
                res.status(401).json({ status: false, message: 'Unauthorized user' })
            }
        });
    }
});

module.exports = Router;


function verifyToken(req, res, next) {
    const bearerHeader = req.headers['x-access-token'] || req.headers['authorization'];
    if (typeof bearerHeader !== undefined && bearerHeader !== undefined) {
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];
        req.token = token;
        next();
    } else {
        //Forbidden
        res.status(403).json({
            status: false,
            message: 'Forbidden'
        });
    }
}

function encryptData(text) {
    var cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY)
    var crypted = cipher.update(text, 'utf-8', 'hex')
    crypted += cipher.final('hex')
    return crypted;
}
