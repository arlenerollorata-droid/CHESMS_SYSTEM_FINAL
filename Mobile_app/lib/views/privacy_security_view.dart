import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/theme.dart';
import 'change_password_view.dart';
import 'terms_of_service_view.dart';
import 'privacy_policy_view.dart';

class PrivacySecurityView extends StatefulWidget {
  const PrivacySecurityView({Key? key}) : super(key: key);

  @override
  State<PrivacySecurityView> createState() => _PrivacySecurityViewState();
}

class _PrivacySecurityViewState extends State<PrivacySecurityView> {
  bool _biometricEnabled = true;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;
    final surfaceColor = Theme.of(context).colorScheme.surface;
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
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Your health data is\nprotected by us.',
                style: GoogleFonts.inter(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: primaryColor,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Manage your security preferences and review how BHC Connect handles your sensitive medical information with transparency.',
                style: GoogleFonts.inter(
                  fontSize: 15,
                  color: textMutedColor,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              
              // Biometric Login Card
              _buildCard(
                context,
                child: Row(
                  children: [
                    _buildIcon(Icons.fingerprint, context, primaryColor),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Biometric Login', style: _getTitleStyle(textColor)),
                          Text('Use FaceID or Fingerprint', style: _getSubtitleStyle(textMutedColor)),
                        ],
                      ),
                    ),
                    Switch(
                      value: _biometricEnabled,
                      onChanged: (val) {
                        setState(() {
                          _biometricEnabled = val;
                        });
                      },
                      activeColor: primaryColor,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              
              // Change Password Card
              _buildCard(
                context,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildIcon(Icons.lock_reset, context, primaryColor),
                    const SizedBox(height: 12),
                    Text('Change Password', style: _getTitleStyle(textColor)),
                    Text('Update your portal access key', style: _getSubtitleStyle(textMutedColor)),
                    const SizedBox(height: 16),
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const ChangePasswordView()),
                        );
                      },
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Set new password',
                            style: GoogleFonts.inter(
                              color: primaryColor,
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Icon(Icons.chevron_right, size: 16, color: primaryColor),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              
              // 2-Step Verification Card
              _buildCard(
                context,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildIcon(Icons.verified_user_outlined, context, primaryColor),
                    const SizedBox(height: 12),
                    Text('2-Step Verification', style: _getTitleStyle(textColor)),
                    Text('Adds an extra layer of safety', style: _getSubtitleStyle(textMutedColor)),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Enabled',
                          style: GoogleFonts.inter(
                            color: const Color(0xFFD97706),
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.check_circle, size: 16, color: Color(0xFFD97706)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              
              Text(
                'LEGAL & PRIVACY',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.2,
                  color: textMutedColor,
                ),
              ),
              const SizedBox(height: 16),
              
              Container(
                decoration: BoxDecoration(
                  color: surfaceColor,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: Column(
                  children: [
                    _buildListTile(
                      context, 
                      Icons.privacy_tip_outlined, 
                      'View Privacy Policy', 
                      trailingIcon: Icons.open_in_new,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const PrivacyPolicyView()),
                        );
                      },
                    ),
                    Divider(height: 1, indent: 56, endIndent: 16, color: textMutedColor.withOpacity(0.1)),
                    _buildListTile(
                      context, 
                      Icons.description_outlined, 
                      'Terms of Service', 
                      trailingIcon: Icons.open_in_new,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const TermsOfServiceView()),
                        );
                      },
                    ),
                    Divider(height: 1, indent: 56, endIndent: 16, color: textMutedColor.withOpacity(0.1)),
                    _buildListTile(context, Icons.history, 'Data Access History', trailingIcon: Icons.chevron_right),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCard(BuildContext context, {required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: child,
    );
  }

  Widget _buildIcon(IconData icon, BuildContext context, Color color) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: color, size: 24),
    );
  }

  TextStyle _getTitleStyle(Color color) {
    return GoogleFonts.inter(
      color: color,
      fontSize: 16,
      fontWeight: FontWeight.w700,
    );
  }

  TextStyle _getSubtitleStyle(Color color) {
    return GoogleFonts.inter(
      color: color,
      fontSize: 13,
    );
  }

  Widget _buildListTile(BuildContext context, IconData icon, String title, {required IconData trailingIcon, VoidCallback? onTap}) {
    final textColor = Theme.of(context).textTheme.bodyLarge?.color;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color;

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      leading: Icon(icon, color: textMutedColor),
      title: Text(
        title,
        style: GoogleFonts.inter(
          color: textColor,
          fontSize: 15,
          fontWeight: FontWeight.w600,
        ),
      ),
      trailing: Icon(trailingIcon, color: textMutedColor, size: 20),
      onTap: onTap ?? () {},
    );
  }
}
