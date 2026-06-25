import 'package:flutter/material.dart';
import '../models/master.dart';

class MasterCard extends StatelessWidget {
  final Master master;
  const MasterCard({super.key, required this.master});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, '/master/${master.id}'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
        children: [
          Stack(
            children: [
              Container(
                width: 56, height: 56,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF2563EB), Color(0xFF3B82F6)],
                  ),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Center(
                  child: Text(
                    master.fullName[0],
                    style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              if (master.isOnline)
                Positioned(
                  bottom: 0, right: 0,
                  child: Container(
                    width: 16, height: 16,
                    decoration: const BoxDecoration(color: Color(0xFF22C55E), shape: BoxShape.circle),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(master.fullName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis),
                    ),
                    if (master.isVerified) const Icon(Icons.verified, color: Color(0xFF2563EB), size: 18),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.star, color: Color(0xFFF59E0B), size: 16),
                    const SizedBox(width: 4),
                    Text('${master.rating}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                    const SizedBox(width: 12),
                    Text('${master.completedJobs} jobs', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                    if (master.distance != null) ...[
                      const SizedBox(width: 12),
                      Icon(Icons.location_on_outlined, size: 14, color: Colors.grey.shade600),
                      Text('${master.distance!.toStringAsFixed(1)} km', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                    ],
                  ],
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: Colors.grey),
        ],
      ),
    ),
    );
  }
}
