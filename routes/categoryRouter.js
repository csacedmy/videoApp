const Router = require("express").Router();

const Category = require('../model/categoryModal');

Router.post('/saveCategory', (req, res) => {
    const { video_category } = req.body;
    const data = {
        cat_name: video_category,
    }

    const category = new Category(data)
    category.save((err, categoryResult) => {
        if (err) res.json({status: false, message: err })
        else res.status(200).json({status: true, result: categoryResult})
    });
});
Router.get('/getCategory', (req, res) => {
    Category.find({}, (err, result) => {
        if (err) res.json({status: false, message: err })
        res.status(200).json({status: true, result});
    });
});


Router.post('/editCategory', (req, res) => {
    const {cat_id, video_category } = req.body;

    Category.findOneAndUpdate({ _id: cat_id }, { $set: { cat_name: video_category } }, async(err, result) => {
        if (err) res.json({ status: false,message: err })
        else if(result){
            const categoryResult = await Category.findOne({_id: cat_id});
            res.status(200).json({status: true, result: categoryResult})
        } else {
            res.json({ status: false, message: "Not exist" })
        }
    });
});

Router.get('/deleteCategory', (req, res) => {
    const {cat_id} = req.query;

    Category.findOneAndDelete({ _id: cat_id }, (err, result) => {
        if (err) res.json({ status: false, message: err })
        else if(result){
            res.status(200).json({ status: true, message: "success" })
        } else {
            res.json({ status: false, message: "Not exist" })
        }
    });
});
module.exports = Router;
