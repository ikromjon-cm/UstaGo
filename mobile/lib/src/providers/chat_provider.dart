import 'package:flutter/foundation.dart';
import '../models/message.dart';
import '../services/api_client.dart';

class ChatProvider extends ChangeNotifier {
  final List<ChatRoom> _rooms = [];
  bool _loading = false;

  List<ChatRoom> get rooms => _rooms;
  bool get loading => _loading;

  Future<void> loadRooms() async {
    _loading = true;
    notifyListeners();
    try {
      final data = await ApiClient.get('/chat/rooms/');
      final results = data is Map<String, dynamic>
          ? (data['results'] as List<dynamic>? ?? <dynamic>[])
          : (data as List<dynamic>? ?? <dynamic>[]);
      _rooms.clear();
      _rooms.addAll(results.map((r) => ChatRoom.fromJson(r as Map<String, dynamic>)));
    } catch (_) {}
    _loading = false;
    notifyListeners();
  }

  Future<void> sendMessage(String roomId, String content) async {
    try {
      await ApiClient.post('/chat/rooms/$roomId/send/', body: {
        'content': content,
        'message_type': 'text',
      });
      notifyListeners();
    } catch (_) {}
  }
}
