import 'api_client.dart';
import '../models/category.dart';

class CategoryService {
  static Future<List<Category>> getCategories() async {
    final data = await ApiClient.get('/categories/');
    final results = data['results'] as List? ?? [];
    return results.map((e) => Category.fromJson(e)).toList();
  }

  static Future<List<Category>> getFeatured() async {
    final data = await ApiClient.get('/categories/featured/');
    final results = data as List? ?? [];
    return results.map((e) => Category.fromJson(e)).toList();
  }
}
