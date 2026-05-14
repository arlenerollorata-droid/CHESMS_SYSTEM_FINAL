/// Represents a section in the medical history template
class MedicalHistorySection {
  final String sectionName;
  final List<MedicalHistoryField> fields;

  MedicalHistorySection({
    required this.sectionName,
    required this.fields,
  });

  factory MedicalHistorySection.fromJson(Map<String, dynamic> json) {
    final fieldsList = (json['fields'] as List<dynamic>?)?.map(
      (field) => MedicalHistoryField.fromJson(field as Map<String, dynamic>),
    ).toList() ?? [];

    return MedicalHistorySection(
      sectionName: json['sectionName'] ?? 'Section',
      fields: fieldsList,
    );
  }
}

/// Represents a single field in the medical history template
class MedicalHistoryField {
  final String name;
  final String label;
  final String type; // number, enum, date, time, text, array, object
  final List<String>? values; // For enum types
  final String? itemType; // For array types
  final List<String>? subFields; // For array of objects
  final bool highlight; // For important fields like allergies

  MedicalHistoryField({
    required this.name,
    required this.label,
    required this.type,
    this.values,
    this.itemType,
    this.subFields,
    this.highlight = false,
  });

  factory MedicalHistoryField.fromJson(Map<String, dynamic> json) {
    return MedicalHistoryField(
      name: json['name'] ?? '',
      label: json['label'] ?? '',
      type: json['type'] ?? 'text',
      values: List<String>.from(json['values'] as List<dynamic>? ?? []),
      itemType: json['itemType'] as String?,
      subFields: List<String>.from(json['subFields'] as List<dynamic>? ?? []),
      highlight: json['highlight'] ?? false,
    );
  }
}

/// Represents the medical history template for a specific patient category
class MedicalHistoryTemplate {
  final String categoryName;
  final List<MedicalHistorySection> sections;

  MedicalHistoryTemplate({
    required this.categoryName,
    required this.sections,
  });

  factory MedicalHistoryTemplate.fromJson(Map<String, dynamic> json) {
    final sectionsList = (json['sections'] as List<dynamic>?)?.map(
      (section) => MedicalHistorySection.fromJson(section as Map<String, dynamic>),
    ).toList() ?? [];

    return MedicalHistoryTemplate(
      categoryName: json['categoryName'] ?? 'General',
      sections: sectionsList,
    );
  }
}

/// Represents patient-specific category data
class CategoryPatientData {
  final String patientId;
  final String name;
  final int? age;
  final String? gender;
  final String? bloodType;
  final String? contact;
  final String? address;
  final String? category;
  final Map<String, dynamic> categoryData;

  CategoryPatientData({
    required this.patientId,
    required this.name,
    this.age,
    this.gender,
    this.bloodType,
    this.contact,
    this.address,
    this.category,
    required this.categoryData,
  });

  factory CategoryPatientData.fromJson(Map<String, dynamic> json) {
    return CategoryPatientData(
      patientId: json['patientId'] ?? '',
      name: json['name'] ?? '',
      age: json['age'] as int?,
      gender: json['gender'] as String?,
      bloodType: json['bloodType'] as String?,
      contact: json['contact'] as String?,
      address: json['address'] as String?,
      category: json['category'] as String?,
      categoryData: json['categoryData'] as Map<String, dynamic>? ?? {},
    );
  }
}

/// Comprehensive category medical history response combining template and patient data
class CategoryMedicalHistory {
  final MedicalHistoryTemplate template;
  final CategoryPatientData patientData;

  CategoryMedicalHistory({
    required this.template,
    required this.patientData,
  });

  factory CategoryMedicalHistory.fromJson(Map<String, dynamic> json) {
    return CategoryMedicalHistory(
      template: MedicalHistoryTemplate.fromJson(
        json['template'] as Map<String, dynamic>? ?? {},
      ),
      patientData: CategoryPatientData.fromJson(
        json['patientData'] as Map<String, dynamic>? ?? {},
      ),
    );
  }

  Map<String, dynamic> toJson() => {
    'template': {
      'categoryName': template.categoryName,
      'sections': template.sections
          .map((s) => {
            'sectionName': s.sectionName,
            'fields': s.fields
                .map((f) => {
                  'name': f.name,
                  'label': f.label,
                  'type': f.type,
                  if (f.values != null) 'values': f.values,
                  if (f.itemType != null) 'itemType': f.itemType,
                  if (f.subFields != null) 'subFields': f.subFields,
                  'highlight': f.highlight,
                })
                .toList(),
          })
          .toList(),
    },
    'patientData': {
      'patientId': patientData.patientId,
      'name': patientData.name,
      'age': patientData.age,
      'gender': patientData.gender,
      'bloodType': patientData.bloodType,
      'contact': patientData.contact,
      'address': patientData.address,
      'category': patientData.category,
      'categoryData': patientData.categoryData,
    },
  };
}

/// Represents a medical condition in patient history
class MedicalCondition {
  final String condition;
  final DateTime? diagnosedDate;
  final String? notes;
  final String status; // Active, Resolved, Ongoing

  MedicalCondition({
    required this.condition,
    this.diagnosedDate,
    this.notes,
    this.status = 'Active',
  });

  factory MedicalCondition.fromJson(Map<String, dynamic> json) {
    return MedicalCondition(
      condition: json['condition'] ?? '',
      diagnosedDate: json['diagnosedDate'] != null 
          ? DateTime.tryParse(json['diagnosedDate'].toString())
          : null,
      notes: json['notes'] as String?,
      status: json['status'] ?? 'Active',
    );
  }
}

/// Represents an allergy record
class Allergy {
  final String allergen;
  final String? reaction;
  final String severity; // Mild, Moderate, Severe

  Allergy({
    required this.allergen,
    this.reaction,
    this.severity = 'Moderate',
  });

  factory Allergy.fromJson(Map<String, dynamic> json) {
    return Allergy(
      allergen: json['allergen'] ?? '',
      reaction: json['reaction'] as String?,
      severity: json['severity'] ?? 'Moderate',
    );
  }
}

/// Represents a medication record
class Medication {
  final String name;
  final String? dosage;
  final String? frequency;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? prescribedBy;
  final String status;

  Medication({
    required this.name,
    this.dosage,
    this.frequency,
    this.startDate,
    this.endDate,
    this.prescribedBy,
    this.status = 'Active',
  });

  factory Medication.fromJson(Map<String, dynamic> json) {
    return Medication(
      name: json['name'] ?? '',
      dosage: json['dosage'] as String?,
      frequency: json['frequency'] as String?,
      startDate: json['startDate'] != null 
          ? DateTime.tryParse(json['startDate'].toString())
          : null,
      endDate: json['endDate'] != null 
          ? DateTime.tryParse(json['endDate'].toString())
          : null,
      prescribedBy: json['prescribedBy'] as String?,
      status: json['status'] ?? 'Active',
    );
  }
}

/// Represents surgery history
class Surgery {
  final String procedure;
  final DateTime? date;
  final String? hospital;
  final String? notes;

  Surgery({
    required this.procedure,
    this.date,
    this.hospital,
    this.notes,
  });

  factory Surgery.fromJson(Map<String, dynamic> json) {
    return Surgery(
      procedure: json['procedure'] ?? '',
      date: json['date'] != null 
          ? DateTime.tryParse(json['date'].toString())
          : null,
      hospital: json['hospital'] as String?,
      notes: json['notes'] as String?,
    );
  }
}
