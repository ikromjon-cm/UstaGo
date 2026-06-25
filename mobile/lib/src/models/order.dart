class Order {
  final String id;
  final String title;
  final String description;
  final String status;
  final String urgency;
  final double budget;
  final double finalPrice;
  final bool isPaid;
  final bool isRated;
  final String address;
  final double latitude;
  final double longitude;
  final String apartment;
  final String? preferredDate;
  final String? preferredTime;
  final String createdAt;

  Order({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.urgency,
    required this.budget,
    required this.finalPrice,
    required this.isPaid,
    required this.isRated,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.apartment,
    required this.createdAt,
    this.preferredDate,
    this.preferredTime,
  });

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json['id'] as String,
        title: (json['title'] ?? '') as String,
        description: (json['description'] ?? '') as String,
        status: (json['status'] ?? 'pending') as String,
        urgency: (json['urgency'] ?? 'normal') as String,
        budget: double.tryParse(json['budget']?.toString() ?? '0') ?? 0,
        finalPrice: double.tryParse(json['final_price']?.toString() ?? '0') ?? 0,
        isPaid: json['is_paid'] as bool? ?? false,
        isRated: json['is_rated'] as bool? ?? false,
        address: (json['address'] ?? '') as String,
        latitude: double.tryParse(json['latitude']?.toString() ?? '0') ?? 0,
        longitude: double.tryParse(json['longitude']?.toString() ?? '0') ?? 0,
        apartment: (json['apartment'] ?? '') as String,
        preferredDate: json['preferred_date'] as String?,
        preferredTime: json['preferred_time'] as String?,
        createdAt: (json['created_at'] ?? '') as String,
      );
}
