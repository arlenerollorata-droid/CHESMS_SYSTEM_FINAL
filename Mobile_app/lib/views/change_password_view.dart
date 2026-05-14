import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/theme.dart';

class ChangePasswordView extends StatefulWidget {
  const ChangePasswordView({Key? key}) : super(key: key);

  @override
  State<ChangePasswordView> createState() => _ChangePasswordViewState();
}

class _ChangePasswordViewState extends State<ChangePasswordView> {
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  final _newPasswordFocusNode = FocusNode();

  bool _obscureCurrent = true;
  bool _obscureNew = true;
  bool _obscureConfirm = true;

  bool _has8Chars = false;
  bool _hasNumber = false;
  bool _hasUpperLower = false;
  bool _hasSpecial = false;

  bool get _isFullyValid => _has8Chars && _hasNumber && _hasUpperLower && _hasSpecial;
  bool _isTypingNewPassword = false;

  @override
  void initState() {
    super.initState();
    _newPasswordController.addListener(_validatePassword);
    _newPasswordFocusNode.addListener(() {
      setState(() {
        _isTypingNewPassword = _newPasswordFocusNode.hasFocus;
      });
    });
  }

  void _validatePassword() {
    final text = _newPasswordController.text;
    setState(() {
      _has8Chars = text.length >= 8;
      _hasNumber = RegExp(r'\d').hasMatch(text);
      _hasUpperLower = RegExp(r'(?=.*[a-z])(?=.*[A-Z])').hasMatch(text);
      _hasSpecial = RegExp(r'[!@#\$&*~`%\^()_+={}\[\]|\\:;"<>,.?/-]').hasMatch(text);
    });
  }

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    _newPasswordFocusNode.dispose();
    super.dispose();
  }

  int get _strengthScore {
    int score = 0;
    if (_has8Chars) score++;
    if (_hasNumber) score++;
    if (_hasUpperLower) score++;
    if (_hasSpecial) score++;
    return score;
  }

  String get _strengthText {
    if (_strengthScore <= 1) return "WEAK";
    if (_strengthScore <= 3) return "MODERATE";
    return "STRONG";
  }

  Color _getStrengthColor(BuildContext context, bool isDark) {
    if (_strengthScore <= 1) return Colors.redAccent;
    if (_strengthScore <= 3) return const Color(0xFFD97706); // Amber/Orange
    return isDark ? AppTheme.primaryLight : AppTheme.primaryBlue; // Strong uses primary
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black;
    final textMutedColor = Theme.of(context).textTheme.bodyMedium?.color ?? Colors.grey;
    final primaryColor = isDark ? AppTheme.primaryLight : AppTheme.primaryBlue;

    final bool showValidation = (_isTypingNewPassword || _newPasswordController.text.isNotEmpty) && !_isFullyValid;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Change Password'),
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
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('CURRENT PASSWORD', primaryColor),
                      const SizedBox(height: 8),
                      _buildTextField(
                        controller: _currentPasswordController,
                        hintText: '••••••••••••',
                        obscureText: _obscureCurrent,
                        onToggleVisibility: () {
                          setState(() {
                            _obscureCurrent = !_obscureCurrent;
                          });
                        },
                      ),
                      const SizedBox(height: 24),
                      
                      _buildLabel('NEW PASSWORD', primaryColor),
                      const SizedBox(height: 8),
                      _buildTextField(
                        controller: _newPasswordController,
                        focusNode: _newPasswordFocusNode,
                        hintText: 'Create a strong password',
                        obscureText: _obscureNew,
                        onToggleVisibility: () {
                          setState(() {
                            _obscureNew = !_obscureNew;
                          });
                        },
                      ),
                      
                      // Animated Validation Box
                      AnimatedSize(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                        child: showValidation ? Padding(
                          padding: const EdgeInsets.only(top: 16.0),
                          child: Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: isDark ? primaryColor.withOpacity(0.1) : AppTheme.primarySoft,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Password Strength',
                                      style: GoogleFonts.inter(
                                        color: textColor,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    Text(
                                      _strengthText,
                                      style: GoogleFonts.inter(
                                        color: _getStrengthColor(context, isDark),
                                        fontSize: 12,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 1.0,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                // Strength Bars
                                Row(
                                  children: [
                                    Expanded(child: _buildStrengthBar(0, isDark)),
                                    const SizedBox(width: 4),
                                    Expanded(child: _buildStrengthBar(1, isDark)),
                                    const SizedBox(width: 4),
                                    Expanded(child: _buildStrengthBar(2, isDark)),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                _buildValidationRule('At least 8 characters', _has8Chars, primaryColor, textMutedColor),
                                const SizedBox(height: 8),
                                _buildValidationRule('At least 1 number', _hasNumber, primaryColor, textMutedColor),
                                const SizedBox(height: 8),
                                _buildValidationRule('Upper & lowercase', _hasUpperLower, primaryColor, textMutedColor),
                                const SizedBox(height: 8),
                                _buildValidationRule('Special character', _hasSpecial, primaryColor, textMutedColor),
                              ],
                            ),
                          ),
                        ) : const SizedBox.shrink(),
                      ),
                      
                      const SizedBox(height: 24),
                      
                      _buildLabel('CONFIRM NEW PASSWORD', primaryColor),
                      const SizedBox(height: 8),
                      _buildTextField(
                        controller: _confirmPasswordController,
                        hintText: 'Re-enter new password',
                        obscureText: _obscureConfirm,
                        onToggleVisibility: () {
                          setState(() {
                            _obscureConfirm = !_obscureConfirm;
                          });
                        },
                      ),
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
                  onPressed: _isFullyValid && _newPasswordController.text == _confirmPasswordController.text ? () {
                    // Save password logic here
                    Navigator.pop(context);
                  } : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    disabledBackgroundColor: isDark ? Colors.grey[800] : Colors.grey[300],
                    disabledForegroundColor: isDark ? Colors.grey[500] : Colors.grey[500],
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    'Save Password',
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

  Widget _buildLabel(String text, Color primaryColor) {
    return Text(
      text,
      style: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w800,
        color: primaryColor,
        letterSpacing: 1.0,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hintText,
    required bool obscureText,
    required VoidCallback onToggleVisibility,
    FocusNode? focusNode,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final fillColor = isDark ? Theme.of(context).colorScheme.surface : const Color(0xFFF1F5F9);
    final borderColor = isDark ? const Color(0xFF334155) : Colors.transparent;
    
    return TextField(
      controller: controller,
      focusNode: focusNode,
      obscureText: obscureText,
      style: GoogleFonts.inter(
        fontSize: 15,
        color: Theme.of(context).textTheme.bodyLarge?.color,
      ),
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: GoogleFonts.inter(
          color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.6),
        ),
        filled: true,
        fillColor: fillColor,
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(
            color: isDark ? AppTheme.primaryLight : AppTheme.primaryBlue, 
            width: 1.5
          ),
        ),
        suffixIcon: IconButton(
          icon: Icon(
            obscureText ? Icons.visibility_outlined : Icons.visibility_off_outlined,
            color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.6),
          ),
          onPressed: onToggleVisibility,
        ),
      ),
    );
  }

  Widget _buildStrengthBar(int index, bool isDark) {
    bool isActive = false;
    if (_strengthScore >= 4) {
      isActive = true; // All bars active when strong
    } else if (_strengthScore >= 2 && index <= 1) {
      isActive = true; // First two active when moderate
    } else if (_strengthScore >= 1 && index == 0) {
      isActive = true; // First one active when weak
    }

    Color activeColor = _getStrengthColor(context, isDark);
    Color inactiveColor = isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      height: 6,
      decoration: BoxDecoration(
        color: isActive ? activeColor : inactiveColor,
        borderRadius: BorderRadius.circular(3),
      ),
    );
  }

  Widget _buildValidationRule(String text, bool isMet, Color primaryColor, Color textMutedColor) {
    return Row(
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: isMet ? primaryColor : Colors.transparent,
            shape: BoxShape.circle,
            border: Border.all(
              color: isMet ? primaryColor : textMutedColor,
              width: 1.5,
            ),
          ),
          child: isMet ? const Icon(Icons.check, size: 10, color: Colors.white) : null,
        ),
        const SizedBox(width: 12),
        Text(
          text,
          style: GoogleFonts.inter(
            color: isMet ? primaryColor : textMutedColor,
            fontSize: 14,
            fontWeight: isMet ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
