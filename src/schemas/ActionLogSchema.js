import mongoose from "mongoose";

const actionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },

    actionType: {
        type: String,
        enum: ["created", "updated", "deleted", "assigned", "moved"],
        required: true,
    }
}, {
    timestamps: {type: Date, default: Date.now}
});

const Action = mongoose.model("Action", actionSchema);

export default Action;