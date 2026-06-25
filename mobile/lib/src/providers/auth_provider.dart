import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/secure_storage.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  String? _accessToken;
  bool _loading = false;
  bool _initialized = false;

  User? get user => _user;
  String? get accessToken => _accessToken;
  bool get isAuthenticated => _user != null && _accessToken != null;
  bool get loading => _loading;
  bool get isMaster => _user?.role == 'master';
  bool get initialized => _initialized;

  AuthProvider() {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    final token = await SecureStorage.getAccessToken();
    if (token != null) {
      _accessToken = token;
      try {
        _user = await AuthService.getProfile();
      } catch (e) {
        debugPrint('Failed to load profile: $e');
        await AuthService.logout();
        _accessToken = null;
        _user = null;
      }
    }
    _initialized = true;
    notifyListeners();
  }

  Future<void> login(String phone, String password) async {
    _loading = true;
    notifyListeners();
    try {
      _user = await AuthService.login(phone, password);
      _accessToken = await SecureStorage.getAccessToken();
    } catch (e) {
      debugPrint('Login error: $e');
      rethrow;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<User> register(Map<String, dynamic> body) async {
    _loading = true;
    notifyListeners();
    try {
      final user = await AuthService.register(body);
      _user = user;
      _accessToken = await SecureStorage.getAccessToken();
      return user;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> refreshProfile() async {
    if (_accessToken == null) return;
    _user = await AuthService.getProfile();
    notifyListeners();
  }

  Future<User> updateProfile(Map<String, dynamic> body) async {
    final user = await AuthService.updateProfile(body);
    _user = user;
    notifyListeners();
    return user;
  }

  Future<void> logout() async {
    await AuthService.logout();
    _user = null;
    _accessToken = null;
    notifyListeners();
  }
}
