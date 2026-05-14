import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/theme.dart';

class HelpCenterView extends StatelessWidget {
  const HelpCenterView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;
    final primaryColor = isDark ? AppTheme.primaryLight : AppTheme.primaryBlue;
    final surfaceColor = Theme.of(context).colorScheme.surface;
    
    // Top section background color
    final topBgColor = isDark ? const Color(0xFF1E293B) : AppTheme.primarySoft;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Top Header Section
            Container(
              padding: const EdgeInsets.only(top: 50, left: 24, right: 24, bottom: 32),
              decoration: BoxDecoration(
                color: topBgColor,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(30),
                  bottomRight: Radius.circular(30),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      IconButton(
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        icon: Icon(Icons.arrow_back, color: primaryColor),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const SizedBox(width: 16),
                      Text(
                        'Help Center',
                        style: GoogleFonts.inter(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: primaryColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  Text(
                    'How can we help\nyou today?',
                    style: GoogleFonts.inter(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      color: isDark ? Colors.white : AppTheme.primaryDark,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Search Bar
                  Container(
                    decoration: BoxDecoration(
                      color: isDark ? Theme.of(context).scaffoldBackgroundColor : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Search for articles, guides...',
                        hintStyle: GoogleFonts.inter(
                          color: textMutedColor,
                          fontSize: 15,
                        ),
                        prefixIcon: Icon(Icons.search, color: primaryColor),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Quick Actions Grid
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildQuickAction(context, Icons.support_agent, 'Contact Us', primaryColor),
                      _buildQuickAction(context, Icons.help_outline, 'FAQs', primaryColor),
                      _buildQuickAction(context, Icons.chat_bubble_outline, 'Chat Support', primaryColor),
                      _buildQuickAction(context, Icons.play_circle_outline, 'Tutorials', primaryColor),
                    ],
                  ),
                  
                  const SizedBox(height: 40),
                  
                  // Top Questions
                  Text(
                    'TOP QUESTIONS',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: textMutedColor,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  Container(
                    decoration: BoxDecoration(
                      color: surfaceColor,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.03),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        _buildQuestionTile(context, 'How do I reset my portal password?'),
                        Divider(height: 1, indent: 20, endIndent: 20, color: textMutedColor.withOpacity(0.1)),
                        _buildQuestionTile(context, 'Where can I find my immunization records?'),
                        Divider(height: 1, indent: 20, endIndent: 20, color: textMutedColor.withOpacity(0.1)),
                        _buildQuestionTile(context, 'Can I book appointments for family members?'),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 40),
                  
                  // Still need help Box
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: isDark 
                            ? [primaryColor.withOpacity(0.2), primaryColor.withOpacity(0.1)]
                            : [primaryColor.withOpacity(0.1), AppTheme.primarySoft],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: primaryColor.withOpacity(0.2), width: 1),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Icon(Icons.headset_mic_rounded, size: 40, color: primaryColor),
                        const SizedBox(height: 16),
                        Text(
                          'Still need help?',
                          style: GoogleFonts.inter(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: textColor,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Connect with a Barangay Health Worker directly.',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            color: isDark ? Colors.white70 : AppTheme.primaryDark,
                            height: 1.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {},
                            style: ElevatedButton.styleFrom(
                              backgroundColor: primaryColor,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 0,
                            ),
                            child: Text(
                              'Contact Support',
                              style: GoogleFonts.inter(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction(BuildContext context, IconData icon, String label, Color primaryColor) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? primaryColor.withOpacity(0.15) : Colors.white,
            shape: BoxShape.circle,
            boxShadow: [
              if (!isDark)
                BoxShadow(
                  color: primaryColor.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                )
            ],
          ),
          child: Icon(icon, color: primaryColor, size: 28),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Theme.of(context).textTheme.bodyMedium?.color,
          ),
        ),
      ],
    );
  }

  Widget _buildQuestionTile(BuildContext context, String question) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      title: Text(
        question,
        style: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: Theme.of(context).textTheme.bodyLarge?.color,
        ),
      ),
      trailing: Icon(
        Icons.keyboard_arrow_down_rounded,
        color: Theme.of(context).textTheme.bodyMedium?.color,
      ),
      onTap: () {},
    );
  }
}
