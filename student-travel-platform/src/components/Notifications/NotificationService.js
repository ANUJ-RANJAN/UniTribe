import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";

class NotificationService {
  /**
   * Creates a new notification for a user
   * @param {string} userId - The ID of the user to notify
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {string} type - The notification type (e.g., 'message', 'trip', 'event', 'community')
   * @param {Object} metadata - Optional metadata for the notification
   * @returns {Promise<string>} - The ID of the created notification
   */
  static async createNotification(userId, title, message, type, metadata = {}) {
    try {
      const notificationData = {
        userId,
        title,
        message,
        type,
        metadata,
        read: false,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "notifications"),
        notificationData
      );
      return docRef.id;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Marks a notification as read
   * @param {string} notificationId - The ID of the notification to mark as read
   * @returns {Promise<void>}
   */
  static async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Creates a message notification
   * @param {string} userId - The ID of the user to notify
   * @param {string} senderName - The name of the message sender
   * @param {string} messagePreview - A preview of the message content
   * @param {string} chatId - The ID of the chat/conversation
   * @returns {Promise<string>} - The ID of the created notification
   */
  static async createMessageNotification(
    userId,
    senderName,
    messagePreview,
    chatId
  ) {
    const title = `New message from ${senderName}`;
    const message =
      messagePreview.length > 50
        ? `${messagePreview.substring(0, 50)}...`
        : messagePreview;

    return this.createNotification(userId, title, message, "message", {
      chatId,
    });
  }

  /**
   * Creates a trip notification
   * @param {string} userId - The ID of the user to notify
   * @param {string} tripName - The name of the trip
   * @param {string} action - The action that triggered the notification (e.g., 'new', 'update', 'invite')
   * @param {string} tripId - The ID of the trip
   * @returns {Promise<string>} - The ID of the created notification
   */
  static async createTripNotification(userId, tripName, action, tripId) {
    let title, message;

    switch (action) {
      case "new":
        title = "New Trip Posted";
        message = `A new trip "${tripName}" has been posted`;
        break;
      case "update":
        title = "Trip Updated";
        message = `The trip "${tripName}" has been updated`;
        break;
      case "invite":
        title = "Trip Invitation";
        message = `You've been invited to join the trip "${tripName}"`;
        break;
      default:
        title = "Trip Notification";
        message = `Update about trip "${tripName}"`;
    }

    return this.createNotification(userId, title, message, "trip", {
      tripId,
      action,
    });
  }

  /**
   * Creates an event notification
   * @param {string} userId - The ID of the user to notify
   * @param {string} eventName - The name of the event
   * @param {string} action - The action that triggered the notification (e.g., 'new', 'update', 'reminder')
   * @param {string} eventId - The ID of the event
   * @returns {Promise<string>} - The ID of the created notification
   */
  static async createEventNotification(userId, eventName, action, eventId) {
    let title, message;

    switch (action) {
      case "new":
        title = "New Event Posted";
        message = `A new event "${eventName}" has been posted`;
        break;
      case "update":
        title = "Event Updated";
        message = `The event "${eventName}" has been updated`;
        break;
      case "reminder":
        title = "Event Reminder";
        message = `Reminder: The event "${eventName}" is coming up soon`;
        break;
      default:
        title = "Event Notification";
        message = `Update about event "${eventName}"`;
    }

    return this.createNotification(userId, title, message, "event", {
      eventId,
      action,
    });
  }

  /**
   * Creates a community notification
   * @param {string} userId - The ID of the user to notify
   * @param {string} communityName - The name of the community
   * @param {string} action - The action that triggered the notification (e.g., 'new', 'update', 'invite')
   * @param {string} communityId - The ID of the community
   * @returns {Promise<string>} - The ID of the created notification
   */
  static async createCommunityNotification(
    userId,
    communityName,
    action,
    communityId
  ) {
    let title, message;

    switch (action) {
      case "new":
        title = "New Community Created";
        message = `A new community "${communityName}" has been created`;
        break;
      case "update":
        title = "Community Updated";
        message = `The community "${communityName}" has been updated`;
        break;
      case "invite":
        title = "Community Invitation";
        message = `You've been invited to join the community "${communityName}"`;
        break;
      default:
        title = "Community Notification";
        message = `Update about community "${communityName}"`;
    }

    return this.createNotification(userId, title, message, "community", {
      communityId,
      action,
    });
  }
}

export default NotificationService;
