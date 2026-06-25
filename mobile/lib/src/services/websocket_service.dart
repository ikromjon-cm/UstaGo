import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_client.dart';

enum WsConnectionState { disconnected, connecting, connected, reconnecting }

class WebSocketService {
  WebSocketChannel? _channel;
  Timer? _reconnectTimer;
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 10;
  static const Duration _initialDelay = Duration(seconds: 1);
  static const Duration _maxDelay = Duration(seconds: 30);

  final Uri Function(String roomId, String token) _urlBuilder;
  final Future<String?> Function() _tokenProvider;

  String? _currentRoomId;
  void Function(Map<String, dynamic>)? _onMessage;
  void Function(WsConnectionState)? _onStateChange;
  WsConnectionState _state = WsConnectionState.disconnected;

  WsConnectionState get state => _state;

  WebSocketService({
    Uri Function(String roomId, String token)? urlBuilder,
    Future<String?> Function()? tokenProvider,
  })  : _urlBuilder = urlBuilder ?? _defaultUrlBuilder,
        _tokenProvider = tokenProvider ?? _defaultTokenProvider;

  static Uri _defaultUrlBuilder(String roomId, String token) {
    final host = ApiClient.baseUrl
        .replaceFirst('https://', '')
        .replaceFirst('http://', '')
        .split('/')
        .first;
    final scheme = ApiClient.baseUrl.startsWith('https') ? 'wss' : 'ws';
    return Uri.parse('$scheme://$host/ws/chat/$roomId/?token=$token');
  }

  static Future<String?> _defaultTokenProvider() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }

  Future<void> connect(
    String roomId, {
    void Function(Map<String, dynamic>)? onMessage,
    void Function(WsConnectionState)? onStateChange,
  }) async {
    _currentRoomId = roomId;
    _onMessage = onMessage;
    _onStateChange = onStateChange;
    _reconnectAttempts = 0;
    await _connect();
  }

  Future<void> _connect() async {
    if (_currentRoomId == null) return;

    _setState(WsConnectionState.connecting);
    final token = await _tokenProvider();
    if (token == null) {
      _setState(WsConnectionState.disconnected);
      return;
    }

    try {
      final uri = _urlBuilder(_currentRoomId!, token);
      _channel = WebSocketChannel.connect(uri);
      await _channel!.ready;
      _reconnectAttempts = 0;
      _setState(WsConnectionState.connected);
      _channel!.stream.listen(
        (data) {
          final msg = jsonDecode(data as String) as Map<String, dynamic>;
          _onMessage?.call(msg);
        },
        onError: (error) {
          debugPrint('WebSocket error: $error');
          _scheduleReconnect();
        },
        onDone: () {
          debugPrint('WebSocket closed');
          _scheduleReconnect();
        },
        cancelOnError: false,
      );
    } catch (e) {
      debugPrint('WebSocket connection failed: $e');
      _scheduleReconnect();
    }
  }

  void _scheduleReconnect() {
    if (_currentRoomId == null) return;
    if (_reconnectAttempts >= _maxReconnectAttempts) {
      _setState(WsConnectionState.disconnected);
      return;
    }
    _setState(WsConnectionState.reconnecting);
    final delay = Duration(
      milliseconds: (_initialDelay.inMilliseconds *
              (1 << _reconnectAttempts))
          .clamp(0, _maxDelay.inMilliseconds),
    );
    _reconnectAttempts++;
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(delay, _connect);
  }

  void send(Map<String, dynamic> data) {
    if (_channel != null && _state == WsConnectionState.connected) {
      _channel!.sink.add(jsonEncode(data));
    }
  }

  void sendMessage(String content, {String messageType = 'text'}) {
    send({'type': 'message', 'content': content, 'message_type': messageType});
  }

  void sendTyping(bool isTyping) {
    send({'type': 'typing', 'is_typing': isTyping});
  }

  void markRead(String messageId) {
    send({'type': 'read', 'message_id': messageId});
  }

  void _setState(WsConnectionState newState) {
    _state = newState;
    _onStateChange?.call(newState);
  }

  void disconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    _currentRoomId = null;
    _onMessage = null;
    _onStateChange = null;
    _channel?.sink.close();
    _channel = null;
    _setState(WsConnectionState.disconnected);
  }
}
