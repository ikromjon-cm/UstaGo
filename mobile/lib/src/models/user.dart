class User {
  final String id;
  final String phone;
  final String fullName;
  final String? avatar;
  final String role;
  final String status;
  final String lang;

  User({
    required this.id,
    required this.phone,
    required this.fullName,
    this.avatar,
    this.role = 'customer',
    this.status = 'active',
    this.lang = 'uz',
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'],
    phone: json['phone'],
    fullName: json['full_name'],
    avatar: json['avatar'],
    role: json['role'] ?? 'customer',
    status: json['status'] ?? 'active',
    lang: json['lang'] ?? 'uz',
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'phone': phone,
    'full_name': fullName,
    'avatar': avatar,
    'role': role,
    'status': status,
    'lang': lang,
  };
}
