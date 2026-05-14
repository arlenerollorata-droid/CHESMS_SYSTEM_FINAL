import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/theme.dart';

class TermsOfServiceView extends StatelessWidget {
  const TermsOfServiceView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;
    final primaryColor = isDark ? AppTheme.primaryLight : AppTheme.primaryBlue;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
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
                'Terms of Service',
                style: GoogleFonts.inter(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: textColor,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Last updated: October 24, 2023.\nPlease read these terms carefully before using BHC Connect to ensure a safe and informed experience.',
                style: GoogleFonts.inter(
                  fontSize: 15,
                  color: textMutedColor,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              
              _buildSection(
                context: context,
                number: '01',
                title: 'Acceptance of Terms',
                content: 'By accessing or using BHC Connect, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to all of these terms, do not use our services. Your continued use of the platform constitutes your legal agreement to these conditions.',
                primaryColor: primaryColor,
                textColor: textColor,
                textMutedColor: textMutedColor,
              ),
              const SizedBox(height: 32),
              
              _buildSection(
                context: context,
                number: '02',
                title: 'Description of Service',
                content: 'BHC Connect provides a digital platform designed to facilitate connection between patients and healthcare resources. Our services include appointment scheduling, health information dissemination, and community communication tools designed to support your wellness journey.',
                primaryColor: primaryColor,
                textColor: textColor,
                textMutedColor: textMutedColor,
              ),
              const SizedBox(height: 32),
              
              _buildSection(
                context: context,
                number: '03',
                title: 'User Obligations',
                content: 'You represent that the information you provide is accurate and complete. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree not to use the service for any unlawful purposes.',
                primaryColor: primaryColor,
                textColor: textColor,
                textMutedColor: textMutedColor,
              ),
              const SizedBox(height: 32),
              
              _buildSpecialSection(
                context: context,
                number: '04',
                title: 'Health Information Disclaimer',
                primaryColor: primaryColor,
                textColor: textColor,
                textMutedColor: textMutedColor,
                isDark: isDark,
              ),
              const SizedBox(height: 32),
              
              _buildSection(
                context: context,
                number: '05',
                title: 'Limitation of Liability',
                content: 'To the maximum extent permitted by law, BHC Connect shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the service. We provide the platform on an \'as-is\' and \'as-available\' basis without warranties of any kind.',
                primaryColor: primaryColor,
                textColor: textColor,
                textMutedColor: textMutedColor,
              ),
              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection({
    required BuildContext context,
    required String number,
    required String title,
    required String content,
    required Color primaryColor,
    required Color textColor,
    required Color textMutedColor,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 40,
          child: Text(
            number,
            style: GoogleFonts.inter(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: primaryColor.withOpacity(0.3),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: textColor,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                content,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: textMutedColor,
                  height: 1.6,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSpecialSection({
    required BuildContext context,
    required String number,
    required String title,
    required Color primaryColor,
    required Color textColor,
    required Color textMutedColor,
    required bool isDark,
  }) {
    final surfaceColor = Theme.of(context).colorScheme.surface;
    final alertColor = isDark ? const Color(0xFFD97706) : const Color(0xFFB45309);

    return Container(
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            top: -10,
            right: 0,
            child: Icon(
              Icons.health_and_safety,
              size: 100,
              color: primaryColor.withOpacity(0.05),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 32,
                  child: Text(
                    number,
                    style: GoogleFonts.inter(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: alertColor,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              title,
                              style: GoogleFonts.inter(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: alertColor,
                              ),
                            ),
                          ),
                          Icon(Icons.warning_amber_rounded, color: alertColor, size: 20),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Container(
                        decoration: BoxDecoration(
                          color: Theme.of(context).scaffoldBackgroundColor,
                          border: Border(
                            left: BorderSide(color: alertColor, width: 4),
                          ),
                        ),
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'CRITICAL NOTICE:',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: textColor,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 8),
                            RichText(
                              text: TextSpan(
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w400,
                                  color: textMutedColor,
                                  height: 1.5,
                                ),
                                children: [
                                  const TextSpan(text: 'BHC Connect is a tool for '),
                                  TextSpan(
                                    text: 'connection and information only',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      color: primaryColor,
                                    ),
                                  ),
                                  const TextSpan(text: '. It is NOT a medical device, nor does it provide clinical diagnosis or treatment.'),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: isDark ? Colors.redAccent.withOpacity(0.15) : const Color(0xFFFEF2F2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Icon(Icons.report, size: 16, color: Colors.redAccent.shade400),
                                      const SizedBox(width: 8),
                                      Text(
                                        'NOT FOR EMERGENCIES',
                                        style: GoogleFonts.inter(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w800,
                                          color: Colors.redAccent.shade400,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'If you are experiencing a medical emergency, do not use this app. Contact emergency medical services immediately or go to the nearest emergency room.',
                                    style: GoogleFonts.inter(
                                      fontSize: 13,
                                      color: isDark ? Colors.red.shade200 : Colors.red.shade900,
                                      height: 1.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
