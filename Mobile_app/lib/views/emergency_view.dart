import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/theme.dart';

class EmergencyView extends StatelessWidget {
  const EmergencyView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;
    final primaryColor = isDark ? AppTheme.primaryLight : AppTheme.primaryBlue;
    final surfaceColor = Theme.of(context).colorScheme.surface;

    // The emergency red color requested
    const emergencyRed = Color(0xFFDC2626);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          'Emergency',
          style: GoogleFonts.inter(
            color: textColor,
            fontSize: 18,
            fontWeight: FontWeight.w800,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: textColor),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Barangay Hotlines Section
            _buildSectionHeader('Hotlines', primaryColor),
            const SizedBox(height: 16),
            _buildContactCard(
              context: context,
              icon: Icons.local_hospital_outlined,
              title: 'Health Center',
              subtitle: '888-BHC',
              hasCallBtn: false,
              primaryColor: primaryColor,
              surfaceColor: surfaceColor,
              textColor: textColor,
              textMutedColor: textMutedColor,
            ),
            const SizedBox(height: 12),
            _buildContactCard(
              context: context,
              avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=150&auto=format&fit=crop', // Stock doctor/health worker img
              title: 'BHW On Duty',
              description: 'Rosario Santos',
              subtitle: '0917-555-0123',
              hasCallBtn: false,
              primaryColor: primaryColor,
              surfaceColor: surfaceColor,
              textColor: textColor,
              textMutedColor: textMutedColor,
            ),
            const SizedBox(height: 12),
            _buildSmallContactCard(
              context: context,
              icon: Icons.account_balance_outlined,
              title: 'Barangay Hall',
              subtitle: '821-4432',
              primaryColor: primaryColor,
              textColor: textColor,
              textMutedColor: textMutedColor,
            ),

            const SizedBox(height: 32),

            // National Hotlines Section
            _buildSectionHeader('National Hotlines', primaryColor),
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
                  _buildNationalRow(
                    context: context,
                    icon: Icons.health_and_safety,
                    iconBgColor: const Color(0xFFD97706), // Amber map
                    title: 'DOH Hotline',
                    description: 'Mental Health / COVID',
                    number: '1555',
                    primaryColor: primaryColor,
                  ),
                  _buildDivider(textMutedColor),
                  _buildNationalRow(
                    context: context,
                    icon: Icons.warning,
                    iconBgColor: const Color(0xFFDC2626), // Red map
                    title: 'NDRRMC',
                    description: 'Disaster Response',
                    number: '911',
                    primaryColor: primaryColor,
                  ),
                  _buildDivider(textMutedColor),
                  _buildNationalRow(
                    context: context,
                    icon: Icons.local_police,
                    iconBgColor: primaryColor, // Blue Map
                    title: 'PNP',
                    description: 'Police Assistance',
                    number: '117',
                    primaryColor: primaryColor,
                  ),
                  _buildDivider(textMutedColor),
                  _buildNationalRow(
                    context: context,
                    icon: Icons.fire_truck,
                    iconBgColor: const Color(0xFFB91C1C), // Deep Red for fire
                    title: 'BFP',
                    description: 'Fire Emergency',
                    number: '160',
                    primaryColor: primaryColor,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Nearest Hospitals Section
            _buildSectionHeader('Nearest Hospitals', primaryColor),
            const SizedBox(height: 16),
            _buildHospitalCard(
              context: context,
              imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=250&auto=format&fit=crop',
              name: 'Davao Oriental Provincial Medical Center',
              distance: '1.2 km',
              address: 'Davao Oriental',
              phone: '(02) 8999 1234',
              primaryColor: primaryColor,
              surfaceColor: surfaceColor,
              textColor: textColor,
              textMutedColor: textMutedColor,
            ),
            const SizedBox(height: 12),
            _buildHospitalCard(
              context: context,
              imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=250&auto=format&fit=crop',
              name: 'Madang Health Center',
              distance: '2.8 km',
              address: 'Madang, Davao Oriental',
              phone: '(02) 7777 8888',
              primaryColor: primaryColor,
              surfaceColor: surfaceColor,
              textColor: textColor,
              textMutedColor: textMutedColor,
            ),
            
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, Color primaryColor) {
    return Row(
      children: [
        Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: primaryColor,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Container(
            height: 1,
            color: primaryColor.withOpacity(0.2),
          ),
        ),
      ],
    );
  }
  
  Widget _buildDivider(Color mutedColor) {
    return Divider(height: 1, indent: 64, endIndent: 20, color: mutedColor.withOpacity(0.1));
  }

  Widget _buildContactCard({
    required BuildContext context,
    IconData? icon,
    String? avatarUrl,
    required String title,
    String? description,
    required String subtitle,
    required bool hasCallBtn,
    required Color primaryColor,
    required Color surfaceColor,
    required Color textColor,
    required Color textMutedColor,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
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
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (avatarUrl != null)
                CircleAvatar(
                  radius: 20,
                  backgroundImage: NetworkImage(avatarUrl),
                  backgroundColor: isDark ? primaryColor.withOpacity(0.2) : AppTheme.primarySoft,
                )
              else if (icon != null)
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isDark ? primaryColor.withOpacity(0.15) : AppTheme.primarySoft,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: primaryColor, size: 24),
                ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: textColor,
                      ),
                    ),
                    if (description != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        description,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: textMutedColor,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            subtitle,
            style: GoogleFonts.inter(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: primaryColor,
              letterSpacing: 1.0,
            ),
          ),
          if (hasCallBtn) ...[
            const SizedBox(height: 16),
            const SizedBox.shrink(),
          ]
        ],
      ),
    );
  }

  Widget _buildSmallContactCard({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required Color primaryColor,
    required Color textColor,
    required Color textMutedColor,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
           Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: textMutedColor, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: textColor,
                  ),
                ),
                Text(
                  subtitle,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: primaryColor,
                  ),
                ),
              ],
            ),
          ),
          ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.phone, color: Colors.white, size: 14),
            label: Text(
              'Call',
              style: GoogleFonts.inter(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryColor,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNationalRow({
    required BuildContext context,
    required IconData icon,
    required Color iconBgColor,
    required String title,
    required String description,
    required String number,
    required Color primaryColor,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconBgColor.withOpacity(isDark ? 0.2 : 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: iconBgColor, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: textColor,
                  ),
                ),
                Text(
                  description,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: textMutedColor,
                  ),
                ),
              ],
            ),
          ),
          Text(
            number,
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: primaryColor,
            ),
          ),
          const SizedBox(width: 12),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isDark ? primaryColor.withOpacity(0.15) : AppTheme.primarySoft,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.phone, size: 16, color: primaryColor),
          ),
        ],
      ),
    );
  }

  Widget _buildHospitalCard({
    required BuildContext context,
    required String imageUrl,
    required String name,
    required String distance,
    required String address,
    required String phone,
    required Color primaryColor,
    required Color surfaceColor,
    required Color textColor,
    required Color textMutedColor,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
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
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.network(
              imageUrl,
              width: 70,
              height: 70,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        name,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: textColor,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isDark ? primaryColor.withOpacity(0.15) : AppTheme.primarySoft,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        distance,
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          color: primaryColor,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  address,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: textMutedColor,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.phone, size: 12, color: primaryColor),
                    const SizedBox(width: 4),
                    Text(
                      phone,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: primaryColor,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
