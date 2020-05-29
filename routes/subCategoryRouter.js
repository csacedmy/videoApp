const Router = require("express").Router();
const path = require('path');
const multer = require('multer');

const SubCategory = require('../model/subCategoryModal');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${path.resolve(__dirname)}/public/images`);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

var upload = multer({ storage: storage })

Router.post('/saveSubCategory', upload.single("files"), (req, res) => {
    try {
        const { video_subcategory, cat_id } = req.body;

        const data = {
            subcat_name: video_subcategory,
            subcat_icon: req.file && req.file.originalname,
            cat_id: cat_id,
        };

        const subCategory = new SubCategory(data)
        subCategory.save((err, subCategoryResult) => {
            if (err) res.json({status: false, message: err })
            else res.status(200).json({status: true, result: subCategoryResult})
        });
    } catch (err) {
        res.json({status: false, message: err});
    }
});
Router.get('/getSubCategory', (req, res) => {
    const {cat_id} = req.query;
    SubCategory.find({cat_id: cat_id}, (err, result) => {
        if (err) res.json({status: false, message: err })
        res.send({status: true, result});
    });
});

Router.post('/editSubCategory', upload.single("files"), (req, res) => {
    const {subcat_id, video_subcategory, cat_id } = req.body;

    const data = {
        subcat_name: video_subcategory,
        subcat_icon: req.file && req.file.originalname,
        cat_id: cat_id,
    };
    SubCategory.findOneAndUpdate({ _id: subcat_id }, { $set: data }, async(err, result) => {
        if (err) res.json({status: false, message: err })
        else if(result){
            const subcategoryResult = await SubCategory.findOne({_id: subcat_id});
            res.status(200).json({status: true, result: subcategoryResult})
        } else {
            res.json({ status: false, message: "Not exist" })
        }
    });

});

Router.get('/deleteSubCategory', (req, res) => {
    const {subcat_id} = req.query;

    SubCategory.findOneAndDelete({ _id: subcat_id }, (err, result) => {
        if (err) res.json({status: false, message: err })
        else if(result){
            res.status(200).json({ status: true, result: "success" })
        } else {
            res.json({ status: false, message: "Not exist" })
        }
    });
});

module.exports = Router;