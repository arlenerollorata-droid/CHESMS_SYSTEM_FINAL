import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/event.dart';
import '../viewmodels/event_registration_viewmodel.dart';
import '../utils/theme.dart';

class EventRegistrationView extends StatelessWidget {
  final EventItem event;
  
  const EventRegistrationView({Key? key, required this.event}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => EventRegistrationViewModel(),
      child: _EventRegistrationContent(event: event),
    );
  }
}

class _EventRegistrationContent extends StatelessWidget {
  final EventItem event;

  const _EventRegistrationContent({required this.event});

  Color _getBadgeColor(String category) {
    final cat = category.toLowerCase();
    if (cat.contains('health') || cat.contains('medical')) {
      return const Color(0xFFF59E0B);
    } else if (cat.contains('routine') || cat.contains('service')) {
      return const Color(0xFF14B8A6);
    } else if (cat.contains('community')) {
      return const Color(0xFFF59E0B);
    } else {
      return AppTheme.primaryBlue;
    }
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<EventRegistrationViewModel>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark ? Theme.of(context).scaffoldBackgroundColor : const Color(0xFFF0FBFA);

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        backgroundColor: backgroundColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: isDark ? Colors.white : const Color(0xFF064E3B)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Event Registration',
          style: TextStyle(
            color: isDark ? Colors.white : const Color(0xFF064E3B),
            fontWeight: FontWeight.w800,
            fontSize: 18,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildEventHeaderCard(context, isDark),
            const SizedBox(height: 32),
            _buildSectionTitle(context, 'Personal Information', isDark),
            const SizedBox(height: 16),
            _buildTextField(context, 'Full Name', 'e.g. Maria Clara', (v) => viewModel.setFullName(v), isDark),
            const SizedBox(height: 16),
            _buildTextField(context, 'Age', 'Years', (v) => viewModel.setAge(v), isDark, keyboardType: TextInputType.number),
            const SizedBox(height: 16),
            _buildTextField(context, 'Mobile Number', '09XX XXX XXXX', (v) => viewModel.setMobileNumber(v), isDark, keyboardType: TextInputType.phone),
            const SizedBox(height: 32),
            
            _buildSectionTitle(context, 'Health Assessment', isDark),
            const SizedBox(height: 16),
            Text(
              'Do you have any existing medical conditions?',
              style: TextStyle(
                color: Theme.of(context).textTheme.bodyLarge?.color,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 12),
            _buildMedicalConditionChips(context, viewModel, isDark),
            const SizedBox(height: 16),
            Text(
              'Do you have any food allergies?',
              style: TextStyle(
                color: Theme.of(context).textTheme.bodyLarge?.color,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 12),
            _buildTextField(context, '', 'Please specify if any...', (v) => viewModel.setAllergies(v), isDark, maxLines: 3),
            const SizedBox(height: 32),

            _buildSectionTitle(context, 'Emergency Contact', isDark),
            const SizedBox(height: 16),
            _buildTextField(context, 'Contact Person', 'Name of relative', (v) => viewModel.setContactPerson(v), isDark),
            const SizedBox(height: 16),
            _buildTextField(context, 'Contact Number', '09XX XXX XXXX', (v) => viewModel.setContactNumber(v), isDark, keyboardType: TextInputType.phone),
            const SizedBox(height: 32),

            _buildTermsCheckbox(context, viewModel, isDark),
            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: viewModel.isLoading 
                    ? null 
                    : () async {
                        final success = await viewModel.submitRegistration(event.id);
                        if (success && context.mounted) {
                           ScaffoldMessenger.of(context).showSnackBar(
                             SnackBar(content: Text('Registration processed for ${event.title}')),
                           );
                           Navigator.pop(context); // Go back after success
                        } else if (context.mounted) {
                           ScaffoldMessenger.of(context).showSnackBar(
                             const SnackBar(content: Text('Please fill all required fields and agree to terms.')),
                           );
                        }
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryBlue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                  elevation: 0,
                ),
                icon: viewModel.isLoading 
                  ? const SizedBox(
                      width: 20, height: 20, 
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                    )
                  : const Icon(Icons.check_circle_outline, size: 20),
                label: Text(
                  viewModel.isLoading ? 'Processing...' : 'Confirm Registration',
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                ),
              ),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  Widget _buildEventHeaderCard(BuildContext context, bool isDark) {
    DateTime? eventDate;
    try {
      eventDate = DateTime.parse(event.date);
    } catch (_) {}
    
    final dateText = eventDate != null 
        ? '${_getMonthName(eventDate.month)} ${eventDate.day}, ${eventDate.year}' 
        : event.date;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 15,
            offset: const Offset(0, 5),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.primarySoft,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              event.category.toUpperCase(),
              style: const TextStyle(
                color: AppTheme.primaryBlue,
                fontSize: 10,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            event.title,
            style: TextStyle(
              color: Theme.of(context).textTheme.bodyLarge?.color,
              fontSize: 22,
              fontWeight: FontWeight.w800,
              height: 1.2,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.primarySoft,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.calendar_today, size: 16, color: AppTheme.primaryBlue),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'DATE',
                    style: TextStyle(
                      color: Theme.of(context).textTheme.bodyMedium?.color,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Text(
                    dateText,
                    style: TextStyle(
                      color: Theme.of(context).textTheme.bodyLarge?.color,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              )
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFD1FAE5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.location_on, size: 16, color: Color(0xFF059669)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'VENUE',
                      style: TextStyle(
                        color: Theme.of(context).textTheme.bodyMedium?.color,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                    Text(
                      event.location ?? 'TBA',
                      style: TextStyle(
                        color: Theme.of(context).textTheme.bodyLarge?.color,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              )
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title, bool isDark) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 20,
          decoration: BoxDecoration(
            color: AppTheme.primaryBlue,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(
            color: Theme.of(context).textTheme.bodyLarge?.color,
            fontSize: 16,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }

  Widget _buildTextField(
    BuildContext context, 
    String label, 
    String hint, 
    Function(String) onChanged,
    bool isDark,
    {int maxLines = 1, TextInputType? keyboardType}
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label.isNotEmpty) ...[
          Text(
            label,
            style: TextStyle(
              color: Theme.of(context).textTheme.bodyLarge?.color,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
        ],
        TextFormField(
          onChanged: onChanged,
          maxLines: maxLines,
          keyboardType: keyboardType,
          style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color, fontSize: 14),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.5),
              fontSize: 14,
            ),
            filled: true,
            fillColor: isDark ? Theme.of(context).colorScheme.surface : const Color(0xFFE2E8F0).withOpacity(0.5),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }

  Widget _buildMedicalConditionChips(BuildContext context, EventRegistrationViewModel viewModel, bool isDark) {
    final options = ['None', 'Hypertension', 'Diabetes'];
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: options.map((option) {
        final isSelected = viewModel.medicalCondition == option;
        return GestureDetector(
          onTap: () => viewModel.setMedicalCondition(option),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: isDark ? Theme.of(context).colorScheme.surface : const Color(0xFFE2E8F0).withOpacity(0.5),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected ? AppTheme.primaryBlue : Colors.transparent,
                width: 1.5,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected ? AppTheme.primaryBlue : Theme.of(context).textTheme.bodyMedium!.color!.withOpacity(0.5),
                      width: 2,
                    ),
                  ),
                  child: isSelected
                      ? Center(
                          child: Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppTheme.primaryBlue,
                              shape: BoxShape.circle,
                            ),
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: 8),
                Text(
                  option,
                  style: TextStyle(
                    color: Theme.of(context).textTheme.bodyLarge?.color,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTermsCheckbox(BuildContext context, EventRegistrationViewModel viewModel, bool isDark) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GestureDetector(
          onTap: () => viewModel.setAgreedToTerms(!viewModel.isAgreedToTerms),
          child: Container(
            width: 22,
            height: 22,
            margin: const EdgeInsets.only(top: 2, right: 12),
            decoration: BoxDecoration(
              color: isDark ? Theme.of(context).colorScheme.surface : Colors.white,
              border: Border.all(
                color: viewModel.isAgreedToTerms ? AppTheme.primaryBlue : Theme.of(context).textTheme.bodyMedium!.color!.withOpacity(0.3),
                width: 2,
              ),
              borderRadius: BorderRadius.circular(6),
            ),
            child: viewModel.isAgreedToTerms
                ? const Icon(Icons.check, size: 16, color: AppTheme.primaryBlue)
                : null,
          ),
        ),
        Expanded(
          child: Text.rich(
            TextSpan(
              text: 'I agree to the ',
              style: TextStyle(
                color: Theme.of(context).textTheme.bodyMedium?.color,
                fontSize: 12,
                height: 1.5,
              ),
              children: [
                TextSpan(
                  text: 'terms and conditions',
                  style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.w700),
                ),
                const TextSpan(text: ' and '),
                TextSpan(
                  text: 'data privacy policy',
                  style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.w700),
                ),
                const TextSpan(text: ' of BHC Connect regarding the collection of my health information.'),
              ],
            ),
          ),
        ),
      ],
    );
  }

  String _getMonthName(int month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }
}
