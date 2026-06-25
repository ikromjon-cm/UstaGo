import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiClient {
  static String get baseUrl {
    const defaultUrl = 'http://10.0.2.2:8000/api/v1';
    const compileTimeUrl = String.fromEnvironment('API_URL');
    final dotenvUrl = dotenv.maybeGet('API_URL');
    if (compileTimeUrl.isNotEmpty) return compileTimeUrl;
    if (dotenvUrl != null && dotenvUrl.isNotEmpty) return dotenvUrl;
    if (kReleaseMode) return 'https://ustago-backend.onrender.com/api/v1';
    return defaultUrl;
  }
  static const Duration timeout = Duration(seconds: 30);

  static Future<Map<String, String>> _headers() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<dynamic> get(String path, {Map<String, String>? params}) async {
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: params);
    final resp = await http.get(uri, headers: await _headers()).timeout(timeout);
    return _handle(resp);
  }

  static Future<dynamic> post(String path, {Map<String, dynamic>? body}) async {
    final resp = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: await _headers(),
      body: body != null ? jsonEncode(body) : null,
    ).timeout(timeout);
    return _handle(resp);
  }

  static Future<dynamic> put(String path, {Map<String, dynamic>? body}) async {
    final resp = await http.put(
      Uri.parse('$baseUrl$path'),
      headers: await _headers(),
      body: body != null ? jsonEncode(body) : null,
    ).timeout(timeout);
    return _handle(resp);
  }

  static Future<dynamic> patch(String path, {Map<String, dynamic>? body}) async {
    final resp = await http.patch(
      Uri.parse('$baseUrl$path'),
      headers: await _headers(),
      body: body != null ? jsonEncode(body) : null,
    ).timeout(timeout);
    return _handle(resp);
  }

  static Future<dynamic> delete(String path) async {
    final resp = await http.delete(Uri.parse('$baseUrl$path'), headers: await _headers()).timeout(timeout);
    return _handle(resp);
  }

  static dynamic _handle(http.Response resp) {
    final decoded = resp.body.isEmpty ? null : jsonDecode(resp.body);
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      return decoded is List || decoded is Map<String, dynamic> ? decoded : <String, dynamic>{};
    }
    if (decoded is Map<String, dynamic>) {
      throw ApiException(resp.statusCode, decoded['detail'] ?? decoded['message'] ?? decoded['error'] ?? 'Unknown error');
    }
    throw ApiException(resp.statusCode, 'Unknown error');
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);
  @override
  String toString() => 'ApiException($statusCode): $message';
}
