class ServiceItem {
  final String id;
  final String categoryId;
  final String titleUz;
  final String titleRu;
  final String titleEn;
  final String description;
  final double priceFrom;
  final double priceTo;
  final int durationMinutes;

  ServiceItem({
    required this.id,
    required this.categoryId,
    required this.titleUz,
    required this.titleRu,
    required this.titleEn,
    required this.description,
    required this.priceFrom,
    required this.priceTo,
    required this.durationMinutes,
  });

  String get displayTitle =>
      titleUz.isNotEmpty ? titleUz : (titleRu.isNotEmpty ? titleRu : titleEn);

  factory ServiceItem.fromJson(Map<String, dynamic> json) => ServiceItem(
        id: json['id'] as String,
        categoryId: json['category'] as String,
        titleUz: (json['title_uz'] ?? '') as String,
        titleRu: (json['title_ru'] ?? '') as String,
        titleEn: (json['title_en'] ?? '') as String,
        description: (json['description'] ?? '') as String,
        priceFrom: double.tryParse(json['price_from']?.toString() ?? '0') ?? 0,
        priceTo: double.tryParse(json['price_to']?.toString() ?? '0') ?? 0,
        durationMinutes: json['duration_minutes'] as int? ?? 0,
      );
}
