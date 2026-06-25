import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'secure_storage.dart';

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
    final token = await SecureStorage.getAccessToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<dynamic> get(String path, {Map<String, String>? params}) async {
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: params);
    final resp = await http.get(uri, headers: await _headers()).timeout(timeout);
    return _handle(resp, originalPath: path, originalParams: params, originalMethod: 'get');
  }

  static Future<dynamic> post(String path, {Map<String, dynamic>? body}) async {
    final resp = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: await _headers(),
      body: body != null ? jsonEncode(body) : null,
    ).timeout(timeout);
    return _handle(resp, originalPath: path, originalMethod: 'post', originalBody: body);
  }

  static Future<dynamic> put(String path, {Map<String, dynamic>? body}) async {
    final resp = await http.put(
      Uri.parse('$baseUrl$path'),
      headers: await _headers(),
      body: body != null ? jsonEncode(body) : null,
    ).timeout(timeout);
    return _handle(resp, originalPath: path, originalMethod: 'put', originalBody: body);
  }

  static Future<dynamic> patch(String path, {Map<String, dynamic>? body}) async {
    final resp = await http.patch(
      Uri.parse('$baseUrl$path'),
      headers: await _headers(),
      body: body != null ? jsonEncode(body) : null,
    ).timeout(timeout);
    return _handle(resp, originalPath: path, originalMethod: 'patch', originalBody: body);
  }

  static Future<dynamic> delete(String path) async {
    final resp = await http.delete(Uri.parse('$baseUrl$path'), headers: await _headers()).timeout(timeout);
    return _handle(resp, originalPath: path, originalMethod: 'delete');
  }

  static Future<dynamic> _handle(http.Response resp, {String? originalPath, Map<String, String>? originalParams, String? originalMethod, Map<String, dynamic>? originalBody}) async {
    final decoded = resp.body.isEmpty ? null : jsonDecode(resp.body);
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      return decoded is List || decoded is Map<String, dynamic> ? decoded : <String, dynamic>{};
    }
    if (resp.statusCode == 401 && originalPath != null) {
      final refreshToken = await SecureStorage.getRefreshToken();
      if (refreshToken != null) {
        try {
          final refreshResp = await http.post(
            Uri.parse('$baseUrl/auth/refresh/'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'refresh': refreshToken}),
          ).timeout(timeout);
          if (refreshResp.statusCode == 200) {
            final refreshData = jsonDecode(refreshResp.body);
            final newAccess = refreshData['access'] as String;
            await SecureStorage.saveTokens(newAccess, refreshToken);
            final retryHeaders = await _headers();
            http.Response retryResp;
            switch (originalMethod) {
              case 'get':
                final uri = Uri.parse('$baseUrl$originalPath').replace(queryParameters: originalParams);
                retryResp = await http.get(uri, headers: retryHeaders).timeout(timeout);
                break;
              case 'post':
                retryResp = await http.post(Uri.parse('$baseUrl$originalPath'), headers: retryHeaders, body: originalBody != null ? jsonEncode(originalBody) : null).timeout(timeout);
                break;
              case 'patch':
                retryResp = await http.patch(Uri.parse('$baseUrl$originalPath'), headers: retryHeaders, body: originalBody != null ? jsonEncode(originalBody) : null).timeout(timeout);
                break;
              case 'put':
                retryResp = await http.put(Uri.parse('$baseUrl$originalPath'), headers: retryHeaders, body: originalBody != null ? jsonEncode(originalBody) : null).timeout(timeout);
                break;
              case 'delete':
                retryResp = await http.delete(Uri.parse('$baseUrl$originalPath'), headers: retryHeaders).timeout(timeout);
                break;
              default:
                throw ApiException(resp.statusCode, 'Unknown method');
            }
            if (retryResp.statusCode >= 200 && retryResp.statusCode < 300) {
              final retryDecoded = retryResp.body.isEmpty ? null : jsonDecode(retryResp.body);
              return retryDecoded is List || retryDecoded is Map<String, dynamic> ? retryDecoded : <String, dynamic>{};
            }
          }
        } catch (_) {}
        await SecureStorage.clearTokens();
      }
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
