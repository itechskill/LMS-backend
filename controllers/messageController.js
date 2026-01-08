import Message from "../models/Message.js";
import User from "../models/User.js";

/* ================= SEND MESSAGE ================= */
export const sendMessage = async (req, res) => {
  try {
    const { to, text } = req.body;

    if (!to || !text) {
      return res.status(400).json({
        success: false,
        message: "Receiver and text are required",
      });
    }

    const receiverUser = await User.findById(to).select("fullName role");
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const senderRole = Array.isArray(req.user.role) ? req.user.role[0] : req.user.role;
    const receiverRole = Array.isArray(receiverUser.role) ? receiverUser.role[0] : receiverUser.role;

    if (senderRole.toLowerCase() === "student" && receiverRole.toLowerCase() === "student") {
      return res.status(403).json({
        success: false,
        message: "Students cannot message each other",
      });
    }

    if (senderRole.toLowerCase() === "admin" && receiverRole.toLowerCase() === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins cannot message each other",
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: to,
      text,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "fullName role email")
      .populate("receiver", "fullName role email");

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error("SendMessage Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= GET CHAT MESSAGES ================= */
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .populate("sender", "fullName role email")
      .populate("receiver", "fullName role email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("GetMessages Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= USERS FOR SIDEBAR ================= */
export const getUsersForMessaging = async (req, res) => {
  try {
    const senderRole = Array.isArray(req.user.role) ? req.user.role[0] : req.user.role;

    let users = await User.find({ _id: { $ne: req.user._id } })
      .select("fullName role email")
      .lean();

    if (senderRole.toLowerCase() === "student") {
      users = users.filter((u) => {
        const role = Array.isArray(u.role) ? u.role[0] : u.role;
        return role.toLowerCase() === "admin";
      });
    }

    if (senderRole.toLowerCase() === "admin") {
      users = users.filter((u) => {
        const role = Array.isArray(u.role) ? u.role[0] : u.role;
        return role.toLowerCase() === "student";
      });
    }

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GetUsersForMessaging Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= DELETE MESSAGE ================= */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only sender or receiver can delete
    if (
      message.sender.toString() !== req.user._id.toString() &&
      message.receiver.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this message",
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("DeleteMessage Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
