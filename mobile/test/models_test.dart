import 'package:flutter_test/flutter_test.dart';
import 'package:ustago/src/models/user.dart';
import 'package:ustago/src/models/master.dart';
import 'package:ustago/src/models/category.dart';
import 'package:ustago/src/models/order.dart';
import 'package:ustago/src/models/message.dart';
import 'package:ustago/src/models/notification.dart';

void main() {
  group('User model', () {
    test('fromJson parses full user', () {
      final json = {
        'id': 'u1',
        'phone': '+998901234567',
        'full_name': 'Ali',
        'avatar': 'https://example.com/ava.jpg',
        'role': 'master',
        'status': 'active',
        'lang': 'uz',
      };
      final user = User.fromJson(json);
      expect(user.fullName, 'Ali');
      expect(user.role, 'master');
      expect(user.lang, 'uz');
    });

    test('fromJson fills defaults for missing fields', () {
      final json = {'id': 'u2', 'phone': '+998901234568', 'full_name': 'Vali'};
      final user = User.fromJson(json);
      expect(user.role, 'customer');
      expect(user.status, 'active');
      expect(user.lang, 'uz');
    });

    test('toJson serializes correctly', () {
      final user = User(id: 'u3', phone: '+998901234569', fullName: 'Sali', role: 'admin', lang: 'ru');
      final map = user.toJson();
      expect(map['full_name'], 'Sali');
      expect(map['role'], 'admin');
    });
  });

  group('Master model', () {
    test('fromJson parses full master', () {
      final json = {
        'id': 'm1',
        'user_detail': {'full_name': 'Bek', 'avatar': 'https://example.com/ava.jpg'},
        'rating': '4.5',
        'rating_count': 12,
        'completed_jobs': 50,
        'is_online': true,
        'is_verified': true,
        'price_per_hour': '80000',
        'distance': '2.3',
      };
      final master = Master.fromJson(json);
      expect(master.fullName, 'Bek');
      expect(master.rating, 4.5);
      expect(master.isOnline, true);
      expect(master.pricePerHour, 80000);
    });

    test('fromJson falls back to user field', () {
      final json = {'id': 'm2', 'user': 'Fallback Name'};
      final master = Master.fromJson(json);
      expect(master.fullName, 'Fallback Name');
    });

    test('fromJson handles null numeric fields', () {
      final json = {'id': 'm3', 'user_detail': {'full_name': 'Test'}};
      final master = Master.fromJson(json);
      expect(master.rating, 0);
      expect(master.distance, null);
    });
  });

  group('Category model', () {
    test('fromJson with all fields', () {
      final json = {
        'id': 'c1',
        'title_uz': 'Elektrik',
        'title_ru': 'Электрик',
        'title_en': 'Electrician',
        'icon': '⚡',
        'service_count': 5,
      };
      final cat = Category.fromJson(json);
      expect(cat.titleUz, 'Elektrik');
      expect(cat.icon, '⚡');
      expect(cat.serviceCount, 5);
    });
  });

  group('Order model', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 'o1',
        'title': 'Fix pipe',
        'description': 'Kitchen leaking',
        'status': 'in_progress',
        'budget': '150000',
        'address': 'Chilonzor',
        'created_at': '2025-06-01T10:00:00Z',
      };
      final order = Order.fromJson(json);
      expect(order.title, 'Fix pipe');
      expect(order.budget, 150000);
      expect(order.status, 'in_progress');
    });
  });

  group('Message/ChatRoom model', () {
    test('Message fromJson', () {
      final json = {
        'id': 'msg1',
        'content': 'Salom',
        'sender': 'u1',
        'sender_detail': {'full_name': 'Ali'},
        'message_type': 'text',
        'is_read': true,
        'created_at': '2025-06-01T12:00:00Z',
      };
      final msg = Message.fromJson(json);
      expect(msg.content, 'Salom');
      expect(msg.senderName, 'Ali');
      expect(msg.isRead, true);
    });

    test('ChatRoom fromJson', () {
      final json = {
        'id': 'room1',
        'last_message': {'content': 'Last msg'},
        'unread_count': 3,
        'updated_at': '2025-06-01T12:00:00Z',
      };
      final room = ChatRoom.fromJson(json);
      expect(room.lastMessage, 'Last msg');
      expect(room.unreadCount, 3);
    });
  });

  group('AppNotification model', () {
    test('fromJson with all fields', () {
      final json = {
        'id': 'n1',
        'type': 'order_update',
        'title': 'Order updated',
        'body': 'Status changed',
        'is_read': false,
        'created_at': '2025-06-01',
      };
      final notif = AppNotification.fromJson(json);
      expect(notif.type, 'order_update');
      expect(notif.body, 'Status changed');
    });
  });
}
