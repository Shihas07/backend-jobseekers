const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
  {
    tokenCount: {
      type: Number,
      required: true,
      min: 1,
    },
    tokenPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Token = mongoose.model("Token", TokenSchema);

module.exports = Token;
