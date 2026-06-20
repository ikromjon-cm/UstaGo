import 'package:flutter/foundation.dart';
import '../models/category.dart';
import '../services/category_service.dart';

class CategoryProvider extends ChangeNotifier {
  List<Category> _categories = [];
  bool _loading = false;

  List<Category> get categories => _categories;
  bool get loading => _loading;

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
}
