import 'package:flutter/material.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Help & About')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Text('Frequently Asked Questions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
                _faqItem('How do I create an order?', 'Go to the Orders tab and tap "Create Order". Fill in the details and submit.'),
                const Divider(height: 1),
                _faqItem('How do I find a master?', 'Browse categories or search for services. Tap on a master to view their profile and reviews.'),
                const Divider(height: 1),
                _faqItem('How does payment work?', 'Payments are processed through the platform. Funds are held securely until the job is completed.'),
                const Divider(height: 1),
                _faqItem('What if I have a dispute?', 'You can open a dispute from the order details page. Our support team will review within 24 hours.'),
                const Divider(height: 1),
                _faqItem('How do I cancel an order?', 'You can cancel a pending order from the order details page. If the work has started, please contact support.'),
                const SizedBox(height: 16),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Text('About', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    'UstaGo is Uzbekistan\'s premier service marketplace connecting customers with trusted masters.\n\n'
                    'Version: 1.0.0\n'
                    '© 2025 UstaGo. All rights reserved.',
                    style: TextStyle(color: Colors.grey, height: 1.5),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
          const SizedBox(height: 32),
          Center(
            child: Column(
              children: [
                const Text('Need more help?', style: TextStyle(color: Colors.grey)),
                const SizedBox(height: 8),
                TextButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.mail_outline),
                  label: const Text('support@ustago.uz'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _faqItem(String question, String answer) {
    return ExpansionTile(
      title: Text(question, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Text(answer, style: const TextStyle(color: Colors.grey, height: 1.5)),
        ),
      ],
    );
  }
}
