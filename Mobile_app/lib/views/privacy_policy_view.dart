import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/theme.dart';

class PrivacyPolicyView extends StatelessWidget {
  const PrivacyPolicyView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;
    final primaryColor = isDark ? AppTheme.primaryLight : AppTheme.primaryBlue;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Privacy Policy'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: textColor),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Privacy Policy',
                style: GoogleFonts.inter(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: textColor,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.calendar_today_outlined, size: 14, color: textMutedColor),
                  const SizedBox(width: 6),
                  Text(
                    'Last Updated: October 24, 2023',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: textMutedColor,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              // Intro Box
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 15,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: RichText(
                  text: TextSpan(
                    style: GoogleFonts.inter(
                      color: textColor,
                      fontSize: 15,
                      height: 1.6,
                    ),
                    children: [
                      const TextSpan(text: 'At BHC Connect, we treat your health data with the same care and '),
                      TextSpan(
                        text: 'Malasakit',
                        style: TextStyle(fontWeight: FontWeight.w700, fontStyle: FontStyle.italic, color: primaryColor),
                      ),
                      const TextSpan(text: ' as a personal physician. This policy explains how we protect your information while providing '),
                      const TextSpan(
                        text: 'essential',
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),
                      const TextSpan(text: ' community health services.'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
              
              // Introduction Section
              _buildIconHeader(
                context,
                icon: Icons.info_outline,
                title: 'Introduction',
                color: primaryColor,
              ),
              const SizedBox(height: 16),
              Text(
                'BHC Connect (the "Service") is committed to protecting your privacy. This Privacy Policy describes how we collect, use, and share your personal information when you use our mobile application and healthcare coordination services within your local Barangay.\n\nBy using the Service, you agree to the collection and use of information in accordance with this policy designed to foster a safe and digital-first healthcare environment.',
                style: GoogleFonts.inter(
                  color: textMutedColor,
                  fontSize: 14,
                  height: 1.6,
                ),
              ),
              const SizedBox(height: 32),
              
              // Data We Collect Section
              Container(
                decoration: BoxDecoration(
                  border: Border(
                    left: BorderSide(color: primaryColor, width: 3),
                  ),
                ),
                padding: const EdgeInsets.only(left: 20, top: 8, bottom: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: isDark ? primaryColor.withOpacity(0.15) : AppTheme.primarySoft,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(Icons.storage, size: 18, color: primaryColor),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          'Data We Collect',
                          style: GoogleFonts.inter(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: textColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    _buildSubCard(context, 'Personal Details', 'Full name, date of birth, gender, and Barangay residency status.', primaryColor),
                    const SizedBox(height: 12),
                    _buildSubCard(context, 'Health Metrics', 'Immunization records, blood pressure readings, and consultation history.', primaryColor),
                    const SizedBox(height: 12),
                    _buildSubCard(context, 'Contact Info', 'Mobile number for appointment reminders and emergency notifications.', primaryColor),
                    const SizedBox(height: 12),
                    _buildSubCard(context, 'Device Data', 'IP address and device identifiers to ensure secure log in sessions.', primaryColor),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              
              // How We Use Your Data Section
              _buildIconHeader(
                context,
                icon: Icons.work_outline,
                title: 'How We Use Your Data',
                color: const Color(0xFFD97706), // Amber/Orange to match mockup separation
              ),
              const SizedBox(height: 16),
              _buildBulletPoint('To coordinate healthcare appointments with your local Barangay Health Workers.', primaryColor, textColor),
              const SizedBox(height: 12),
              _buildBulletPoint('To maintain accurate prenatal and immunization tracking for community health programs.', primaryColor, textColor),
              const SizedBox(height: 12),
              _buildBulletPoint('To send critical health alerts and public safety announcements from your local government.', primaryColor, textColor),
              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIconHeader(BuildContext context, {required IconData icon, required String title, required Color color}) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 18, color: Colors.white),
        ),
        const SizedBox(width: 12),
        Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: Theme.of(context).textTheme.bodyLarge?.color,
          ),
        ),
      ],
    );
  }

  Widget _buildSubCard(BuildContext context, String title, String subtitle, Color primaryColor) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: primaryColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: GoogleFonts.inter(
              fontSize: 13,
              color: Theme.of(context).textTheme.bodyMedium?.color,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBulletPoint(String text, Color iconColor, Color textColor) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 6.0),
          child: Icon(Icons.circle, size: 8, color: iconColor),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.inter(
              fontSize: 14,
              height: 1.5,
              color: textColor,
            ),
          ),
        ),
      ],
    );
  }
}
