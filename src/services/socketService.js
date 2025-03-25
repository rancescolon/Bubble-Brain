// services/socketService.js
import { socket } from "../App";

/**
 * Socket service provides an abstraction layer for working with socket.io
 * Handles community chat and private messaging logic
 */
class SocketService {
  /**
   * Join a community chat room
   * @param {number} userId - The user ID
   * @param {number} communityId - The community ID
   * @returns {Promise} - Resolves when room is joined or rejects on timeout/error
   */
  joinCommunityRoom(userId, communityId) {
    return new Promise((resolve, reject) => {
      const roomId = `community-${communityId}`;
      
      // Create a one-time event listener for room creation confirmation
      const handleRoomCreated = (data) => {
        console.log("Community room created response:", data);
        if (data && data.roomID === roomId) {
          socket.off("/room-created-community", handleRoomCreated); // Remove listener
          clearTimeout(timeoutId); // Clear timeout
          resolve(data);
        }
      };
      
      // Set timeout for room creation
      const timeoutId = setTimeout(() => {
        socket.off("/room-created-community", handleRoomCreated);
        console.error("Room creation timed out for community", communityId);
        reject(new Error("Failed to connect to community chat server (timeout)"));
      }, 5000);
      
      // Handle connection errors
      if (!socket.connected) {
        this.connectSocket().catch(err => {
          clearTimeout(timeoutId);
          reject(err);
        });
      }
      
      try {
        // Listen for room creation event
        socket.on("/room-created-community", handleRoomCreated);
        
        // Create payload and emit event
        const payload = {
          userID: parseInt(userId),
          communityID: parseInt(communityId),
          roomID: roomId
        };
        
        console.log("Joining community room with payload:", payload);
        socket.emit("/community/join-room", payload);
        
        // Store active room info
        sessionStorage.setItem("activeCommunityID", communityId);
        sessionStorage.setItem("activeCommunityRoomID", roomId);
      } catch (error) {
        clearTimeout(timeoutId);
        socket.off("/room-created-community", handleRoomCreated);
        console.error("Error joining community room:", error);
        reject(error);
      }
    });
  }
  
  /**
   * Leave a community chat room
   * @param {number} userId - The user ID
   * @param {number} communityId - The community ID
   */
  leaveCommunityRoom(userId, communityId) {
    try {
      const roomId = `community-${communityId}`;
      
      const payload = {
        userID: parseInt(userId),
        communityID: parseInt(communityId),
        roomID: roomId
      };
      
      console.log("Leaving community room:", payload);
      socket.emit("/community/leave-room", payload);
      
      // Clear active room info
      sessionStorage.removeItem("activeCommunityID");
      sessionStorage.removeItem("activeCommunityRoomID");
    } catch (error) {
      console.error("Error leaving community room:", error);
    }
  }
  
  /**
   * Send a message to a community chat room
   * @param {Object} messageData - The message data
   * @returns {Promise} - Resolves when message is sent or rejects on error
   */
  sendCommunityMessage(messageData) {
    return new Promise((resolve, reject) => {
      try {
        if (!socket.connected) {
          reject(new Error("Not connected to chat server"));
          return;
        }
        
        console.log("Sending community message:", messageData);
        socket.emit("/community/send-message", messageData);
        resolve();
      } catch (error) {
        console.error("Error sending community message:", error);
        reject(error);
      }
    });
  }
  
  /**
   * Join a direct message room between two users
   * @param {number} fromUserId - The sender's user ID
   * @param {number} toUserId - The recipient's user ID
   * @returns {Promise} - Resolves with roomId when joined or rejects on timeout/error
   */
  joinDirectMessageRoom(fromUserId, toUserId) {
    return new Promise((resolve, reject) => {
      // Create a one-time event listener for room creation confirmation
      const handleRoomCreated = (data) => {
        console.log("Direct message room created response:", data);
        if (data && data.roomID) {
          socket.off("/room-created", handleRoomCreated); // Remove listener
          clearTimeout(timeoutId); // Clear timeout
          
          // Store room info for potential reconnections
          sessionStorage.setItem("roomID", data.roomID);
          sessionStorage.setItem("activeRoomID", data.roomID);
          
          resolve(data.roomID);
        }
      };
      
      // Set timeout for room creation
      const timeoutId = setTimeout(() => {
        socket.off("/room-created", handleRoomCreated);
        console.error("Room creation timed out for direct message");
        reject(new Error("Failed to create chat room (timeout)"));
      }, 5000);
      
      // Handle connection errors
      if (!socket.connected) {
        this.connectSocket().catch(err => {
          clearTimeout(timeoutId);
          reject(err);
        });
      }
      
      try {
        // Listen for room creation event
        socket.on("/room-created", handleRoomCreated);
        
        // Create payload and emit event
        const payload = {
          fromUserID: parseInt(fromUserId),
          toUserID: parseInt(toUserId)
        };
        
        console.log("Joining direct message room with payload:", payload);
        socket.emit("/chat/join-room", payload);
      } catch (error) {
        clearTimeout(timeoutId);
        socket.off("/room-created", handleRoomCreated);
        console.error("Error joining direct message room:", error);
        reject(error);
      }
    });
  }
  
  /**
   * Connect the socket if it's not already connected
   * @returns {Promise} - Resolves when connected or rejects on timeout/error
   */
  connectSocket() {
    return new Promise((resolve, reject) => {
      if (socket.connected) {
        resolve();
        return;
      }
      
      const handleConnect = () => {
        console.log("Socket connected successfully");
        socket.off("connect", handleConnect);
        clearTimeout(timeoutId);
        resolve();
      };
      
      const handleConnectError = (error) => {
        console.error("Socket connection error:", error);
        socket.off("connect", handleConnect);
        socket.off("connect_error", handleConnectError);
        clearTimeout(timeoutId);
        reject(error);
      };
      
      const timeoutId = setTimeout(() => {
        socket.off("connect", handleConnect);
        socket.off("connect_error", handleConnectError);
        reject(new Error("Socket connection timeout"));
      }, 5000);
      
      socket.on("connect", handleConnect);
      socket.on("connect_error", handleConnectError);
      
      socket.connect();
    });
  }
  
  /**
   * Get the connection status of the socket
   * @returns {boolean} - True if connected, false otherwise
   */
  isConnected() {
    return socket.connected;
  }
}

export default new SocketService();