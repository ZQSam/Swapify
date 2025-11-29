import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, index: true },
    uiucVerified: { type: Boolean, default: false },
    nickname: { type: String, required: true },
    passwordHash: { type: String, required: true },
    avatar: String,
    bio: String,
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Method to calculate and attach rating stats to user object
userSchema.methods.getRatingStats = async function() {
  const Rating = mongoose.model('Rating');
  const result = await Rating.aggregate([
    { $match: { ratee: this._id } },
    { $group: {
      _id: null,
      averageRating: { $avg: '$score' },
      ratingCount: { $sum: 1 }
    }}
  ]);

  if (result.length > 0) {
    return {
      averageRating: result[0].averageRating,
      ratingCount: result[0].ratingCount
    };
  }
  return { averageRating: 0, ratingCount: 0 };
};

// Static method to get users with rating stats
userSchema.statics.findWithRatings = async function(query = {}) {
  const users = await this.find(query);
  const Rating = mongoose.model('Rating');

  const usersWithRatings = await Promise.all(
    users.map(async (user) => {
      const stats = await user.getRatingStats();
      return {
        ...user.toObject(),
        ...stats
      };
    })
  );

  return usersWithRatings;
};

export const User = mongoose.model("User", userSchema);
