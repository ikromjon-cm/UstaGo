import '../models/user.dart';
import 'api_client.dart';
import 'secure_storage.dart';

class AuthService {
  static Future<User> login(String phone, String password) async {
    final data = await ApiClient.post('/auth/login/', body: {
      'phone': phone,
      'password': password,
    });
    await SecureStorage.saveTokens(data['access'], data['refresh']);
    return User.fromJson(data['user']);
  }

  static Future<User> register(Map<String, dynamic> body) async {
    final data = await ApiClient.post('/auth/register/', body: body);
    if (data.containsKey('access')) {
      await SecureStorage.saveTokens(data['access'], data['refresh']);
    }
    return User.fromJson(data['user'] ?? data);
  }

  static Future<void> sendOtp(String phone) async {
    await ApiClient.post('/auth/send_otp/', body: {'phone': phone});
  }

  static Future<void> verifyOtp(String phone, String otp) async {
    await ApiClient.post('/auth/verify_otp/', body: {
      'phone': phone,
      'otp': otp,
    });
  }

  static Future<User> getProfile() async {
    final data = await ApiClient.get('/auth/profile/');
    return User.fromJson(data);
  }

  static Future<User> updateProfile(Map<String, dynamic> body) async {
    final data = await ApiClient.patch('/users/me/', body: body);
    return User.fromJson(data as Map<String, dynamic>);
  }

  static Future<void> changePassword(String oldPassword, String newPassword) async {
    await ApiClient.post('/auth/change_password/', body: {
      'old_password': oldPassword,
      'new_password': newPassword,
    });
  }

  static Future<void> logout() async {
    await SecureStorage.clearTokens();
  }

  static Future<bool> isLoggedIn() async {
    final token = await SecureStorage.getAccessToken();
    return token != null;
  }
}
