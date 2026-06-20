import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { MessageModel, ConversationModel } from '../models/message.model';
import { UserModel } from '../models/user.model';
import { NotificationModel } from '../models/notification.model';

const router = Router();

// In-memory online status tracking
const onlineUsers = new Map<string, { lastSeen: Date; socketId?: string }>();

function setOnline(userId: string) {
  onlineUsers.set(userId, { lastSeen: new Date() });
}

function setOffline(userId: string) {
  onlineUsers.delete(userId);
}

// Get all conversations for current user (enriched)
router.get('/conversations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    setOnline(userId);

    const conversations = await ConversationModel.find({
      members: userId,
      isActive: true
    }).sort({ updatedAt: -1 });

    const enriched = await Promise.all(conversations.map(async (conv) => {
      const lastMsg = await MessageModel.findOne({ conversation: conv._id, isDeleted: false })
        .sort({ createdAt: -1 })
        .populate('sender', 'name email role');

      const memberDetails = await Promise.all(
        conv.members.map(async (id) => {
          const user = await UserModel.findById(id).select('name email role');
          if (!user) return null;
          const online = onlineUsers.has(id);
          return { ...user.toObject(), isOnline: online };
        })
      );

      const unreadCount = await MessageModel.countDocuments({
        conversation: conv._id,
        readBy: { $ne: userId },
        isDeleted: false
      });

      return {
        ...conv.toObject(),
        lastMessage: lastMsg || null,
        memberDetails: memberDetails.filter(Boolean),
        unreadCount
      };
    }));

    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error al cargar conversaciones' });
  }
});

// Create or get a direct conversation
router.post('/conversations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { participantId } = req.body;
    const userId = req.userId!;

    if (!participantId) {
      res.status(400).json({ message: 'ParticipantId requerido' });
      return;
    }

    const existing = await ConversationModel.findOne({
      type: 'direct',
      members: { $all: [userId, participantId] }
    });

    if (existing) {
      res.json({ success: true, data: existing });
      return;
    }

    const participant = await UserModel.findById(participantId).select('name');
    const user = await UserModel.findById(userId).select('name');

    const conversation = await ConversationModel.create({
      name: `${user?.name || 'Usuario'} & ${participant?.name || 'Usuario'}`,
      type: 'direct',
      members: [userId, participantId],
    });

    res.status(201).json({ success: true, data: conversation });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error al crear conversación' });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const convId = req.params.id as string;
    const messages = await MessageModel.find({ conversation: convId, isDeleted: false })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email role')
      .populate({ path: 'replyTo', populate: { path: 'sender', select: 'name' } });

    res.json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error al cargar mensajes' });
  }
});

// Send a message
router.post('/conversations/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content, type, replyToId } = req.body;
    const userId = req.userId!;

    if (!content || !content.trim()) {
      res.status(400).json({ message: 'El contenido del mensaje es requerido' });
      return;
    }

    const convId = req.params.id as string;

    const msgData: any = {
      sender: new mongoose.Types.ObjectId(userId),
      content: content.trim(),
      type: type || 'text',
      conversation: new mongoose.Types.ObjectId(convId),
      readBy: [userId],
    };

    if (replyToId) {
      msgData.replyTo = new mongoose.Types.ObjectId(replyToId);
    }

    const message = await MessageModel.create(msgData);
    const populated = await MessageModel.findById(message._id)
      .populate('sender', 'name email role')
      .populate({ path: 'replyTo', populate: { path: 'sender', select: 'name' } });

    await ConversationModel.findByIdAndUpdate(convId, { updatedAt: new Date() });

    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error al enviar mensaje' });
  }
});

// Delete a message
router.delete('/conversations/:convId/messages/:msgId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { msgId } = req.params;
    await MessageModel.findByIdAndUpdate(msgId, { isDeleted: true });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error al eliminar mensaje' });
  }
});

// Add reaction to message
router.post('/messages/:msgId/reactions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { msgId } = req.params;
    const { emoji } = req.body;
    const userId = req.userId!;

    if (!emoji) {
      res.status(400).json({ message: 'Emoji requerido' });
      return;
    }

    const message = await MessageModel.findById(msgId);
    if (!message) {
      res.status(404).json({ message: 'Mensaje no encontrado' });
      return;
    }

    const existingReaction = message.reactions.find(
      (r: any) => r.emoji === emoji && r.user.toString() === userId
    );

    if (existingReaction) {
      message.reactions = message.reactions.filter(
        (r: any) => !(r.emoji === emoji && r.user.toString() === userId)
      );
    } else {
      message.reactions.push({ emoji, user: new mongoose.Types.ObjectId(userId) } as any);
    }

    await message.save();
    const populated = await MessageModel.findById(msgId)
      .populate('sender', 'name email role')
      .populate({ path: 'replyTo', populate: { path: 'sender', select: 'name' } });

    res.json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error al reaccionar' });
  }
});

// Toggle pin message
router.put('/messages/:msgId/pin', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { msgId } = req.params;
    const msg = await MessageModel.findById(msgId);
    if (!msg) {
      res.status(404).json({ message: 'Mensaje no encontrado' });
      return;
    }
    msg.isPinned = !msg.isPinned;
    await msg.save();
    res.json({ success: true, data: { isPinned: msg.isPinned } });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error' });
  }
});

// Mark messages as read
router.put('/conversations/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const convId = req.params.id as string;
    await MessageModel.updateMany(
      { conversation: convId, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );
    res.json({ success: true, message: 'Mensajes marcados como leídos' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error' });
  }
});

// Get all users (for starting new conversations)
router.get('/users', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await UserModel.find({ isActive: true }).select('name email role');
    const enriched = users.map(u => ({
      ...u.toObject(),
      isOnline: onlineUsers.has(u._id.toString())
    }));
    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error' });
  }
});

// Heartbeat - user is alive
router.post('/heartbeat', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    setOnline(req.userId!);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error' });
  }
});

// Get online users
router.get('/online', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const ids = Array.from(onlineUsers.keys());
    res.json({ success: true, data: ids });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error' });
  }
});

// ============ NOTIFICATIONS ============

router.get('/notifications', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.userId!).select('role');
    const role = user?.role || 'cliente';

    const notifications = await NotificationModel.find({
      $or: [
        { user: req.userId },
        { targetRole: role },
        { targetRole: '' },
      ]
    }).sort({ createdAt: -1 }).limit(50);

    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error' });
  }
});

router.put('/notifications/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notifId = req.params.id as string;
    await NotificationModel.findByIdAndUpdate(notifId, { isRead: true });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error' });
  }
});

router.put('/notifications/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await NotificationModel.updateMany(
      { user: req.userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error' });
  }
});

export default router;
