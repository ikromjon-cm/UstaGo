import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  String? _accessToken;
  bool _loading = false;

  User? get user => _user;
  String? get accessToken => _accessToken;
  bool get isAuthenticated => _user != null && _accessToken != null;
  bool get loading => _loading;
  bool get isMaster => _user?.role == 'master';

  AuthProvider() {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');
    if (token != null) {
      _accessToken = token;
      try {
        _user = await AuthService.getProfile();
      } catch (e) {
        debugPrint('Failed to load profile: $e');
      }
      notifyListeners();
    }
  }

  Future<void> login(String phone, String password) async {
    _loading = true;
    notifyListeners();
    try {
      _user = await AuthService.login(phone, password);
      _accessToken = (await SharedPreferences.getInstance()).getString('access_token');
    } catch (e) {
      debugPrint('Login error: $e');
      rethrow;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> register(Map<String, dynamic> body) async {
    _loading = true;
    notifyListeners();
    try {
      _user = await AuthService.register(body);
      _accessToken = (await SharedPreferences.getInstance()).getString('access_token');
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await AuthService.logout();
    _user = null;
    _accessToken = null;
    notifyListeners();
  }
}
