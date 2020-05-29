const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
  video_url: { type: String, require: true },
  video_title: { type: String, require: true },
  video_description: { type: String, require: true },
  video_image: {type: String},
  cat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "videoCategory",
  },
  subcat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "videoSubCategory",
  },
  view: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('ClassVideo', videoSchema);
