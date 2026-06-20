import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/chat_provider.dart';
import '../services/api_client.dart';

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

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  Future<void> _loadMessages() async {
    try {
      final data = await ApiClient.get('/chat/rooms/${widget.roomId}/messages/');
      final results = data['results'] as List? ?? data as List? ?? [];
      if (mounted) {
        setState(() {
          _messages.addAll(results.cast<Map<String, dynamic>>());
          _loading = false;
        });
        Future.delayed(const Duration(milliseconds: 100), () {
          if (_scrollCtl.hasClients) {
            _scrollCtl.animateTo(_scrollCtl.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
          }
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _send() async {
    if (_msgCtl.text.trim().isEmpty) return;
    final text = _msgCtl.text;
    _msgCtl.clear();
    setState(() => _messages.add({'content': text, 'is_me': true}));
    try {
      await context.read<ChatProvider>().sendMessage(widget.roomId, text);
    } catch (_) {}
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollCtl.hasClients) {
        _scrollCtl.animateTo(_scrollCtl.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
      }
    });
  }

  @override
  void dispose() {
    _msgCtl.dispose();
    _scrollCtl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chat')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
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
                          itemCount: _messages.length,
                          itemBuilder: (ctx, i) {
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
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: Theme.of(context).scaffoldBackgroundColor, boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10),
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
}
