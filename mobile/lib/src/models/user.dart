class User {
  final String id;
  final String phone;
  final String fullName;
  final String? avatar;
  final String role;
  final String status;
  final String lang;
  final String bio;
  final bool isPhoneVerified;
  final bool isIdentityVerified;
  final bool twoFactorEnabled;
  final String createdAt;
  final String lastActive;

  User({
    required this.id,
    required this.phone,
    required this.fullName,
    this.avatar,
    this.role = 'customer',
    this.status = 'active',
    this.lang = 'uz',
    this.bio = '',
    this.isPhoneVerified = false,
    this.isIdentityVerified = false,
    this.twoFactorEnabled = false,
    this.createdAt = '',
    this.lastActive = '',
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: (json['id'] ?? '') as String,
        phone: (json['phone'] ?? '') as String,
        fullName: (json['full_name'] ?? '') as String,
        avatar: json['avatar'] as String?,
        role: (json['role'] ?? 'customer') as String,
        status: (json['status'] ?? 'active') as String,
        lang: (json['lang'] ?? 'uz') as String,
        bio: (json['bio'] ?? '') as String,
        isPhoneVerified: json['is_phone_verified'] as bool? ?? false,
        isIdentityVerified: json['is_identity_verified'] as bool? ?? false,
        twoFactorEnabled: json['two_factor_enabled'] as bool? ?? false,
        createdAt: (json['created_at'] ?? '') as String,
        lastActive: (json['last_active'] ?? '') as String,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'phone': phone,
        'full_name': fullName,
        'avatar': avatar,
        'role': role,
        'status': status,
        'lang': lang,
        'bio': bio,
        'is_phone_verified': isPhoneVerified,
        'is_identity_verified': isIdentityVerified,
        'two_factor_enabled': twoFactorEnabled,
        'created_at': createdAt,
        'last_active': lastActive,
      };
}
