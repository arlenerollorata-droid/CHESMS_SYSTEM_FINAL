import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../utils/theme.dart';
import '../models/clinical_profile.dart';
import '../models/category_profiles.dart';

/// Widget for rendering category-specific clinical profile sections
class CategoryClinicalProfileWidget extends StatelessWidget {
  final MedicalHistoryTemplate template;
  final Map<String, dynamic> categoryData;
  final String category;

  const CategoryClinicalProfileWidget({
    Key? key,
    required this.template,
    required this.categoryData,
    required this.category,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Category header
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  template.categoryName,
                  style: GoogleFonts.poppins(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Clinical Profile & Medical History',
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          ),
          // Render sections
          ...template.sections.map((section) {
            return _buildSection(context, section, categoryData);
          }).toList(),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSection(
    BuildContext context,
    MedicalHistorySection section,
    Map<String, dynamic> categoryData,
  ) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              section.sectionName,
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF2E7C31),
              ),
            ),
          ),
          const Divider(height: 1),
          // Section content
          ...section.fields.map((field) {
            final fieldValue = categoryData[field.name];
            return _buildFieldDisplay(context, field, fieldValue);
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildFieldDisplay(
    BuildContext context,
    MedicalHistoryField field,
    dynamic value,
  ) {
    if (field.type == 'array') {
      return _buildArrayField(field, value);
    } else if (field.type == 'date') {
      return _buildDateField(field, value);
    } else if (field.type == 'enum') {
      return _buildEnumField(field, value);
    } else {
      return _buildSimpleField(field, value);
    }
  }

  Widget _buildSimpleField(MedicalHistoryField field, dynamic value) {
    final displayValue = value?.toString() ?? 'Not provided';
    final isHighlight = field.highlight;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      field.label,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: Colors.grey.shade700,
                      ),
                    ),
                    if (isHighlight)
                      Container(
                        margin: const EdgeInsets.only(left: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'Important',
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: Colors.red.shade700,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  displayValue,
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateField(MedicalHistoryField field, dynamic value) {
    String displayValue;
    try {
      if (value == null) {
        displayValue = 'Not recorded';
      } else if (value is DateTime) {
        displayValue = '${value.month}/${value.day}/${value.year}';
      } else {
        final parsed = DateTime.tryParse(value.toString());
        displayValue = parsed != null 
            ? '${parsed.month}/${parsed.day}/${parsed.year}'
            : 'Invalid date';
      }
    } catch (_) {
      displayValue = 'Invalid date';
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            field.label,
            style: GoogleFonts.poppins(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(Icons.calendar_today, size: 16, color: Colors.grey.shade600),
              const SizedBox(width: 8),
              Text(
                displayValue,
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEnumField(MedicalHistoryField field, dynamic value) {
    final displayValue = value?.toString() ?? 'Not selected';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            field.label,
            style: GoogleFonts.poppins(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF2E7C31).withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              displayValue,
              style: GoogleFonts.poppins(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF2E7C31),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildArrayField(MedicalHistoryField field, dynamic value) {
    final items = value is List ? value : [];

    if (items.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              field.label,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Colors.grey.shade700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'No records available',
              style: GoogleFonts.poppins(
                fontSize: 14,
                fontWeight: FontWeight.w400,
                color: Colors.grey.shade600,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            field.label,
            style: GoogleFonts.poppins(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 8),
          ...items.asMap().entries.map((entry) {
            final index = entry.key;
            final item = entry.value;
            return _buildArrayItem(field, item, index);
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildArrayItem(MedicalHistoryField field, dynamic item, int index) {
    if (item is! Map<String, dynamic> && item is! Map) {
      return Text(item.toString());
    }

    final itemMap = item as Map<String, dynamic>;
    final subFields = field.subFields ?? [];

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Item header
          Text(
            '${field.label} #${index + 1}',
            style: GoogleFonts.poppins(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          // Sub-fields
          ...subFields.map((subField) {
            final subValue = itemMap[subField];
            if (subValue == null || (subValue is String && subValue.isEmpty)) {
              return const SizedBox.shrink();
            }
            return Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 100,
                    child: Text(
                      _formatFieldName(subField),
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Text(
                      subValue.toString(),
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.w400,
                        color: Colors.black87,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  String _formatFieldName(String fieldName) {
    return fieldName
        .replaceAllMapped(RegExp(r'([A-Z])'), (match) => ' ${match.group(0)}')
        .trim()
        .split(' ')
        .map((word) => word[0].toUpperCase() + word.substring(1))
        .join(' ');
  }
}

/// Category card widget for displaying category overview
class CategoryCard extends StatelessWidget {
  final String categoryName;
  final IconData icon;
  final String? subtitle;
  final VoidCallback onTap;
  final Color color;

  const CategoryCard({
    Key? key,
    required this.categoryName,
    required this.icon,
    this.subtitle,
    required this.onTap,
    this.color = const Color(0xFF2E7C31),
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    categoryName,
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      subtitle!,
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        fontWeight: FontWeight.w400,
                        color: Colors.grey.shade600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}

/// Widget for rendering general medical history section
class GeneralMedicalHistoryWidget extends StatelessWidget {
  final List<dynamic> medicalHistory;
  final List<dynamic> allergies;
  final List<dynamic> surgeries;
  final List<dynamic> medications;

  const GeneralMedicalHistoryWidget({
    Key? key,
    this.medicalHistory = const [],
    this.allergies = const [],
    this.surgeries = const [],
    this.medications = const [],
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Allergies section (highlighted)
            if (allergies.isNotEmpty) ...[
              _buildAllergySection(),
              const SizedBox(height: 16),
            ],
            // Medical conditions
            if (medicalHistory.isNotEmpty) ...[
              _buildHistorySection('Medical Conditions', medicalHistory),
              const SizedBox(height: 16),
            ],
            // Surgeries
            if (surgeries.isNotEmpty) ...[
              _buildHistorySection('Past Surgeries', surgeries),
              const SizedBox(height: 16),
            ],
            // Medications
            if (medications.isNotEmpty) ...[
              _buildMedicationsSection(),
            ],
            if (medicalHistory.isEmpty && allergies.isEmpty && surgeries.isEmpty && medications.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    children: [
                      Icon(Icons.medical_services_outlined, size: 64, color: Colors.grey.shade300),
                      const SizedBox(height: 16),
                      Text(
                        'No medical history records',
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildAllergySection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.warning_rounded, color: Colors.red.shade700, size: 20),
              const SizedBox(width: 8),
              Text(
                'Allergies',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.red.shade700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...allergies.asMap().entries.map((entry) {
            final item = entry.value;
            if (item is Map) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  '• ${item['allergen'] ?? 'Unknown'} - ${item['reaction'] ?? 'No details'} (${item['severity'] ?? 'Unknown'})',
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    color: Colors.black87,
                  ),
                ),
              );
            }
            return const SizedBox.shrink();
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildHistorySection(String title, List<dynamic> items) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              title,
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF2E7C31),
              ),
            ),
          ),
          const Divider(height: 1),
          ...items.map((item) {
            if (item is Map) {
              return Padding(
                padding: const EdgeInsets.all(12),
                child: Text(
                  item['condition'] ?? item['procedure'] ?? 'Unknown',
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    color: Colors.black87,
                  ),
                ),
              );
            }
            return const SizedBox.shrink();
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildMedicationsSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'Current Medications',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF2E7C31),
              ),
            ),
          ),
          const Divider(height: 1),
          ...medications.map((item) {
            if (item is Map) {
              return Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item['name'] ?? 'Unknown',
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ),
                    ),
                    if (item['dosage'] != null)
                      Text(
                        '${item['dosage']} - ${item['frequency'] ?? 'As needed'}',
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                  ],
                ),
              );
            }
            return const SizedBox.shrink();
          }).toList(),
        ],
      ),
    );
  }
}
