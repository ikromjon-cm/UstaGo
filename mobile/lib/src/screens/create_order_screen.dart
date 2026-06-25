import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/service.dart';
import '../providers/category_provider.dart';
import '../services/order_service.dart';

class CreateOrderScreen extends StatefulWidget {
  final String? initialCategoryId;
  final String? initialServiceId;
  final String? initialTitle;
  final String? initialDescription;

  const CreateOrderScreen({
    super.key,
    this.initialCategoryId,
    this.initialServiceId,
    this.initialTitle,
    this.initialDescription,
  });

  @override
  State<CreateOrderScreen> createState() => _CreateOrderScreenState();
}

class _CreateOrderScreenState extends State<CreateOrderScreen> {
  bool _prefilled = false;
  final _formKey = GlobalKey<FormState>();
  final _titleCtl = TextEditingController();
  final _descCtl = TextEditingController();
  final _budgetCtl = TextEditingController();
  final _addressCtl = TextEditingController();
  final _apartmentCtl = TextEditingController();
  final _latCtl = TextEditingController();
  final _lngCtl = TextEditingController();

  String? _selectedCategoryId;
  String? _selectedServiceId;
  String _urgency = 'normal';
  DateTime? _preferredDate;
  TimeOfDay? _preferredTime;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final provider = context.read<CategoryProvider>();
      await provider.loadCategories();
      if (!mounted || _prefilled) return;
      _prefilled = true;
      _titleCtl.text = widget.initialTitle ?? '';
      _descCtl.text = widget.initialDescription ?? '';

      final hasInitialCategory = widget.initialCategoryId != null &&
          provider.categories.any((category) => category.id == widget.initialCategoryId);
      if (hasInitialCategory) {
        _selectedCategoryId = widget.initialCategoryId;
        await provider.loadServices(widget.initialCategoryId!);
      }

      final hasInitialService = widget.initialServiceId != null &&
          provider
              .servicesForCategory(_selectedCategoryId)
              .any((service) => service.id == widget.initialServiceId);
      if (hasInitialService) {
        _selectedServiceId = widget.initialServiceId;
      }

      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _titleCtl.dispose();
    _descCtl.dispose();
    _budgetCtl.dispose();
    _addressCtl.dispose();
    _apartmentCtl.dispose();
    _latCtl.dispose();
    _lngCtl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _preferredDate ?? now,
      firstDate: now,
      lastDate: now.add(const Duration(days: 90)),
    );
    if (picked != null) {
      setState(() => _preferredDate = picked);
    }
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _preferredTime ?? TimeOfDay.now(),
    );
    if (picked != null) {
      setState(() => _preferredTime = picked);
    }
  }

  Future<void> _onCategoryChanged(String? categoryId) async {
    setState(() {
      _selectedCategoryId = categoryId;
      _selectedServiceId = null;
    });
    if (categoryId != null) {
      await context.read<CategoryProvider>().loadServices(categoryId);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await OrderService.createOrder({
        'title': _titleCtl.text.trim(),
        'description': _descCtl.text.trim(),
        'category': _selectedCategoryId,
        'service': _selectedServiceId,
        'urgency': _urgency,
        'budget': double.tryParse(_budgetCtl.text.trim()),
        'address': _addressCtl.text.trim(),
        'apartment': _apartmentCtl.text.trim(),
        'latitude': double.parse(_latCtl.text.trim()),
        'longitude': double.parse(_lngCtl.text.trim()),
        'preferred_date': _preferredDate?.toIso8601String().split('T').first,
        'preferred_time': _preferredTime != null
            ? '${_preferredTime!.hour.toString().padLeft(2, '0')}:${_preferredTime!.minute.toString().padLeft(2, '0')}:00'
            : null,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Order created successfully')),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  InputDecoration _decoration(String label, {IconData? icon}) {
    return InputDecoration(
      labelText: label,
      prefixIcon: icon != null ? Icon(icon) : null,
      border: const OutlineInputBorder(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CategoryProvider>(
      builder: (context, categoryProvider, _) {
        final categories = categoryProvider.categories;
        final selectedCategoryId = categories.any((category) => category.id == _selectedCategoryId)
            ? _selectedCategoryId
            : null;
        final services = categoryProvider.servicesForCategory(selectedCategoryId);
        final selectedServiceId = services.any((service) => service.id == _selectedServiceId)
            ? _selectedServiceId
            : null;

        return Scaffold(
          appBar: AppBar(title: const Text('Create Order')),
          body: SafeArea(
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Text(
                    'Describe the issue and location so nearby masters can respond quickly.',
                    style: TextStyle(color: Colors.grey.shade700),
                  ),
                  const SizedBox(height: 20),
                  DropdownButtonFormField<String>(
                    value: selectedCategoryId,
                    decoration: _decoration('Category', icon: Icons.category_outlined),
                    items: categories
                        .map(
                          (category) => DropdownMenuItem<String>(
                            value: category.id,
                            child: Text(category.titleUz),
                          ),
                        )
                        .toList(),
                    onChanged: _saving ? null : _onCategoryChanged,
                    validator: (value) => value == null ? 'Select category' : null,
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: selectedServiceId,
                    decoration: _decoration('Service (optional)', icon: Icons.build_outlined),
                    items: [
                      const DropdownMenuItem<String>(value: '', child: Text('Not specified')),
                      ...services.map(
                        (service) => DropdownMenuItem<String>(
                          value: service.id,
                          child: Text(service.displayTitle),
                        ),
                      ),
                    ],
                    onChanged: _saving
                        ? null
                        : (value) {
                            setState(() => _selectedServiceId = (value == null || value.isEmpty) ? null : value);
                          },
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _urgency,
                    decoration: _decoration('Urgency', icon: Icons.priority_high_outlined),
                    items: const [
                      DropdownMenuItem(value: 'low', child: Text('Low')),
                      DropdownMenuItem(value: 'normal', child: Text('Normal')),
                      DropdownMenuItem(value: 'high', child: Text('High')),
                      DropdownMenuItem(value: 'emergency', child: Text('Emergency')),
                    ],
                    onChanged: _saving ? null : (value) => setState(() => _urgency = value ?? 'normal'),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _titleCtl,
                    decoration: _decoration('Title', icon: Icons.title_outlined),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _descCtl,
                    maxLines: 4,
                    decoration: _decoration('Description', icon: Icons.description_outlined),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _budgetCtl,
                    keyboardType: TextInputType.number,
                    decoration: _decoration('Budget (UZS)', icon: Icons.payments_outlined),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _addressCtl,
                    decoration: _decoration('Address', icon: Icons.location_on_outlined),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _apartmentCtl,
                    decoration: _decoration('Apartment / unit', icon: Icons.home_work_outlined),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _latCtl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
                          decoration: _decoration('Latitude', icon: Icons.my_location_outlined),
                          validator: (v) => v == null || double.tryParse(v.trim()) == null ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: _lngCtl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
                          decoration: _decoration('Longitude', icon: Icons.map_outlined),
                          validator: (v) => v == null || double.tryParse(v.trim()) == null ? 'Required' : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _saving ? null : _pickDate,
                          icon: const Icon(Icons.calendar_today_outlined),
                          label: Text(
                            _preferredDate == null
                                ? 'Preferred date'
                                : _preferredDate!.toIso8601String().split('T').first,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _saving ? null : _pickTime,
                          icon: const Icon(Icons.access_time_outlined),
                          label: Text(
                            _preferredTime == null
                                ? 'Preferred time'
                                : _preferredTime!.format(context),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _saving ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).primaryColor,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: _saving
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Text(
                              'Create Order',
                              style: TextStyle(color: Colors.white, fontSize: 16),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
