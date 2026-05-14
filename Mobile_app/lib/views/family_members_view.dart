import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../utils/theme.dart';
import '../viewmodels/auth_viewmodel.dart';
import 'add_family_member_view.dart';

class FamilyMembersView extends StatelessWidget {
  const FamilyMembersView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authViewModel = Provider.of<AuthViewModel>(context);
    final userData = authViewModel.userData;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;
    final primaryColor = isDark ? AppTheme.primaryLight : AppTheme.primaryBlue;

    final userName = userData?['name']?.toString().isNotEmpty == true
      ? userData!['name'].toString()
      : 'Account Holder';
    final userProfileImage = userData?['profileImage']?.toString();
    final userInitials = userName
      .trim()
      .split(RegExp(r'\s+'))
      .where((part) => part.isNotEmpty)
      .map((part) => part[0])
      .take(2)
      .join()
      .toUpperCase();

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
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(left: 24.0, right: 24.0, top: 8.0, bottom: 100), // Bottom padding for FAB
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'MY HOUSEHOLD',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFFD97706), // Amber
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Manage your\nloved ones\' care.',
                  style: GoogleFonts.inter(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    color: textColor,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 24),
                
                // Info Banner
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? primaryColor.withOpacity(0.15) : AppTheme.primarySoft,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: primaryColor,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.info_outline, color: Colors.white, size: 16),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Keep records updated for faster emergency assistance and immunization tracking.',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: isDark ? Colors.white : AppTheme.primaryDark,
                            height: 1.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                
                // Primary dependent (logged-in account)
                _buildPrimaryAccountHolderHeader(
                  context: context,
                  name: userName,
                  profileImage: userProfileImage,
                  initials: userInitials,
                  primaryColor: primaryColor,
                ),
              ],
            ),
          ),
          
          // Bottom Add Button
          Positioned(
            left: 24,
            right: 24,
            bottom: 24,
            child: SizedBox(
              height: 56,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const AddFamilyMemberView()),
                  );
                },
                icon: const Icon(Icons.person_add_alt_1, color: Colors.white, size: 20),
                label: Text(
                  'Add Family Member',
                  style: GoogleFonts.inter(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  elevation: 4,
                  shadowColor: primaryColor.withOpacity(0.4),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrimaryAccountHolderHeader({
    required BuildContext context,
    required String name,
    required String initials,
    String? profileImage,
    required Color primaryColor,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;

    return Row(
      children: [
        CircleAvatar(
          radius: 24,
          backgroundColor: isDark ? primaryColor.withOpacity(0.2) : AppTheme.primarySoft,
          backgroundImage: (profileImage != null && profileImage.isNotEmpty)
              ? NetworkImage(profileImage)
              : null,
          child: (profileImage == null || profileImage.isEmpty)
              ? Text(
                  initials,
                  style: GoogleFonts.inter(
                    color: primaryColor,
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                )
              : null,
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              name,
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: textColor,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              'Primary Account Holder',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: textMutedColor,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
