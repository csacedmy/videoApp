const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    cat_name: { type: String, required: true },
})

module.exports = mongoose.model('videoCategory', categorySchema);
