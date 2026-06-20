class Master {
  final String id;
  final String fullName;
  final String? avatar;
  final double rating;
  final int ratingCount;
  final int completedJobs;
  final bool isOnline;
  final bool isVerified;
  final double pricePerHour;
  final double? distance;

  Master({
    required this.id,
    required this.fullName,
    this.avatar,
    this.rating = 0,
    this.ratingCount = 0,
    this.completedJobs = 0,
    this.isOnline = false,
    this.isVerified = false,
    this.pricePerHour = 0,
    this.distance,
  });

  factory Master.fromJson(Map<String, dynamic> json) => Master(
    id: json['id'],
    fullName: json['user_detail']?['full_name'] ?? json['user'],
    avatar: json['user_detail']?['avatar'],
    rating: double.parse(json['rating']?.toString() ?? '0'),
    ratingCount: json['rating_count'] ?? 0,
    completedJobs: json['completed_jobs'] ?? 0,
    isOnline: json['is_online'] ?? false,
    isVerified: json['is_verified'] ?? false,
    pricePerHour: double.parse(json['price_per_hour']?.toString() ?? '0'),
    distance: json['distance'] != null ? double.parse(json['distance'].toString()) : null,
  );
}
