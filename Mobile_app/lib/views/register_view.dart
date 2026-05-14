import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewmodels/auth_viewmodel.dart';
import '../utils/theme.dart';

class RegisterView extends StatefulWidget {
  const RegisterView({super.key});

  @override
  State<RegisterView> createState() => _RegisterViewState();
}

class _RegisterViewState extends State<RegisterView> {
  // Personal Info
  final _firstNameController = TextEditingController();
  final _middleNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  DateTime? _selectedBirthday;
  String? _selectedGender;
  String _selectedCivilStatus = "Single";

  // Contact Info
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _purokController = TextEditingController();
  String? _selectedBarangay;
  final _municipalityController = TextEditingController();
  final _provinceController = TextEditingController();
  final _streetAddressController = TextEditingController();

  // Account Security
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _firstNameController.dispose();
    _middleNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _purokController.dispose();
    _municipalityController.dispose();
    _provinceController.dispose();
    _streetAddressController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (_selectedBirthday == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select your birthday')));
      return;
    }

    if (_selectedBarangay == null || _selectedBarangay!.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select your barangay')));
      return;
    }

    if (_firstNameController.text.trim().isEmpty ||
        _lastNameController.text.trim().isEmpty ||
        _purokController.text.trim().isEmpty ||
        _municipalityController.text.trim().isEmpty ||
        _provinceController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required resident details')),
      );
      return;
    }

    if (_passwordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Passwords do not match')));
      return;
    }

    final viewModel = Provider.of<AuthViewModel>(context, listen: false);
    final success = await viewModel.register(
      _firstNameController.text.trim(),
      _middleNameController.text.trim().isNotEmpty ? _middleNameController.text.trim() : null,
      _lastNameController.text.trim(),
      _emailController.text.trim(),
      _passwordController.text,
      _phoneController.text.trim().isNotEmpty ? _phoneController.text.trim() : null,
      _selectedBirthday!.toIso8601String(),
      _selectedGender,
      _selectedCivilStatus,
      _purokController.text.trim(),
      _selectedBarangay!,
      _municipalityController.text.trim(),
      _provinceController.text.trim(),
      _streetAddressController.text.trim().isNotEmpty ? _streetAddressController.text.trim() : null,
    );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Registration Successful! Please log in.'),
        ),
      );
      Navigator.pop(context);
    }
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().subtract(const Duration(days: 365 * 18)),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() {
        _selectedBirthday = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<AuthViewModel>(context);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(
          color: Theme.of(context).textTheme.bodyLarge?.color,
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Theme.of(
                        context,
                      ).textTheme.bodyMedium!.color!.withOpacity(0.3),
                      width: 1.5,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: const Icon(
                    Icons.health_and_safety,
                    color: AppTheme.primaryBlue,
                    size: 28,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Create Account',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Theme.of(context).textTheme.bodyLarge?.color,
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Register to manage your health records.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Theme.of(context).textTheme.bodyMedium?.color,
                ),
              ),
              const SizedBox(height: 24),
              if (viewModel.errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF3F3),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFF5CCCC)),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.error_outline,
                        color: Color(0xFFCB3F3F),
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          viewModel.errorMessage!,
                          style: const TextStyle(
                            color: Color(0xFFCB3F3F),
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

              // CARD 1: Personal Information
              _buildSectionCard(
                iconData: Icons.person,
                iconColor: AppTheme.primaryBlue,
                iconBgColor: AppTheme.primaryBlue.withOpacity(0.1),
                title: 'Personal Information',
                subtitle: 'Impormasyon tungkol sa iyo',
                content: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLabel('FIRST NAME'),
                    _buildTextField(
                      controller: _firstNameController,
                      hintText: 'e.g. Juan',
                    ),
                    const SizedBox(height: 16),
                    _buildLabel('MIDDLE NAME (OPTIONAL)'),
                    _buildTextField(
                      controller: _middleNameController,
                      hintText: 'e.g. Santos',
                    ),
                    const SizedBox(height: 16),
                    _buildLabel('LAST NAME'),
                    _buildTextField(
                      controller: _lastNameController,
                      hintText: 'e.g. Dela Cruz',
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('BIRTHDAY'),
                              GestureDetector(
                                onTap: _pickDate,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 14,
                                  ),
                                  decoration: BoxDecoration(
                                    border: Border.all(
                                      color: Theme.of(context)
                                          .textTheme
                                          .bodyMedium!
                                          .color!
                                          .withOpacity(0.2),
                                    ),
                                    borderRadius: BorderRadius.circular(10),
                                    color: Theme.of(
                                      context,
                                    ).scaffoldBackgroundColor,
                                  ),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        _selectedBirthday == null
                                            ? 'mm/dd/yyyy'
                                            : "${_selectedBirthday!.month.toString().padLeft(2, '0')}/${_selectedBirthday!.day.toString().padLeft(2, '0')}/${_selectedBirthday!.year}",
                                        style: TextStyle(
                                          color: _selectedBirthday == null
                                              ? Theme.of(
                                                  context,
                                                ).textTheme.bodyMedium?.color
                                              : Theme.of(
                                                  context,
                                                ).textTheme.bodyLarge?.color,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Icon(
                                        Icons.calendar_today_outlined,
                                        size: 16,
                                        color: Theme.of(
                                          context,
                                        ).textTheme.bodyMedium?.color,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('GENDER'),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                ),
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: Theme.of(context)
                                        .textTheme
                                        .bodyMedium!
                                        .color!
                                        .withOpacity(0.2),
                                  ),
                                  borderRadius: BorderRadius.circular(10),
                                  color: Theme.of(
                                    context,
                                  ).scaffoldBackgroundColor,
                                ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    isExpanded: true,
                                    dropdownColor: Theme.of(
                                      context,
                                    ).colorScheme.surface,
                                    hint: Text(
                                      "Select",
                                      style: TextStyle(
                                        color: Theme.of(
                                          context,
                                        ).textTheme.bodyMedium?.color,
                                        fontSize: 14,
                                      ),
                                    ),
                                    value: _selectedGender,
                                    icon: Icon(
                                      Icons.keyboard_arrow_down,
                                      color: Theme.of(
                                        context,
                                      ).textTheme.bodyMedium?.color,
                                    ),
                                    items: ['Male', 'Female', 'Other'].map((
                                      String value,
                                    ) {
                                      return DropdownMenuItem<String>(
                                        value: value,
                                        child: Text(
                                          value,
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: Theme.of(
                                              context,
                                            ).textTheme.bodyLarge?.color,
                                          ),
                                        ),
                                      );
                                    }).toList(),
                                    onChanged: (val) {
                                      setState(() {
                                        _selectedGender = val;
                                      });
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildLabel('CIVIL STATUS'),
                    Row(
                      children: ['Single', 'Married', 'Widowed'].map((status) {
                        final isSelected = _selectedCivilStatus == status;
                        return Expanded(
                          child: Padding(
                            padding: EdgeInsets.only(
                              right: status == 'Widowed' ? 0 : 8.0,
                            ),
                            child: GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedCivilStatus = status;
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 12,
                                ),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppTheme.primaryBlue
                                      : Theme.of(
                                          context,
                                        ).scaffoldBackgroundColor,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: isSelected
                                        ? AppTheme.primaryBlue
                                        : Theme.of(context)
                                              .textTheme
                                              .bodyMedium!
                                              .color!
                                              .withOpacity(0.2),
                                  ),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  status,
                                  style: TextStyle(
                                    color: isSelected
                                        ? Colors.white
                                        : Theme.of(
                                            context,
                                          ).textTheme.bodyMedium?.color,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // CARD 2: Contact & Address
              _buildSectionCard(
                iconData: Icons.location_on,
                iconColor: AppTheme.primaryBlue,
                iconBgColor: AppTheme.primaryBlue.withOpacity(0.1),
                title: 'Contact & Address',
                subtitle: 'Saan ka namin maaaring maabot?',
                content: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLabel('EMAIL'),
                    _buildTextField(
                      controller: _emailController,
                      hintText: 'name@example.com',
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    _buildLabel('PHONE NUMBER'),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 14,
                          ),
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: Theme.of(
                                context,
                              ).textTheme.bodyMedium!.color!.withOpacity(0.2),
                            ),
                            borderRadius: BorderRadius.circular(10),
                            color: Theme.of(context).scaffoldBackgroundColor,
                          ),
                          child: Text(
                            "+63",
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              color: Theme.of(
                                context,
                              ).textTheme.bodyLarge?.color,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildTextField(
                            controller: _phoneController,
                            hintText: '912 345 6789',
                            keyboardType: TextInputType.phone,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildLabel('PUROK'),
                    _buildTextField(
                      controller: _purokController,
                      hintText: 'e.g. Purok 1',
                    ),
                    const SizedBox(height: 16),
                    _buildLabel('BARANGAY'),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: Theme.of(
                            context,
                          ).textTheme.bodyMedium!.color!.withOpacity(0.2),
                        ),
                        borderRadius: BorderRadius.circular(10),
                        color: Theme.of(context).scaffoldBackgroundColor,
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          isExpanded: true,
                          dropdownColor: Theme.of(context).colorScheme.surface,
                          hint: Text(
                            "Pumili ng Barangay",
                            style: TextStyle(
                              color: Theme.of(
                                context,
                              ).textTheme.bodyMedium?.color,
                              fontSize: 14,
                            ),
                          ),
                          value: _selectedBarangay,
                          icon: Icon(
                            Icons.keyboard_arrow_down,
                            color: Theme.of(
                              context,
                            ).textTheme.bodyMedium?.color,
                          ),
                          items: ['Barangay Dahican', 'Barangay Sainz', 'Barangay Boso'].map(
                            (String value) {
                              return DropdownMenuItem<String>(
                                value: value,
                                child: Text(
                                  value,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Theme.of(
                                      context,
                                    ).textTheme.bodyLarge?.color,
                                  ),
                                ),
                              );
                            },
                          ).toList(),
                          onChanged: (val) {
                            setState(() {
                              _selectedBarangay = val;
                            });
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildLabel('MUNICIPALITY'),
                    _buildTextField(
                      controller: _municipalityController,
                      hintText: 'e.g. Talavera',
                    ),
                    const SizedBox(height: 16),
                    _buildLabel('PROVINCE'),
                    _buildTextField(
                      controller: _provinceController,
                      hintText: 'e.g. Nueva Ecija',
                    ),
                    const SizedBox(height: 16),
                    _buildLabel('STREET / HOUSE NO. (OPTIONAL)'),
                    _buildTextField(
                      controller: _streetAddressController,
                      hintText: 'e.g. 123 Malakas St.',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // CARD 3: Account Security
              _buildSectionCard(
                iconData: Icons.security,
                iconColor: AppTheme.primaryBlue,
                iconBgColor: AppTheme.primaryBlue.withOpacity(0.1),
                title: 'Account Security',
                subtitle: 'Protektahan ang iyong account',
                content: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLabel('PASSWORD'),
                    _buildPasswordField(
                      controller: _passwordController,
                      obscure: _obscurePassword,
                      onToggle: () =>
                          setState(() => _obscurePassword = !_obscurePassword),
                    ),
                    const SizedBox(height: 16),
                    _buildLabel('CONFIRM PASSWORD'),
                    _buildPasswordField(
                      controller: _confirmPasswordController,
                      obscure: _obscureConfirmPassword,
                      onToggle: () => setState(
                        () =>
                            _obscureConfirmPassword = !_obscureConfirmPassword,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Submit Button
              Container(
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x421F79C4),
                      blurRadius: 22,
                      offset: Offset(0, 10),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  onPressed: viewModel.isLoading ? null : _submit,
                  child: viewModel.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'REGISTER NOW',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "Already have an account?",
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    child: const Text(
                      'Sign In',
                      style: TextStyle(
                        color: AppTheme.primaryBlue,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionCard({
    required IconData iconData,
    required Color iconColor,
    required Color iconBgColor,
    required String title,
    required String subtitle,
    required Widget content,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 10,
            offset: Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: iconBgColor,
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Icon(iconData, color: iconColor, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: Theme.of(context).textTheme.bodyLarge?.color,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: Theme.of(context).textTheme.bodyMedium?.color,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          content,
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Text(
        text,
        style: TextStyle(
          color: Theme.of(context).textTheme.bodyMedium?.color,
          fontSize: 11,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hintText,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      style: TextStyle(
        fontSize: 14,
        color: Theme.of(context).textTheme.bodyLarge?.color,
      ),
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: TextStyle(
          color: Theme.of(context).textTheme.bodyMedium?.color,
          fontSize: 14,
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: Theme.of(
              context,
            ).textTheme.bodyMedium!.color!.withOpacity(0.2),
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: Theme.of(
              context,
            ).textTheme.bodyMedium!.color!.withOpacity(0.2),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppTheme.primaryBlue),
        ),
        filled: true,
        fillColor: Theme.of(context).scaffoldBackgroundColor,
      ),
    );
  }

  Widget _buildPasswordField({
    required TextEditingController controller,
    required bool obscure,
    required VoidCallback onToggle,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscure,
      style: TextStyle(
        fontSize: 14,
        color: Theme.of(context).textTheme.bodyLarge?.color,
        letterSpacing: 2.0,
      ),
      decoration: InputDecoration(
        hintText: '••••••••',
        hintStyle: TextStyle(
          color: Theme.of(context).textTheme.bodyMedium?.color,
          fontSize: 14,
          letterSpacing: 2.0,
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: Theme.of(
              context,
            ).textTheme.bodyMedium!.color!.withOpacity(0.2),
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: Theme.of(
              context,
            ).textTheme.bodyMedium!.color!.withOpacity(0.2),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppTheme.primaryBlue),
        ),
        filled: true,
        fillColor: Theme.of(context).scaffoldBackgroundColor,
        suffixIcon: IconButton(
          icon: Icon(
            obscure ? Icons.visibility_off : Icons.visibility,
            color: Theme.of(context).textTheme.bodyMedium?.color,
            size: 20,
          ),
          onPressed: onToggle,
        ),
      ),
    );
  }
}
