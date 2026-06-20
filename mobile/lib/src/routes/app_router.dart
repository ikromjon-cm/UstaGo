import 'package:flutter/material.dart';
import '../screens/splash_screen.dart';
import '../screens/login_screen.dart';
import '../screens/register_screen.dart';
import '../screens/home_screen.dart';
import '../screens/categories_screen.dart';
import '../screens/masters_screen.dart';
import '../screens/master_detail_screen.dart';
import '../screens/orders_screen.dart';
import '../screens/order_detail_screen.dart';
import '../screens/create_order_screen.dart';
import '../screens/chat_screen.dart';
import '../screens/chat_room_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/notifications_screen.dart';
import '../screens/favorites_screen.dart';
import '../screens/earnings_screen.dart';
import '../screens/master_dashboard_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/forgot_password_screen.dart';

class AppRouter {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/': return MaterialPageRoute(builder: (_) => const SplashScreen());
      case '/login': return MaterialPageRoute(builder: (_) => const LoginScreen());
      case '/register': return MaterialPageRoute(builder: (_) => const RegisterScreen());
      case '/home': return MaterialPageRoute(builder: (_) => const HomeScreen());
      case '/categories': return MaterialPageRoute(builder: (_) => const CategoriesScreen());
      case '/masters': return MaterialPageRoute(builder: (_) => const MastersScreen());
      case '/orders': return MaterialPageRoute(builder: (_) => const OrdersScreen());
      case '/create-order': return MaterialPageRoute(builder: (_) => const CreateOrderScreen());
      case '/chat': return MaterialPageRoute(builder: (_) => const ChatScreen());
      case '/profile': return MaterialPageRoute(builder: (_) => const ProfileScreen());
      case '/notifications': return MaterialPageRoute(builder: (_) => const NotificationsScreen());
      case '/favorites': return MaterialPageRoute(builder: (_) => const FavoritesScreen());
      case '/earnings': return MaterialPageRoute(builder: (_) => const EarningsScreen());
      case '/master-dashboard': return MaterialPageRoute(builder: (_) => const MasterDashboardScreen());
      case '/settings': return MaterialPageRoute(builder: (_) => const SettingsScreen());
      case '/forgot-password': return MaterialPageRoute(builder: (_) => const ForgotPasswordScreen());
      default:
        if (settings.name?.startsWith('/master/') == true) {
          final id = settings.name!.split('/').last;
          return MaterialPageRoute(builder: (_) => MasterDetailScreen(masterId: id));
        }
        if (settings.name?.startsWith('/order/') == true) {
          final id = settings.name!.split('/').last;
          return MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: id));
        }
        if (settings.name?.startsWith('/chat/') == true) {
          final id = settings.name!.split('/').last;
          return MaterialPageRoute(builder: (_) => ChatRoomScreen(roomId: id));
        }
        return MaterialPageRoute(builder: (_) => const SplashScreen());
    }
  }
}
