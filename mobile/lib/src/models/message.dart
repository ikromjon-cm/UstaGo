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
  final List<Participant> participants;

  ChatRoom({
    required this.id,
    this.lastMessage,
    this.unreadCount = 0,
    required this.updatedAt,
    this.participants = const [],
  });

  factory ChatRoom.fromJson(Map<String, dynamic> json) => ChatRoom(
    id: json['id'],
    lastMessage: json['last_message']?['content'],
    unreadCount: json['unread_count'] ?? 0,
    updatedAt: json['updated_at'],
    participants: (json['participants_detail'] as List<dynamic>?)
        ?.map((p) => Participant.fromJson(p as Map<String, dynamic>))
        .toList() ?? [],
  );

  String get displayName {
    if (participants.isEmpty) return 'Chat';
    return participants.map((p) => p.fullName).join(', ');
  }
}

class Participant {
  final String id;
  final String fullName;
  final String? avatar;

  Participant({required this.id, required this.fullName, this.avatar});

  factory Participant.fromJson(Map<String, dynamic> json) => Participant(
    id: json['id'],
    fullName: json['full_name'] ?? '',
    avatar: json['avatar'],
  );
}
