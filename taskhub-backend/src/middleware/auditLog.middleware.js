const AuditLog = require('../models/auditLog.model');

const logAction = async ({ userId, action, collectionName, documentId }) => {
  try {
    await AuditLog.create({ userId, action, collectionName, documentId });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = logAction;
