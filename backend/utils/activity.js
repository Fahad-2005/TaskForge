const Activity = require('../models/Activity');

async function recordActivity({
  task,
  workspace,
  actor,
  type,
  message,
  metadata = {},
}) {
  const activity = await Activity.create({
    task: task || null,
    workspace,
    actor,
    type,
    message,
    metadata,
  });

  return Activity.findById(activity._id).populate('actor', 'name email');
}

module.exports = { recordActivity };
