import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/theme.dart';

class NotificationView extends StatefulWidget {
  const NotificationView({Key? key}) : super(key: key);

  @override
  State<NotificationView> createState() => _NotificationViewState();
}

class _NotificationViewState extends State<NotificationView> {
  bool _pushNotifications = true;
  bool _appointments = true;
  bool _healthReminders = true;
  bool _barangayNews = false;
  bool _emergencyAlerts = true;

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
        title: const Text('Notifications'),
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
                'Your Well-being\nJourney',
                style: GoogleFonts.inter(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: primaryColor,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                "Customize how and when you receive updates from BHC Connect. Stay informed with proactive care tailored to your family's needs.",
                style: GoogleFonts.inter(
                  fontSize: 15,
                  color: textMutedColor,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              
              // Master Control Card
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: _pushNotifications ? (isDark ? AppTheme.primaryDark : AppTheme.primaryBlue) : surfaceColor,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: _pushNotifications ? primaryColor.withOpacity(0.3) : Colors.black.withOpacity(0.05),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    )
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Push Notifications',
                      style: GoogleFonts.inter(
                        color: _pushNotifications ? Colors.white : textColor,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'The master control for all real-time alerts on your mobile device.',
                      style: GoogleFonts.inter(
                        color: _pushNotifications ? Colors.white.withOpacity(0.8) : textMutedColor,
                        fontSize: 14,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Align(
                      alignment: Alignment.centerRight,
                      child: Switch(
                        value: _pushNotifications,
                        onChanged: (val) {
                          setState(() {
                            _pushNotifications = val;
                          });
                        },
                        activeColor: Colors.white,
                        activeTrackColor: Colors.white.withOpacity(0.35),
                        inactiveThumbColor: isDark ? Colors.grey[400] : Colors.white,
                        inactiveTrackColor: isDark ? Colors.grey[700] : Colors.grey[300],
                        thumbColor: MaterialStateProperty.resolveWith<Color?>((states) {
                          if (states.contains(MaterialState.selected)) {
                            return Colors.white;
                          }
                          return isDark ? Colors.grey[400] : Colors.white;
                        }),
                        trackColor: MaterialStateProperty.resolveWith<Color?>((states) {
                          if (states.contains(MaterialState.selected)) {
                            return Colors.white.withOpacity(0.35);
                          }
                          return isDark ? Colors.grey[700] : Colors.grey[300];
                        }),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              
              // List of Settings
              AnimatedOpacity(
                opacity: _pushNotifications ? 1.0 : 0.5,
                duration: const Duration(milliseconds: 300),
                child: IgnorePointer(
                  ignoring: !_pushNotifications,
                  child: Column(
                    children: [
                      _buildSettingCard(
                        context: context,
                        icon: Icons.calendar_today,
                        title: 'Appointments',
                        subtitle: 'Reminders for checkups and dental visits',
                        value: _appointments,
                        onChanged: (val) => setState(() => _appointments = val),
                        primaryColor: primaryColor,
                        textColor: textColor,
                        textMutedColor: textMutedColor,
                      ),
                      const SizedBox(height: 12),
                      _buildSettingCard(
                        context: context,
                        icon: Icons.medical_services_outlined,
                        title: 'Health Reminders',
                        subtitle: 'Immunization schedules and medicine refill alerts',
                        value: _healthReminders,
                        onChanged: (val) => setState(() => _healthReminders = val),
                        primaryColor: primaryColor,
                        textColor: textColor,
                        textMutedColor: textMutedColor,
                      ),
                      const SizedBox(height: 12),
                      _buildSettingCard(
                        context: context,
                        icon: Icons.campaign_outlined,
                        title: 'Barangay News',
                        subtitle: 'Local health drives and community programs',
                        value: _barangayNews,
                        onChanged: (val) => setState(() => _barangayNews = val),
                        primaryColor: primaryColor,
                        textColor: textColor,
                        textMutedColor: textMutedColor,
                      ),
                      const SizedBox(height: 12),
                      _buildSettingCard(
                        context: context,
                        icon: Icons.warning_amber_rounded,
                        title: 'Emergency Alerts',
                        subtitle: 'Outbreak warnings and weather advisories',
                        value: _emergencyAlerts,
                        onChanged: (val) => setState(() => _emergencyAlerts = val),
                        primaryColor: primaryColor,
                        textColor: textColor,
                        textMutedColor: textMutedColor,
                        isEmergency: true,
                        activeColor: Colors.redAccent,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSettingCard({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required Function(bool) onChanged,
    required Color primaryColor,
    required Color textColor,
    required Color textMutedColor,
    bool isEmergency = false,
    Color? activeColor,
  }) {
    final surfaceColor = Theme.of(context).colorScheme.surface;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    Color iconBgColor = isDark ? primaryColor.withOpacity(0.15) : AppTheme.primarySoft;
    Color iconColor = primaryColor;
    
    if (isEmergency) {
      iconBgColor = isDark ? Colors.redAccent.withOpacity(0.15) : Colors.red.shade50;
      iconColor = Colors.redAccent;
    } else if (!value) {
      iconBgColor = isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9);
      iconColor = textMutedColor;
    }

    return Container(
      padding: const EdgeInsets.all(20),
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
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: iconBgColor,
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
                const SizedBox(height: 4),
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
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: activeColor ?? primaryColor,
            thumbColor: MaterialStateProperty.resolveWith<Color?>((states) {
              if (states.contains(MaterialState.selected)) {
                return activeColor ?? primaryColor;
              }
              return isDark ? Colors.grey[400] : Colors.white;
            }),
            trackColor: MaterialStateProperty.resolveWith<Color?>((states) {
              if (states.contains(MaterialState.selected)) {
                return (activeColor ?? primaryColor).withOpacity(0.35);
              }
              return isDark ? Colors.grey[700] : Colors.grey[300];
            }),
          ),
        ],
      ),
    );
  }
}
