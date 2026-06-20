import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/locale_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final locale = context.watch<LocaleProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.language),
                  title: const Text('Language'),
                  subtitle: Text(locale.locale.languageCode == 'uz' ? "O'zbek" : locale.locale.languageCode == 'ru' ? 'Русский' : 'English'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _showLanguagePicker(context, locale),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  secondary: Icon(isDark ? Icons.dark_mode : Icons.light_mode),
                  title: const Text('Dark Mode'),
                  value: isDark,
                  onChanged: (_) {},
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.notifications_outlined),
                  title: const Text('Notifications'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.lock_outlined),
                  title: const Text('Privacy'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.info_outline),
                  title: const Text('About'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => auth.logout(),
              icon: const Icon(Icons.logout, color: Colors.red),
              label: const Text('Logout', style: TextStyle(color: Colors.red)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.red),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showLanguagePicker(BuildContext context, LocaleProvider locale) {
    showDialog(
      context: context,
      builder: (ctx) => SimpleDialog(
        title: const Text('Select Language'),
        children: [
          SimpleDialogOption(
            onPressed: () { locale.setLocale('uz'); Navigator.pop(ctx); },
            child: const Text("O'zbek"),
          ),
          SimpleDialogOption(
            onPressed: () { locale.setLocale('ru'); Navigator.pop(ctx); },
            child: const Text('Русский'),
          ),
          SimpleDialogOption(
            onPressed: () { locale.setLocale('en'); Navigator.pop(ctx); },
            child: const Text('English'),
          ),
        ],
      ),
    );
  }
}
