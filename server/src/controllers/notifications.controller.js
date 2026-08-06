import { SEED_NOTIFICATIONS } from '../utils/mockStore.js';

let notifications = [...SEED_NOTIFICATIONS];

export const getNotifications = async (req, res) => {
  try {
    const list = notifications.filter(n => n.userId === req.user.id || true);
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const item = notifications.find(n => n.id === id);
    if (item) {
      item.read = true;
    }
    return res.json({ message: 'Marked read' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
