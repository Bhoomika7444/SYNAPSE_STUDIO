import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      default: "Untitled Project",
      trim: true,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    canvasData: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

projectSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    thumbnail: this.thumbnail,
    canvas_data: this.canvasData,
    created_at: this.createdAt,
    updated_at: this.updatedAt,
  };
};

export default mongoose.model("Project", projectSchema);
