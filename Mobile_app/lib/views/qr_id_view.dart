import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:convert';
import 'package:qr_flutter/qr_flutter.dart';
import '../viewmodels/auth_viewmodel.dart';
import '../utils/theme.dart';

class QrIdView extends StatelessWidget {
  const QrIdView({super.key});

  @override
  Widget build(BuildContext context) {
    final authViewModel = Provider.of<AuthViewModel>(context);
    final userData = authViewModel.userData;

    final userName = userData?['name']?.toString().isNotEmpty == true ? userData!['name'] : 'Maria Santos';
    final profileImageUrl = userData?['profileImage']?.toString();
    final healthId = (userData?['healthId'] ?? userData?['id'] ?? 'CHEMS-2025-001').toString();

    String userLocation = 'SAN JOSE';
    if (userData?['barangay'] != null && userData!['barangay'].toString().isNotEmpty) {
      userLocation = userData['barangay'].toString().toUpperCase();
    } else if (userData?['street'] != null && userData!['street'].toString().isNotEmpty) {
      userLocation = userData['street'].toString().toUpperCase();
    }

    final qrData = jsonEncode({
      'uid': healthId,
      'name': userName,
      'email': userData?['email'] ?? 'maria.santos@email.com',
      'type': 'attendance_verification',
    });

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: Theme.of(context).textTheme.bodyLarge?.color),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            children: [
              _buildDigitalIdCard(context, userName, userLocation, qrData, profileImageUrl, healthId),
              const SizedBox(height: 32),
              Text(
                'Present this QR code at the Health Center for\nquick check-in and record access.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Theme.of(context).textTheme.bodyMedium?.color,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              _buildDownloadButton(context),
              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDigitalIdCard(
    BuildContext context,
    String userName,
    String location,
    String qrData,
    String? profileImageUrl,
    String healthId,
  ) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        // Using the Admin's theme (Primary Gradient / Colors) 
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryBlue.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          )
        ],
      ),
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'HEALTH CENTER',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'BHC CONNECT',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.shield, color: Colors.white, size: 20),
              )
            ],
          ),
          const SizedBox(height: 32),
          Row(
            children: [
              Container(
                width: 65,
                height: 65,
                decoration: BoxDecoration(
                  color: Colors.red[300],
                  borderRadius: BorderRadius.circular(16),
                  image: (profileImageUrl != null && profileImageUrl.isNotEmpty)
                      ? DecorationImage(
                          image: NetworkImage(profileImageUrl),
                          fit: BoxFit.cover,
                        )
                      : null,
                  border: Border.all(color: Colors.white.withOpacity(0.5), width: 2),
                ),
                child: (profileImageUrl == null || profileImageUrl.isEmpty)
                    ? const Icon(Icons.person, color: Colors.white, size: 34)
                    : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      userName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      healthId,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.location_on, color: Colors.white, size: 12),
                          const SizedBox(width: 4),
                          Text(
                            location,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    )
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 48),
          
          // QR Code Area
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 15,
                  offset: const Offset(0, 8),
                )
              ],
            ),
            child: QrImageView(
              data: qrData,
              version: QrVersions.auto,
              size: 160.0,
            ),
          ),
          const SizedBox(height: 24),
          
          Text(
            'SCAN FOR VERIFICATION',
            style: TextStyle(
              color: Colors.white.withOpacity(0.9),
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 2.0,
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _buildDownloadButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: () {},
        icon: const Icon(Icons.download, color: Colors.white, size: 20),
        label: const Text(
          'Download PDF',
          style: TextStyle(
            color: Colors.white,
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppTheme.primaryBlue,
          elevation: 4,
          shadowColor: AppTheme.primaryBlue.withOpacity(0.4),
          padding: const EdgeInsets.symmetric(vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }
}
