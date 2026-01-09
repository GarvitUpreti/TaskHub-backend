const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., "CREATE_TASK", "UPDATE_TASK", "DELETE_TASK"
  collectionName: { type: String, required: true }, // e.g., "tasks"
  documentId: { type: mongoose.Schema.Types.ObjectId }, // the affected document
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
