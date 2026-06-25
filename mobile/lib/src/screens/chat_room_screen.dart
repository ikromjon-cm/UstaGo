import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/chat_provider.dart';
import '../services/api_client.dart';
import '../services/websocket_service.dart';

class ChatRoomScreen extends StatefulWidget {
  final String roomId;
  const ChatRoomScreen({super.key, required this.roomId});
  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  final _msgCtl = TextEditingController();
  final _scrollCtl = ScrollController();
  final List<Map<String, dynamic>> _messages = [];
  bool _loading = true;
  WsConnectionState _wsState = WsConnectionState.disconnected;
  final WebSocketService _wsService = WebSocketService();
  bool _otherTyping = false;
  String _typingName = '';

  @override
  void initState() {
    super.initState();
    _loadMessages();
    _connectWs();
  }

  void _connectWs() {
    _wsService.connect(
      widget.roomId,
      onMessage: _handleWsMessage,
      onStateChange: (state) {
        if (mounted) setState(() => _wsState = state);
      },
    );
  }

  void _handleWsMessage(Map<String, dynamic> msg) {
    if (!mounted) return;
    final type = msg['type'] as String?;
    switch (type) {
      case 'new_message':
        final senderId = msg['sender_id'] as String?;
        setState(() {
          _messages.add({
            'id': msg['message_id'],
            'content': msg['content'],
            'message_type': msg['message_type'],
            'sender_id': senderId,
            'sender_detail': {
              'id': senderId,
              'full_name': msg['sender_name'],
              'avatar': msg['sender_avatar'],
            },
            'created_at': msg['created_at'],
            'is_me': false,
            'file': msg['file'],
            'image': msg['image'],
          });
        });
        _scrollToBottom();
      case 'typing':
        setState(() {
          _otherTyping = msg['is_typing'] as bool;
          _typingName = msg['full_name'] as String? ?? '';
        });
      case 'message_read':
        break;
      case 'user_online':
      case 'user_offline':
        break;
    }
  }

  Future<void> _loadMessages() async {
    try {
      final data = await ApiClient.get('/chat/rooms/${widget.roomId}/messages/');
      final results = data is Map<String, dynamic>
          ? (data['results'] as List? ?? <dynamic>[])
          : (data as List? ?? <dynamic>[]);
      if (mounted) {
        setState(() {
          _messages.addAll(results.cast<Map<String, dynamic>>());
          _loading = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Xatolik: $e")));
      }
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollCtl.hasClients) {
        _scrollCtl.animateTo(
          _scrollCtl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _send() async {
    if (_msgCtl.text.trim().isEmpty) return;
    final text = _msgCtl.text;
    _msgCtl.clear();
    _wsService.sendTyping(false);
    setState(() => _messages.add({'content': text, 'is_me': true}));
    _scrollToBottom();
    try {
      await context.read<ChatProvider>().sendMessage(widget.roomId, text);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Xabar yuborish xatolik: $e")));
      }
    }
  }

  void _onTyping(String val) {
    _wsService.sendTyping(val.isNotEmpty);
  }

  @override
  void dispose() {
    _wsService.disconnect();
    _msgCtl.dispose();
    _scrollCtl.dispose();
    super.dispose();
  }

  Widget _buildStatusBanner() {
    if (_wsState == WsConnectionState.connected) return const SizedBox.shrink();
    final isReconnecting = _wsState == WsConnectionState.reconnecting;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      color: isReconnecting ? Colors.orange.shade100 : Colors.red.shade100,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 14,
            height: 14,
            child: isReconnecting
                ? CircularProgressIndicator(strokeWidth: 2, color: Colors.orange.shade800)
                : Icon(Icons.cloud_off, size: 14, color: Colors.red.shade800),
          ),
          const SizedBox(width: 8),
          Text(
            isReconnecting ? 'Reconnecting...' : 'Disconnected',
            style: TextStyle(fontSize: 12, color: isReconnecting ? Colors.orange.shade800 : Colors.red.shade800),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chat')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                _buildStatusBanner(),
                Expanded(
                  child: _messages.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.chat_bubble_outline, size: 48, color: Colors.grey.shade300),
                              const SizedBox(height: 12),
                              const Text('No messages yet. Say hello!', style: TextStyle(color: Colors.grey)),
                            ],
                          ),
                        )
                      : ListView.builder(
                          controller: _scrollCtl,
                          padding: const EdgeInsets.all(16),
                          itemCount: _messages.length + (_otherTyping ? 1 : 0),
                          itemBuilder: (ctx, i) {
                            if (_otherTyping && i == _messages.length) {
                              return _buildTypingIndicator();
                            }
                            final msg = _messages[i];
                            final isMe = msg['is_me'] == true || msg['sender_detail']?['id'] == 'me';
                            return Align(
                              alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                                decoration: BoxDecoration(
                                  color: isMe ? Theme.of(context).primaryColor : Colors.grey.shade200,
                                  borderRadius: BorderRadius.only(
                                    topLeft: const Radius.circular(16),
                                    topRight: const Radius.circular(16),
                                    bottomLeft: isMe ? const Radius.circular(16) : Radius.zero,
                                    bottomRight: isMe ? Radius.zero : const Radius.circular(16),
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(msg['content'] ?? '', style: TextStyle(color: isMe ? Colors.white : Colors.black87, fontSize: 15)),
                                    const SizedBox(height: 2),
                                    Text(
                                      msg['created_at'] != null ? msg['created_at'].toString().substring(11, 16) : '',
                                      style: TextStyle(fontSize: 10, color: isMe ? Colors.white60 : Colors.grey.shade500),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
                if (_otherTyping && _messages.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.only(left: 16, bottom: 4),
                    alignment: Alignment.centerLeft,
                    child: Text(
                      '$_typingName typing...',
                      style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                    ),
                  ),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: Theme.of(context).scaffoldBackgroundColor, boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10),
                  ]),
                  child: SafeArea(
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _msgCtl,
                            decoration: InputDecoration(
                              hintText: 'Type a message...',
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              filled: true,
                              fillColor: Colors.grey.shade100,
                            ),
                            onChanged: _onTyping,
                            onSubmitted: (_) => _send(),
                          ),
                        ),
                        const SizedBox(width: 8),
                        CircleAvatar(
                          backgroundColor: Theme.of(context).primaryColor,
                          child: IconButton(
                            icon: const Icon(Icons.send, color: Colors.white, size: 18),
                            onPressed: _send,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.grey.shade200,
          borderRadius: const BorderRadius.all(Radius.circular(16)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (i) {
            return TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.3, end: 1.0),
              duration: Duration(milliseconds: 600 + i * 200),
              builder: (ctx, val, _) => Container(
                margin: const EdgeInsets.symmetric(horizontal: 2),
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: Colors.grey.shade500.withValues(alpha: val),
                  shape: BoxShape.circle,
                ),
              ),
              onEnd: () {},
            );
          }),
        ),
      ),
    );
  }
}
