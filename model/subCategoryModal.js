const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subCategorySchema = new Schema({
    subcat_name: { type: String, required: true },
    subcat_icon: String,
	cat_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "videoCategory",
    },
})

module.exports = mongoose.model('videoSubCategory', subCategorySchema);
