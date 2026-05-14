import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../viewmodels/auth_viewmodel.dart';
import '../utils/theme.dart';

class AddFamilyMemberView extends StatefulWidget {
  const AddFamilyMemberView({Key? key}) : super(key: key);

  @override
  State<AddFamilyMemberView> createState() => _AddFamilyMemberViewState();
}

class _AddFamilyMemberViewState extends State<AddFamilyMemberView> {
  String? _selectedRelationship = 'Child';
  String? _selectedGender;

  final List<Map<String, dynamic>> _relationships = [
    {'icon': Icons.child_care, 'label': 'Child'},
    {'icon': Icons.favorite, 'label': 'Spouse'},
    {'icon': Icons.elderly, 'label': 'Parent'},
    {'icon': Icons.more_horiz, 'label': 'Other'},
  ];

  final List<String> _genders = ['Male', 'Female'];

  @override
  Widget build(BuildContext context) {
    final authViewModel = Provider.of<AuthViewModel>(context);
    final userData = authViewModel.userData;
    final userName = userData?['name']?.toString().isNotEmpty == true ? userData!['name'] : 'Maria Santos';
    final userInitials = userName.toString().trim().split(' ').map((e) => e[0]).take(2).join().toUpperCase();
    final profileImageUrl = userData?['profileImage']?.toString();

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
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top User Header
                Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: isDark ? primaryColor.withOpacity(0.2) : AppTheme.primarySoft,
                      backgroundImage: (profileImageUrl != null && profileImageUrl.isNotEmpty)
                          ? NetworkImage(profileImageUrl)
                          : null,
                      child: (profileImageUrl == null || profileImageUrl.isEmpty)
                          ? Text(
                              userInitials,
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
                          userName,
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
                ),
                const SizedBox(height: 32),

                // Relationship Card
                _buildCardWrapper(
                  context,
                  child: Column(
                    children: [
                      _buildSectionHeader(context, Icons.family_restroom, 'Relationship to You'),
                      const SizedBox(height: 20),
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 2.2,
                        ),
                        itemCount: _relationships.length,
                        itemBuilder: (context, index) {
                          final rel = _relationships[index];
                          final isSelected = _selectedRelationship == rel['label'];
                          return GestureDetector(
                            onTap: () {
                              setState(() {
                                _selectedRelationship = rel['label'];
                              });
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isSelected ? primaryColor : (isDark ? Colors.transparent : AppTheme.primarySoft),
                                  width: isSelected ? 2 : 1,
                                ),
                                boxShadow: isDark ? null : [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.02),
                                    blurRadius: 5,
                                    offset: const Offset(0, 2),
                                  )
                                ],
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    rel['icon'],
                                    color: isSelected ? primaryColor : textMutedColor,
                                    size: 20,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    rel['label'],
                                    style: GoogleFonts.inter(
                                      fontSize: 12,
                                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                                      color: isSelected ? textColor : textMutedColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Personal Information Card
                _buildCardWrapper(
                  context,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionHeader(context, Icons.person, 'Personal Information'),
                      const SizedBox(height: 20),
                      
                      _buildLabel('Full Name', textColor),
                      _buildTextField(context, hint: 'e.g. Juan De La Cruz'),
                      const SizedBox(height: 20),
                      
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Birthdate', textColor),
                                _buildTextField(
                                  context, 
                                  hint: 'mm/dd/yyyy',
                                  suffixIcon: Icons.calendar_today_outlined,
                                  readOnly: true,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Gender', textColor),
                                _buildDropdown(
                                  context,
                                  hint: 'Gender',
                                  value: _selectedGender,
                                  items: _genders,
                                  onChanged: (val) => setState(() => _selectedGender = val as String?),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Health Background Card
                _buildCardWrapper(
                  context,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(child: _buildSectionHeader(context, Icons.monitor_heart, 'Health Background')),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFFD97706).withOpacity(0.2) : const Color(0xFFFEF3C7),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'Optional',
                              style: GoogleFonts.inter(
                                color: const Color(0xFFD97706),
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      
                      _buildLabel('Existing Conditions', textColor),
                      _buildTextField(
                        context, 
                        hint: 'List any chronic conditions or illnesses...',
                        maxLines: 3,
                      ),
                      const SizedBox(height: 20),
                      
                      _buildLabel('Known Allergies', textColor),
                      _buildTextField(context, hint: 'e.g. Peanuts, Penicillin...'),
                    ],
                  ),
                ),
                
                // Add padding at bottom so button doesn't cover content
                const SizedBox(height: 140),
              ],
            ),
          ),

          // Bottom Action Button
          Positioned(
            left: 24,
            right: 24,
            bottom: 24,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.check_circle, color: Colors.white, size: 20),
                    label: Text(
                      'Complete Registry',
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
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Sa BHC, bawat pamilya ay mahalaga.',
                  style: GoogleFonts.inter(
                    color: textMutedColor,
                    fontSize: 12,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCardWrapper(BuildContext context, {required Widget child}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B).withOpacity(0.5) : AppTheme.primarySoft.withOpacity(0.5),
        borderRadius: BorderRadius.circular(24),
      ),
      padding: const EdgeInsets.all(24),
      child: child,
    );
  }

  Widget _buildSectionHeader(BuildContext context, IconData icon, String title) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = isDark ? AppTheme.primaryLight : AppTheme.primaryBlue;

    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isDark ? primaryColor.withOpacity(0.15) : primaryColor.withOpacity(0.2),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, size: 20, color: primaryColor),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            title,
            style: GoogleFonts.inter(
              color: Theme.of(context).textTheme.bodyLarge?.color,
              fontSize: 16,
              fontWeight: FontWeight.w800,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildLabel(String text, Color textColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, left: 4.0),
      child: Text(
        text,
        style: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: textColor.withOpacity(0.8),
        ),
      ),
    );
  }

  Widget _buildTextField(
    BuildContext context, {
    required String hint,
    IconData? suffixIcon,
    bool readOnly = false,
    int maxLines = 1,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;
    final bgColor = isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0); // Darker grey for inputs inside soft cards

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: TextField(
        readOnly: readOnly,
        maxLines: maxLines,
        style: GoogleFonts.inter(
          fontSize: 14,
          color: Theme.of(context).textTheme.bodyLarge?.color,
        ),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: GoogleFonts.inter(
            color: textMutedColor.withOpacity(0.8),
            fontSize: 14,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          suffixIcon: suffixIcon != null ? Icon(suffixIcon, color: textMutedColor, size: 18) : null,
        ),
      ),
    );
  }

  Widget _buildDropdown(
    BuildContext context, {
    required String hint,
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;
    final bgColor = isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);

    return Container(
      height: 48, // Match text field height
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          hint: Text(
            hint,
            style: GoogleFonts.inter(
              color: textMutedColor.withOpacity(0.8),
              fontSize: 14,
            ),
          ),
          isExpanded: true,
          icon: Icon(Icons.keyboard_arrow_down_rounded, color: textMutedColor, size: 20),
          dropdownColor: Theme.of(context).colorScheme.surface,
          items: items.map((String item) {
            return DropdownMenuItem<String>(
              value: item,
              child: Text(
                item,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: Theme.of(context).textTheme.bodyLarge?.color,
                ),
              ),
            );
          }).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }
}
