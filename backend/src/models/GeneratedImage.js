import mongoose from "mongoose";

const generatedImageSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    canvasSnapshot: {
      type: String,
      default: null,
    },
    actionType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

generatedImageSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    project_id: this.project,
    prompt: this.prompt,
    image_url: this.imageUrl,
    canvas_snapshot: this.canvasSnapshot,
    action_type: this.actionType,
    created_at: this.createdAt,
  };
};

export default mongoose.model("GeneratedImage", generatedImageSchema);
