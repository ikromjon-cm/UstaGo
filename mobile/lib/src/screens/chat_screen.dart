import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/chat_provider.dart';
import '../services/api_client.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});
  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        await ApiClient.get('/chat/rooms/');
        if (mounted) context.read<ChatProvider>().loadRooms();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Xatolik: $e")));
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final chat = context.watch<ChatProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Chats')),
      body: chat.loading
          ? const Center(child: CircularProgressIndicator())
          : chat.rooms.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.chat_bubble_outline, size: 64, color: Colors.grey.shade300),
                      const SizedBox(height: 16),
                      const Text('No conversations yet', style: TextStyle(color: Colors.grey, fontSize: 16)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => chat.loadRooms(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: chat.rooms.length,
                    itemBuilder: (ctx, i) {
                    final room = chat.rooms[i];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Theme.of(context).primaryColor,
                          child: Text(room.id.substring(0, 2).toUpperCase(),
                              style: const TextStyle(color: Colors.white)),
                        ),
                        title: Text('Room ${room.id.substring(0, 6)}', style: const TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text(room.lastMessage ?? 'No messages', maxLines: 1, overflow: TextOverflow.ellipsis),
                        trailing: room.unreadCount > 0
                            ? Badge(label: Text('${room.unreadCount}'))
                            : null,
                        onTap: () => Navigator.pushNamed(context, '/chat/${room.id}'),
                      ),
                    );
                    },
                  ),
                ),
    );
  }
}
