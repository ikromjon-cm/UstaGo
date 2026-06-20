class Order {
  final String id;
  final String title;
  final String description;
  final String status;
  final double budget;
  final String address;
  final String createdAt;

  Order({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.budget,
    required this.address,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) => Order(
    id: json['id'],
    title: json['title'],
    description: json['description'] ?? '',
    status: json['status'],
    budget: double.parse(json['budget']?.toString() ?? '0'),
    address: json['address'] ?? '',
    createdAt: json['created_at'],
  );
}
