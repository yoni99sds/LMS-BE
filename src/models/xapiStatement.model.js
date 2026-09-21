import mongoose from 'mongoose';

const xapiStatementSchema = new mongoose.Schema(
  {
    // Actor: The learner or group performing the activity
    actor: {
      objectType: { type: String, default: 'Agent' },
      name: { type: String },
      mbox: { type: String, required: true },
      account: {
        homePage: { type: String },
        name: { type: String }
      }
    },
    // Verb: The action taken by the Actor
    verb: {
      id: { type: String, required: true }, // URI representing the verb
      display: {
        type: Map,
        of: String // e.g., { "en-US": "completed" }
      }
    },
    // Object: The activity, agent, or statement that is the object of the verb
    object: {
      objectType: { type: String, default: 'Activity' },
      id: { type: String, required: true }, // URI representing the activity
      definition: {
        name: { type: Map, of: String },
        description: { type: Map, of: String },
        type: { type: String }
      }
    },
    // Result: Optional results like score, completion status, success status, duration
    result: {
      score: {
        scaled: { type: Number, min: -1, max: 1 },
        raw: { type: Number },
        min: { type: Number },
        max: { type: Number }
      },
      success: { type: Boolean },
      completion: { type: Boolean },
      response: { type: String },
      duration: { type: String }, // ISO 8601 duration format
      extensions: { type: Map, of: mongoose.Schema.Types.Mixed }
    },
    context: {
      registration: { type: String },
      instructor: {
        name: { type: String },
        mbox: { type: String }
      },
      revision: { type: String },
      platform: { type: String },
      language: { type: String },
      extensions: { type: Map, of: mongoose.Schema.Types.Mixed }
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    stored: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

// Indexes for common LRS queries
xapiStatementSchema.index({ 'actor.mbox': 1, timestamp: -1 });
xapiStatementSchema.index({ 'verb.id': 1 });
xapiStatementSchema.index({ 'object.id': 1 });

const XapiStatement = mongoose.model('XapiStatement', xapiStatementSchema);

export default XapiStatement;
