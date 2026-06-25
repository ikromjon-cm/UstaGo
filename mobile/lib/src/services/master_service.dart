import 'api_client.dart';
import '../models/master.dart';

class MasterService {
  static Future<List<Master>> getMasters({String? categoryId, double? lat, double? lng}) async {
    final params = <String, String>{};
    if (categoryId != null) params['categories'] = categoryId;
    dynamic data;
    if (lat != null && lng != null) {
      params['lat'] = lat.toString();
      params['lng'] = lng.toString();
      if (categoryId != null) params['category'] = categoryId;
      data = await ApiClient.get('/masters/nearby/', params: params);
    } else {
      data = await ApiClient.get('/masters/', params: params.isEmpty ? null : params);
    }
    final results = data is Map<String, dynamic>
        ? (data['results'] as List? ?? <dynamic>[])
        : (data as List? ?? <dynamic>[]);
    return results.map((e) => Master.fromJson(e as Map<String, dynamic>)).toList();
  }

  static Future<Master> getMaster(String id) async {
    final data = await ApiClient.get('/masters/$id/');
    return Master.fromJson(data as Map<String, dynamic>);
  }

  static Future<Master> getMyProfile() async {
    final data = await ApiClient.get('/masters/me/');
    return Master.fromJson(data as Map<String, dynamic>);
  }
}
