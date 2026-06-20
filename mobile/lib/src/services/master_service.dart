import 'api_client.dart';
import '../models/master.dart';

class MasterService {
  static Future<List<Master>> getMasters({String? categoryId, double? lat, double? lng}) async {
    final params = <String, String>{};
    if (categoryId != null) params['category'] = categoryId;
    if (lat != null) params['latitude'] = lat.toString();
    if (lng != null) params['longitude'] = lng.toString();
    final data = await ApiClient.get('/masters/', params: params);
    final results = data['results'] as List? ?? [];
    return results.map((e) => Master.fromJson(e)).toList();
  }

  static Future<Master> getMaster(String id) async {
    final data = await ApiClient.get('/masters/$id/');
    return Master.fromJson(data);
  }
}
