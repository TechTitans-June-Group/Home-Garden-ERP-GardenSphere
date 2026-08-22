import ActivityLog from '../models/ActivityLog.js';

const logActivity = async ({ user, action, detail, userId, userName }) => {
  try {
    await ActivityLog.create({
      userId: userId || user?._id || null,
      userName: userName || user?.name || 'System',
      actorId: user?._id || userId || null,
      actorName: user?.name || userName || 'System',
      action,
      detail: detail || '',
    });
  } catch {
    /* activity should not block the request */
  }
};

export default logActivity;
