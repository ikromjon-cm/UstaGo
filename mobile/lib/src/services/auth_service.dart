import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import 'api_client.dart';

class AuthService {
  static Future<User> login(String phone, String password) async {
    final data = await ApiClient.post('/auth/login/', body: {
      'phone': phone,
      'password': password,
    });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', data['access']);
    await prefs.setString('refresh_token', data['refresh']);
    return User.fromJson(data['user']);
  }

  static Future<User> register(Map<String, dynamic> body) async {
    final data = await ApiClient.post('/auth/register/', body: body);
    final prefs = await SharedPreferences.getInstance();
    if (data.containsKey('access')) {
      await prefs.setString('access_token', data['access']);
      await prefs.setString('refresh_token', data['refresh']);
    }
    return User.fromJson(data['user'] ?? data);
  }

  static Future<void> sendOtp(String phone) async {
    await ApiClient.post('/auth/send-otp/', body: {'phone': phone});
  }

  static Future<User> verifyOtp(String phone, String otp) async {
    final data = await ApiClient.post('/auth/verify-otp/', body: {
      'phone': phone,
      'otp': otp,
    });
    final prefs = await SharedPreferences.getInstance();
    if (data.containsKey('access')) {
      await prefs.setString('access_token', data['access']);
      await prefs.setString('refresh_token', data['refresh']);
    }
    return User.fromJson(data['user']);
  }

  static Future<User> getProfile() async {
    final data = await ApiClient.get('/auth/profile/');
    return User.fromJson(data);
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('refresh_token');
  }

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey('access_token');
  }
}
