class Master {
  final String id;
  final String userId;
  final String fullName;
  final String? avatar;
  final String description;
  final List<String> categoryIds;
  final List<String> categoryNames;
  final double rating;
  final int ratingCount;
  final int completedJobs;
  final bool isOnline;
  final bool isVerified;
  final double pricePerHour;
  final double? distance;

  Master({
    required this.id,
    required this.userId,
    required this.fullName,
    this.avatar,
    this.description = '',
    this.categoryIds = const [],
    this.categoryNames = const [],
    this.rating = 0,
    this.ratingCount = 0,
    this.completedJobs = 0,
    this.isOnline = false,
    this.isVerified = false,
    this.pricePerHour = 0,
    this.distance,
  });

  factory Master.fromJson(Map<String, dynamic> json) => Master(
        id: json['id'] as String,
        userId: (json['user'] is Map<String, dynamic>)
            ? ((json['user'] as Map<String, dynamic>)['id'] as String? ?? '')
            : '',
        fullName: (json['user'] is Map<String, dynamic>)
            ? (((json['user'] as Map<String, dynamic>)['full_name'] ?? '') as String)
            : ((json['user_detail']?['full_name'] ?? json['user'] ?? '') as String),
        avatar: (json['user'] is Map<String, dynamic>)
            ? ((json['user'] as Map<String, dynamic>)['avatar'] as String?)
            : json['user_detail']?['avatar'] as String?,
        description: (json['description'] ?? '') as String,
        categoryIds: ((json['categories'] as List?) ?? const [])
            .map((item) => item.toString())
            .toList(),
        categoryNames: ((json['category_names'] as List?) ?? const [])
            .map((item) {
              if (item is Map<String, dynamic>) {
                return (item['title'] ?? '') as String;
              }
              return item.toString();
            })
            .where((item) => item.isNotEmpty)
            .toList(),
        rating: double.tryParse(json['rating']?.toString() ?? '0') ?? 0,
        ratingCount: json['rating_count'] as int? ?? 0,
        completedJobs: json['completed_jobs'] as int? ?? 0,
        isOnline: json['is_online'] as bool? ?? false,
        isVerified: json['is_verified'] as bool? ?? false,
        pricePerHour: double.tryParse(json['price_per_hour']?.toString() ?? '0') ?? 0,
        distance: json['distance'] != null ? double.tryParse(json['distance'].toString()) : null,
      );
}
