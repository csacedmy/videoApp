const Router = require('express').Router();
const SubCategory = require('./subCategoryRouter');
const Category = require('./categoryRouter');
const User = require('./userRouter');
const Video = require('./videoRouter');

Router.use('/', SubCategory);
Router.use('/', Category);
Router.use('/', User);
Router.use('/', Video);


module.exports = Router;