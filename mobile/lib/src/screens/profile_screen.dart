import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../utils/theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  String _roleLabel(String role) {
    switch (role) {
      case 'master':
        return 'Master';
      case 'company':
        return 'Company';
      case 'admin':
        return 'Admin';
      case 'super_admin':
        return 'Super Admin';
      default:
        return 'Customer';
    }
  }

  Future<void> _logout(BuildContext context, AuthProvider auth) async {
    await auth.logout();
    if (!context.mounted) return;
    Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final isMaster = auth.isMaster;

    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Profile')),
        body: Center(
          child: ElevatedButton(
            onPressed: () => Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false),
            child: const Text('Go to login'),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            onPressed: () => Navigator.pushNamed(context, '/settings'),
            icon: const Icon(Icons.settings_outlined),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 44,
                  backgroundColor: AppTheme.primary.withValues(alpha: 0.12),
                  child: Text(
                    user.fullName.isNotEmpty ? user.fullName[0].toUpperCase() : 'U',
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primary,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  user.fullName,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                Text(user.phone, style: TextStyle(color: Colors.grey.shade600)),
                if (user.bio.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Text(
                    user.bio,
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey.shade700),
                  ),
                ],
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  alignment: WrapAlignment.center,
                  children: [
                    _InfoChip(label: _roleLabel(user.role), color: AppTheme.primary),
                    _InfoChip(
                      label: user.isPhoneVerified ? 'Phone Verified' : 'Phone Unverified',
                      color: user.isPhoneVerified ? Colors.green : Colors.orange,
                    ),
                    if (user.isIdentityVerified)
                      const _InfoChip(label: 'Identity Verified', color: Colors.green),
                    if (user.twoFactorEnabled)
                      const _InfoChip(label: '2FA Enabled', color: Colors.deepPurple),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            childAspectRatio: 1.45,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              _QuickActionCard(
                title: 'Settings',
                icon: Icons.settings_outlined,
                onTap: () => Navigator.pushNamed(context, '/settings'),
              ),
              _QuickActionCard(
                title: isMaster ? 'Earnings' : 'My Orders',
                icon: isMaster ? Icons.trending_up : Icons.assignment_outlined,
                onTap: () => Navigator.pushNamed(context, isMaster ? '/earnings' : '/orders'),
              ),
              _QuickActionCard(
                title: 'Wallet',
                icon: Icons.account_balance_wallet_outlined,
                onTap: () => Navigator.pushNamed(context, '/wallet'),
              ),
              _QuickActionCard(
                title: isMaster ? 'Dashboard' : 'Favorites',
                icon: isMaster ? Icons.dashboard_outlined : Icons.favorite_border,
                onTap: () => Navigator.pushNamed(context, isMaster ? '/master-dashboard' : '/favorites'),
              ),
              _QuickActionCard(
                title: 'Notifications',
                icon: Icons.notifications_outlined,
                onTap: () => Navigator.pushNamed(context, '/notifications'),
              ),
              _QuickActionCard(
                title: 'Help',
                icon: Icons.help_outline,
                onTap: () => Navigator.pushNamed(context, '/help'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Account Status',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _DetailRow(label: 'Role', value: _roleLabel(user.role)),
                _DetailRow(label: 'Status', value: user.status),
                _DetailRow(label: 'Language', value: user.lang.toUpperCase()),
                if (user.createdAt.isNotEmpty)
                  _DetailRow(label: 'Joined', value: user.createdAt.substring(0, 10)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          OutlinedButton.icon(
            onPressed: () => _logout(context, auth),
            icon: const Icon(Icons.logout, color: Colors.red),
            label: const Text('Logout', style: TextStyle(color: Colors.red)),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.red),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.title,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: AppTheme.primary),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  final Color color;

  const _InfoChip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 12),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(
            child: Text(label, style: TextStyle(color: Colors.grey.shade600)),
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
