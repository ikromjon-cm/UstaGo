import 'package:flutter/material.dart';
import '../utils/theme.dart';
import '../models/category.dart';

IconData _categoryIcon(String? title) {
  final t = (title ?? '').toLowerCase();
  if (t.contains('plumb') || t.contains('santexnik') || t.contains('сантехник')) return Icons.plumbing;
  if (t.contains('electr') || t.contains('elektrik') || t.contains('электрик')) return Icons.electric_bolt;
  if (t.contains('clean') || t.contains('tozalash') || t.contains('уборк')) return Icons.cleaning_services;
  if (t.contains('repair') || t.contains("ta'mir") || t.contains('ремонт')) return Icons.build;
  if (t.contains('кондиционер') || t.contains('konditsioner')) return Icons.ac_unit;
  if (t.contains('строитель') || t.contains('quruv') || t.contains('qurilish')) return Icons.home_repair_service;
  if (t.contains('move') || t.contains('pereezd') || t.contains('ko\'chir')) return Icons.local_shipping;
  if (t.contains('beauty') || t.contains('go\'zallik') || t.contains('красот')) return Icons.face;
  return Icons.miscellaneous_services;
}

class CategoryCard extends StatelessWidget {
  final Category category;
  const CategoryCard({super.key, required this.category});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, '/masters', arguments: {'categoryId': category.id}),
      child: Container(
        width: 80,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(_categoryIcon(category.titleUz), color: AppTheme.primary, size: 22),
            ),
            const SizedBox(height: 6),
            Text(
              category.titleUz,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ),
    );
  }
}
