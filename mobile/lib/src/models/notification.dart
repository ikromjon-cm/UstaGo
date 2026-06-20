class AppNotification {
  final String id;
  final String type;
  final String title;
  final String body;
  final bool isRead;
  final String createdAt;

  AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    this.isRead = false,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
    id: json['id'],
    type: json['type'],
    title: json['title'],
    body: json['body'] ?? '',
    isRead: json['is_read'] ?? false,
    createdAt: json['created_at'],
  );
}
