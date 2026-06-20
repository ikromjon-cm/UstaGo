class Category {
  final String id;
  final String titleUz;
  final String titleRu;
  final String titleEn;
  final String? icon;
  final int serviceCount;

  Category({
    required this.id,
    required this.titleUz,
    required this.titleRu,
    required this.titleEn,
    this.icon,
    this.serviceCount = 0,
  });

  factory Category.fromJson(Map<String, dynamic> json) => Category(
    id: json['id'],
    titleUz: json['title_uz'],
    titleRu: json['title_ru'],
    titleEn: json['title_en'],
    icon: json['icon'],
    serviceCount: json['service_count'] ?? 0,
  );
}
