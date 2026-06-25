import 'package:flutter/foundation.dart';
import '../models/category.dart' as models;
import '../models/service.dart';
import '../services/category_service.dart';

class CategoryProvider extends ChangeNotifier {
  List<models.Category> _categories = [];
  final Map<String, List<ServiceItem>> _servicesByCategory = {};
  bool _loading = false;

  List<models.Category> get categories => _categories;
  bool get loading => _loading;

  List<ServiceItem> servicesForCategory(String? categoryId) {
    if (categoryId == null) return const [];
    return _servicesByCategory[categoryId] ?? const [];
  }

  Future<void> loadCategories() async {
    _loading = true;
    notifyListeners();
    try {
      _categories = await CategoryService.getCategories();
    } catch (e) {
      debugPrint('Category load error: $e');
    }
    _loading = false;
    notifyListeners();
  }

  Future<void> loadServices(String categoryId) async {
    if (_servicesByCategory.containsKey(categoryId)) return;
    try {
      _servicesByCategory[categoryId] = await CategoryService.getServices(categoryId);
      notifyListeners();
    } catch (e) {
      debugPrint('Service load error: $e');
      _servicesByCategory[categoryId] = const [];
      notifyListeners();
    }
  }
}
