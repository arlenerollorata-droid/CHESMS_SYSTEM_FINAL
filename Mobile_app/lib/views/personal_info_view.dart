import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../viewmodels/auth_viewmodel.dart';
import '../utils/theme.dart';
import 'edit_personal_info_view.dart';

class PersonalInfoView extends StatefulWidget {
  const PersonalInfoView({super.key});

  @override
  State<PersonalInfoView> createState() => _PersonalInfoViewState();
}

class _PersonalInfoViewState extends State<PersonalInfoView> {
  final ImagePicker _picker = ImagePicker();
  bool _isUploadingImage = false;

  Future<void> _showImageSourceOptions() async {
    await showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Wrap(
            children: [
              ListTile(
                leading: const Icon(Icons.photo_camera_outlined),
                title: const Text('Take Photo'),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickProfileImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library_outlined),
                title: const Text('Choose from Gallery'),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickProfileImage(ImageSource.gallery);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _pickProfileImage(ImageSource source) async {
    try {
      final pickedFile = await _picker.pickImage(source: source, imageQuality: 85);
      if (pickedFile == null) return;

      setState(() => _isUploadingImage = true);
      final authViewModel = Provider.of<AuthViewModel>(context, listen: false);
      final result = await authViewModel.updateProfileImage(File(pickedFile.path));

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result ? 'Profile image updated' : (authViewModel.errorMessage ?? 'Upload failed')),
          backgroundColor: result ? Colors.green : Colors.red,
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Unable to pick image right now.'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isUploadingImage = false);
      }
    }
  }

  String _formatDate(String? dateString) {
    if (dateString == null || dateString.isEmpty || dateString == 'N/A') {
      return 'N/A';
    }
    try {
      final date = DateTime.parse(dateString);
      return '${date.month.toString().padLeft(2, '0')}/${date.day.toString().padLeft(2, '0')}/${date.year}';
    } catch (e) {
      return 'N/A';
    }
  }

  @override
  Widget build(BuildContext context) {
    final authViewModel = Provider.of<AuthViewModel>(context);
    final userData = authViewModel.userData;

    final userName = (
      userData?['name'] ??
      [userData?['firstName'], userData?['middleName'], userData?['lastName']]
        .where((part) => part != null && part.toString().trim().isNotEmpty)
        .join(' ')
    );
    final userEmail = userData?['email'] ?? 'N/A';
    final userId = userData?['id'] ?? userData?['_id'] ?? 'N/A';
    final userHealthId = userData?['healthId'] ?? userId;
    final userPhone = userData?['contactNumber'] ?? userData?['phone'] ?? 'N/A';
    final userBirthdate = userData?['birthdate'] ?? 'N/A';
    final userGender = userData?['gender'] ?? 'N/A';
    final userCivilStatus = userData?['civilStatus'] ?? 'N/A';
    final userBarangay = userData?['barangay'] ?? '';
    final userPurok = userData?['purok'] ?? '';
    final userMunicipality = userData?['municipality'] ?? '';
    final userProvince = userData?['province'] ?? '';
    final userStreet = userData?['streetAddress'] ?? userData?['street'] ?? '';
    final userAddress = [userStreet, userPurok, userBarangay, userMunicipality, userProvince]
      .where((part) => part.toString().trim().isNotEmpty)
      .join(', ');
    final profileImageUrl = userData?['profileImage']?.toString();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _buildProfileHeader(context, userName.isNotEmpty ? userName : 'N/A', userHealthId, profileImageUrl),
              const SizedBox(height: 48),
              
              _buildSectionTitle(context, Icons.badge_outlined, 'Personal Information'),
              const SizedBox(height: 16),
              _buildBasicDetailsCard(context, userName, _formatDate(userBirthdate), userGender, userCivilStatus),
              const SizedBox(height: 32),
              
              _buildSectionTitle(context, Icons.contact_page_outlined, 'Contact Info'),
              const SizedBox(height: 16),
              _buildContactInfoCard(context, userEmail, userPhone, userAddress.isNotEmpty ? userAddress : 'N/A'),
              const SizedBox(height: 32),

              _buildSectionTitle(context, Icons.account_balance_wallet_outlined, 'Government IDs'),
              const SizedBox(height: 16),
              _buildGovernmentIDsList(context),
              const SizedBox(height: 48),

              _buildEditButton(context),
              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, String name, String userHealthId, String? profileImageUrl) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = isDark ? AppTheme.primaryLight : AppTheme.primaryBlue;

    return Column(
      children: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: primaryColor, width: 3),
                boxShadow: [
                  BoxShadow(
                    color: primaryColor.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  )
                ],
              ),
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Theme.of(context).scaffoldBackgroundColor, width: 4),
                ),
                child: CircleAvatar(
                  radius: 48,
                  backgroundImage: (profileImageUrl != null && profileImageUrl.isNotEmpty)
                      ? NetworkImage(profileImageUrl)
                      : null,
                  backgroundColor: Colors.white,
                  child: (profileImageUrl == null || profileImageUrl.isEmpty)
                      ? const Icon(Icons.person, color: AppTheme.primaryBlue, size: 42)
                      : null,
                ),
              ),
            ),
            Positioned(
              right: -2,
              bottom: -2,
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: _isUploadingImage ? null : _showImageSourceOptions,
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: primaryColor,
                      shape: BoxShape.circle,
                      border: Border.all(color: Theme.of(context).scaffoldBackgroundColor, width: 2),
                    ),
                    child: Center(
                      child: _isUploadingImage
                          ? const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Icon(Icons.camera_alt, color: Colors.white, size: 16),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Text(
          name,
          style: GoogleFonts.inter(
            color: Theme.of(context).textTheme.bodyLarge?.color,
            fontSize: 24,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: isDark ? primaryColor.withOpacity(0.15) : AppTheme.primarySoft,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            'Health ID: $userHealthId',
            style: GoogleFonts.inter(
              color: primaryColor,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(BuildContext context, IconData icon, String title) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = isDark ? AppTheme.primaryLight : AppTheme.primaryBlue;

    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isDark ? primaryColor.withOpacity(0.1) : AppTheme.primarySoft,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 20, color: primaryColor),
        ),
        const SizedBox(width: 12),
        Text(
          title,
          style: GoogleFonts.inter(
            color: Theme.of(context).textTheme.bodyLarge?.color,
            fontSize: 18,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }

  Widget _buildBasicDetailsCard(BuildContext context, String name, String birthdate, String gender, String civilStatus) {
    final dividerColor = Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.1);
    
    return _buildCardWrapper(
      context,
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildDetailItem(context, 'FULL NAME', name),
          Divider(height: 32, thickness: 1, color: dividerColor),
          Row(
            children: [
              Expanded(child: _buildDetailItem(context, 'DATE OF BIRTH', birthdate)),
              Expanded(child: _buildDetailItem(context, 'GENDER', gender)),
            ],
          ),
          Divider(height: 32, thickness: 1, color: dividerColor),
          _buildDetailItem(context, 'CIVIL STATUS', civilStatus),
        ],
      ),
    );
  }

  Widget _buildDetailItem(BuildContext context, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            color: Theme.of(context).textTheme.bodyMedium?.color,
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.0,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: GoogleFonts.inter(
            color: Theme.of(context).textTheme.bodyLarge?.color,
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  Widget _buildContactInfoCard(BuildContext context, String email, String phone, String address) {
    final dividerColor = Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.1);

    return _buildCardWrapper(
      context,
      Column(
        children: [
          _buildContactRow(context, Icons.phone_android, 'MOBILE NUMBER', phone),
          Divider(height: 32, thickness: 1, color: dividerColor),
          _buildContactRow(context, Icons.email_outlined, 'EMAIL', email),
          Divider(height: 32, thickness: 1, color: dividerColor),
          _buildContactRow(context, Icons.location_on_outlined, 'ADDRESS', address),
        ],
      ),
    );
  }

  Widget _buildContactRow(BuildContext context, IconData icon, String label, String value) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = isDark ? AppTheme.primaryLight : AppTheme.primaryBlue;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            shape: BoxShape.circle,
            border: Border.all(color: primaryColor.withOpacity(0.1), width: 1.5),
          ),
          child: Icon(icon, size: 20, color: primaryColor),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.inter(
                  color: Theme.of(context).textTheme.bodyMedium?.color,
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: GoogleFonts.inter(
                  color: Theme.of(context).textTheme.bodyLarge?.color,
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildGovernmentIDsList(BuildContext context) {
    return Column(
      children: [
        _buildIDCard(context, 'PHILHEALTH ID', '12-000456789-1', 'ACTIVE', true),
        const SizedBox(height: 16),
        _buildIDCard(context, 'SENIOR CITIZEN ID', 'Not Applicable', null, false),
      ],
    );
  }

  Widget _buildIDCard(BuildContext context, String label, String value, String? status, bool isActive) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = isDark ? AppTheme.primaryLight : AppTheme.primaryBlue;
    
    return _buildCardWrapper(
      context,
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.inter(
                  color: Theme.of(context).textTheme.bodyMedium?.color,
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: GoogleFonts.inter(
                  color: Theme.of(context).textTheme.bodyLarge?.color,
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          if (status != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: isDark ? primaryColor.withOpacity(0.2) : primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                status,
                style: GoogleFonts.inter(
                  color: primaryColor,
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.0,
                ),
              ),
            ),
          if (status == null && !isActive)
            Icon(Icons.lock_outline, color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.5), size: 20),
        ],
      ),
    );
  }

  Widget _buildEditButton(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = isDark ? AppTheme.primaryLight : AppTheme.primaryBlue;

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const EditPersonalInfoView()),
          );
        },
        icon: const Icon(Icons.edit_note, color: Colors.white, size: 22),
        label: Text(
          'Edit Information',
          style: GoogleFonts.inter(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }

  Widget _buildCardWrapper(BuildContext context, Widget child) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: child,
    );
  }
}