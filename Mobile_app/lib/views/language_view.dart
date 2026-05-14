import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/theme.dart';

class LanguageView extends StatefulWidget {
  const LanguageView({Key? key}) : super(key: key);

  @override
  State<LanguageView> createState() => _LanguageViewState();
}

class _LanguageViewState extends State<LanguageView> {
  String _selectedLanguage = 'en';

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
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const SizedBox(height: 16),
                      Text(
                        'Preferred Language',
                        style: GoogleFonts.inter(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          color: primaryColor,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: Text(
                          'Choose how you would like to experience BHC Connect. You can change this at any time.',
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            color: textMutedColor,
                            height: 1.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(height: 40),
                      
                      _buildLanguageOption(
                        context: context,
                        value: 'en',
                        title: 'English',
                        subtitle: 'System default',
                        icon: Icons.language,
                        primaryColor: primaryColor,
                        textColor: textColor,
                        textMutedColor: textMutedColor,
                        surfaceColor: surfaceColor,
                      ),
                      const SizedBox(height: 16),
                      _buildLanguageOption(
                        context: context,
                        value: 'tl',
                        title: 'Filipino',
                        subtitle: 'Tagalog',
                        icon: Icons.translate,
                        primaryColor: primaryColor,
                        textColor: textColor,
                        textMutedColor: textMutedColor,
                        surfaceColor: surfaceColor,
                      ),
                      const SizedBox(height: 24),
                      
                      _buildInfoBox(context, primaryColor, textColor),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
            
            // Bottom Button
            Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                color: Theme.of(context).scaffoldBackgroundColor,
                boxShadow: [
                  BoxShadow(
                    color: isDark ? Colors.black.withOpacity(0.2) : Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  )
                ],
              ),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // Update language logic here
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    'Update Language',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLanguageOption({
    required BuildContext context,
    required String value,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color primaryColor,
    required Color textColor,
    required Color textMutedColor,
    required Color surfaceColor,
  }) {
    final isSelected = _selectedLanguage == value;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    // Smooth background transitions corresponding to selection
    final bgColor = isSelected 
        ? (isDark ? primaryColor.withOpacity(0.1) : AppTheme.primarySoft) 
        : surfaceColor;
        
    final borderColor = isSelected 
        ? primaryColor 
        : Colors.transparent;
        
    final iconBgColor = isSelected 
        ? primaryColor.withOpacity(0.15) 
        : (isDark ? const Color(0xFF1E293B) : const Color(0xFFFFF7ED)); // Light orangeish tint for Filipino icon, neutral for others

    // If it's Filipino icon and not selected, we'll try to match the exact mockup color.
    Color finalIconBgColor = iconBgColor;
    Color iconColor = isSelected ? primaryColor : textMutedColor;
    
    if (!isSelected && value == 'tl') {
      finalIconBgColor = isDark ? const Color(0xFF332717) : const Color(0xFFFFF7ED); // Very light yellowish tint
      iconColor = isDark ? const Color(0xFFD97706) : const Color(0xFF92400E);
    } else if (!isSelected && value == 'en') {
      finalIconBgColor = isDark ? const Color(0xFF1A2A2A) : const Color(0xFFF0FDFA);
      iconColor = isDark ? const Color(0xFF0D9488) : const Color(0xFF0F766E);
    }

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedLanguage = value;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor, width: 1.5),
          boxShadow: isSelected ? [] : [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: finalIconBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: iconColor, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      color: textColor,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      color: textMutedColor,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
              color: isSelected ? primaryColor : textMutedColor.withOpacity(0.4),
              size: 24,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoBox(BuildContext context, Color primaryColor, Color textColor) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? primaryColor.withOpacity(0.1) : primaryColor.withOpacity(0.05);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline, color: primaryColor, size: 20),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              'Changing the language will update your navigation, health reports, and notifications to your selected preference.',
              style: GoogleFonts.inter(
                color: isDark ? Colors.white70 : const Color(0xFF4B5563),
                fontSize: 13,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
