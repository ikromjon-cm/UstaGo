import 'package:flutter/material.dart';
import '../services/api_client.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});
  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _phoneCtl = TextEditingController();
  final _otpCtl = TextEditingController();
  final _passwordCtl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  int _step = 0;
  bool _loading = false;

  Future<void> _sendOtp() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await ApiClient.post('/auth/send_otp/', body: {'phone': _phoneCtl.text});
      if (mounted) setState(() => _step = 1);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _verifyOtp() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await ApiClient.post('/auth/verify_otp/', body: {'phone': _phoneCtl.text, 'otp': _otpCtl.text});
      if (mounted) setState(() => _step = 2);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Invalid OTP')));
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _resetPassword() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await ApiClient.post('/auth/reset_password/', body: {
        'phone': _phoneCtl.text, 'otp': _otpCtl.text, 'password': _passwordCtl.text,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password reset!')));
        Navigator.pushReplacementNamed(context, '/login');
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  void dispose() {
    _phoneCtl.dispose(); _otpCtl.dispose(); _passwordCtl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reset Password')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              if (_step == 0) ...[
                const Text('Enter your phone number', style: TextStyle(fontSize: 16)),
                const SizedBox(height: 24),
                TextFormField(controller: _phoneCtl, decoration: const InputDecoration(labelText: 'Phone', prefixIcon: Icon(Icons.phone)), keyboardType: TextInputType.phone, validator: (v) => v!.isEmpty ? 'Required' : null),
                const SizedBox(height: 24),
                SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _sendOtp, child: _loading ? const CircularProgressIndicator() : const Text('Send OTP'))),
              ],
              if (_step == 1) ...[
                Text('OTP sent to ${_phoneCtl.text}', style: const TextStyle(fontSize: 16)),
                const SizedBox(height: 24),
                TextFormField(controller: _otpCtl, decoration: const InputDecoration(labelText: 'OTP Code', prefixIcon: Icon(Icons.lock)), keyboardType: TextInputType.number, maxLength: 6, validator: (v) => v!.length < 4 ? 'Invalid OTP' : null),
                const SizedBox(height: 24),
                SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _verifyOtp, child: _loading ? const CircularProgressIndicator() : const Text('Verify'))),
              ],
              if (_step == 2) ...[
                const Text('Enter new password', style: TextStyle(fontSize: 16)),
                const SizedBox(height: 24),
                TextFormField(controller: _passwordCtl, decoration: const InputDecoration(labelText: 'New Password', prefixIcon: Icon(Icons.lock)), obscureText: true, validator: (v) => v!.length < 6 ? 'Min 6 characters' : null),
                const SizedBox(height: 24),
                SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _resetPassword, child: _loading ? const CircularProgressIndicator() : const Text('Reset Password'))),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
