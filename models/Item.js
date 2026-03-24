import mongoose from 'mongoose';

/**
 * Item schema — represents a document in the "items" collection.
 * This is the collection that will be read and displayed on the /data page.
 */
const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title must be 100 characters or less'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    author: {
      type: String,
      trim: true,
      default: 'Anonymous',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Item', itemSchema);
