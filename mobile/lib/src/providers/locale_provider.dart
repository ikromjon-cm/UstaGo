import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocaleProvider extends ChangeNotifier {
  Locale _locale = const Locale('uz', 'UZ');

  Locale get locale => _locale;

  LocaleProvider() {
    _loadLocale();
  }

  Future<void> _loadLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString('language') ?? 'uz';
    _locale = Locale(code, code == 'uz' ? 'UZ' : code == 'ru' ? 'RU' : 'US');
    notifyListeners();
  }

  Future<void> setLocale(String code) async {
    _locale = Locale(code, code == 'uz' ? 'UZ' : code == 'ru' ? 'RU' : 'US');
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language', code);
    notifyListeners();
  }
}
