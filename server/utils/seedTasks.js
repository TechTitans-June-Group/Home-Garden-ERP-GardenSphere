import Task from '../models/Task.js';
import User from '../models/User.js';

const stamp = (actor, action, detail, createdAt) => ({
  action,
  detail,
  actor: actor._id,
  actorName: actor.name,
  createdAt,
});

const seedTasks = async () => {
  const count = await Task.countDocuments();
  if (count > 0) {
    console.log(`Tasks already exist (${count}). Skipping seed.`);
    return;
  }

  const manager = await User.findOne({ email: 'garden.manager@gardensphere.com' });
  const gardener = await User.findOne({ email: 'gardener@gardensphere.com' });
  const admin = await User.findOne({ email: 'admin@gardensphere.com' });

  if (!manager || !gardener || !admin) {
    console.log('Demo users missing. Skipping task seed.');
    return;
  }

  const examples = [
    {
      title: 'Water tomato plants',
      description: 'Water cherry tomato beds in the morning, focusing on Bed A1.',
      assignedTo: gardener._id,
      createdBy: manager._id,
      priority: 'High',
      dueDate: '2026-08-19',
      status: 'In Progress',
      comments: [
        {
          text: 'Beds A1 and A2 are done. A3 still needs water.',
          author: gardener._id,
          createdAt: '2026-08-19T07:15:00',
        },
      ],
      history: [
        stamp(manager, 'Created', 'Task created', '2026-08-18T07:00:00'),
        stamp(manager, 'Assigned', 'Assigned to Lead Gardener', '2026-08-18T07:05:00'),
        stamp(gardener, 'Status updated', 'Assigned → In Progress', '2026-08-19T06:40:00'),
      ],
    },
    {
      title: 'Apply fertilizer',
      description: 'Apply compost mix around fruiting tomato plants after watering.',
      assignedTo: gardener._id,
      createdBy: manager._id,
      priority: 'Medium',
      dueDate: '2026-08-20',
      status: 'Assigned',
      history: [
        stamp(manager, 'Created', 'Task created', '2026-08-18T09:00:00'),
        stamp(manager, 'Assigned', 'Assigned to Lead Gardener', '2026-08-18T09:01:00'),
      ],
    },
    {
      title: 'Remove weeds',
      description: 'Clear weeds from carrot and lettuce beds before they seed.',
      assignedTo: gardener._id,
      createdBy: manager._id,
      priority: 'Medium',
      dueDate: '2026-08-21',
      status: 'Pending',
      history: [stamp(manager, 'Created', 'Task created', '2026-08-18T10:00:00')],
    },
    {
      title: 'Inspect plants',
      description: 'Walk all beds and note pests, yellowing leaves, or irrigation issues.',
      assignedTo: gardener._id,
      createdBy: manager._id,
      priority: 'High',
      dueDate: '2026-08-19',
      status: 'Assigned',
      history: [
        stamp(manager, 'Created', 'Task created', '2026-08-18T11:00:00'),
        stamp(manager, 'Assigned', 'Assigned to Lead Gardener', '2026-08-18T11:02:00'),
      ],
    },
    {
      title: 'Apply pest treatment',
      description: 'Spray neem oil on tomato plants showing aphids.',
      assignedTo: gardener._id,
      createdBy: manager._id,
      priority: 'High',
      dueDate: '2026-08-20',
      status: 'In Progress',
      comments: [
        {
          text: 'Neem mix is ready. Treating Bed A1 next.',
          author: gardener._id,
          createdAt: '2026-08-19T08:00:00',
        },
      ],
      history: [
        stamp(manager, 'Created', 'Task created', '2026-08-17T16:00:00'),
        stamp(manager, 'Assigned', 'Assigned to Lead Gardener', '2026-08-17T16:05:00'),
        stamp(gardener, 'Status updated', 'Assigned → In Progress', '2026-08-19T07:50:00'),
      ],
    },
    {
      title: 'Prepare soil',
      description: 'Loosen soil and mix compost into the empty herb bed before replanting mint.',
      createdBy: manager._id,
      priority: 'Low',
      dueDate: '2026-08-23',
      status: 'Pending',
      history: [stamp(manager, 'Created', 'Task created', '2026-08-19T08:30:00')],
    },
    {
      title: 'Harvest vegetables',
      description: 'Harvest ready lettuce and grade it before sending to sales.',
      assignedTo: gardener._id,
      createdBy: manager._id,
      priority: 'High',
      dueDate: '2026-08-20',
      status: 'Assigned',
      history: [
        stamp(manager, 'Created', 'Task created', '2026-08-19T06:00:00'),
        stamp(manager, 'Assigned', 'Assigned to Lead Gardener', '2026-08-19T06:05:00'),
      ],
    },
    {
      title: 'Clean tools',
      description: 'Wash, dry, and store trowels, shears, and watering cans after field work.',
      assignedTo: gardener._id,
      createdBy: admin._id,
      priority: 'Low',
      dueDate: '2026-08-18',
      status: 'Completed',
      completedAt: '2026-08-18T17:20:00',
      comments: [
        {
          text: 'All tools cleaned and returned to the shed.',
          author: gardener._id,
          createdAt: '2026-08-18T17:15:00',
        },
      ],
      history: [
        stamp(admin, 'Created', 'Task created', '2026-08-18T08:00:00'),
        stamp(admin, 'Assigned', 'Assigned to Lead Gardener', '2026-08-18T08:02:00'),
        stamp(gardener, 'Status updated', 'Assigned → In Progress', '2026-08-18T16:00:00'),
        stamp(gardener, 'Status updated', 'In Progress → Completed', '2026-08-18T17:20:00'),
      ],
    },
  ];

  await Task.insertMany(examples);
  console.log(`Seeded ${examples.length} garden tasks.`);
};

export default seedTasks;
