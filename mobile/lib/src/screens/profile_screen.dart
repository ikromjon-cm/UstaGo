import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const SizedBox(height: 20),
            CircleAvatar(radius: 50, backgroundColor: Theme.of(context).primaryColor, child: Text(user?.fullName[0] ?? 'U', style: const TextStyle(fontSize: 40, color: Colors.white))),
            const SizedBox(height: 16),
            Text(user?.fullName ?? 'User', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(user?.phone ?? '', style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 32),
            _menuItem(context, Icons.person, 'Edit Profile', () {}),
            _menuItem(context, Icons.settings, 'Settings', () => Navigator.pushNamed(context, '/settings')),
            _menuItem(context, Icons.language, 'Language', () {}),
            _menuItem(context, Icons.logout, 'Logout', () => auth.logout()),
          ],
        ),
      ),
    );
  }

  Widget _menuItem(BuildContext context, IconData icon, String label, VoidCallback onTap) => ListTile(
    leading: Icon(icon),
    title: Text(label),
    trailing: const Icon(Icons.chevron_right),
    onTap: onTap,
  );
}
