class Message {
  final String id;
  final String content;
  final String senderId;
  final String senderName;
  final String messageType;
  final bool isRead;
  final String createdAt;

  Message({
    required this.id,
    required this.content,
    required this.senderId,
    required this.senderName,
    this.messageType = 'text',
    this.isRead = false,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) => Message(
    id: json['id'],
    content: json['content'] ?? '',
    senderId: json['sender'],
    senderName: json['sender_detail']?['full_name'] ?? '',
    messageType: json['message_type'] ?? 'text',
    isRead: json['is_read'] ?? false,
    createdAt: json['created_at'],
  );
}

class ChatRoom {
  final String id;
  final String? lastMessage;
  final int unreadCount;
  final String updatedAt;

  ChatRoom({
    required this.id,
    this.lastMessage,
    this.unreadCount = 0,
    required this.updatedAt,
  });

  factory ChatRoom.fromJson(Map<String, dynamic> json) => ChatRoom(
    id: json['id'],
    lastMessage: json['last_message']?['content'],
    unreadCount: json['unread_count'] ?? 0,
    updatedAt: json['updated_at'],
  );
}
