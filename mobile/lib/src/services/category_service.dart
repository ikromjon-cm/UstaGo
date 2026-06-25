import 'api_client.dart';
import '../models/category.dart';
import '../models/service.dart';

class CategoryService {
  static Future<List<Category>> getCategories() async {
    final data = await ApiClient.get('/categories/');
    final results = data is Map<String, dynamic>
        ? (data['results'] as List? ?? <dynamic>[])
        : (data as List? ?? <dynamic>[]);
    return results.map((e) => Category.fromJson(e as Map<String, dynamic>)).toList();
  }

  static Future<List<Category>> getFeatured() async {
    final data = await ApiClient.get('/categories/featured/');
    final results = data as List? ?? [];
    return results.map((e) => Category.fromJson(e as Map<String, dynamic>)).toList();
  }

  static Future<List<ServiceItem>> getServices(String categoryId) async {
    final data = await ApiClient.get('/categories/$categoryId/services/');
    final results = data is Map<String, dynamic>
        ? (data['results'] as List? ?? <dynamic>[])
        : (data as List? ?? <dynamic>[]);
    return results.map((e) => ServiceItem.fromJson(e as Map<String, dynamic>)).toList();
  }
}
