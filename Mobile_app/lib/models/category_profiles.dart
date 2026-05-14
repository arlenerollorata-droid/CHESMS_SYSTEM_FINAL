/// Prenatal-specific patient data
class PrenatalProfile {
  final int? gestationalWeek;
  final String? trimester;
  final DateTime? dueDate;
  final String? riskLevel;
  final String? babyInsight;
  final int? progressPercent;
  final DateTime? nextVisitDate;
  final String? nextVisitTime;
  final String? nextVisitLocation;
  final List<PrenatalVisit> visitHistory;

  PrenatalProfile({
    this.gestationalWeek,
    this.trimester,
    this.dueDate,
    this.riskLevel,
    this.babyInsight,
    this.progressPercent,
    this.nextVisitDate,
    this.nextVisitTime,
    this.nextVisitLocation,
    this.visitHistory = const [],
  });

  factory PrenatalProfile.fromJson(Map<String, dynamic> json) {
    final visits = (json['visitHistory'] as List<dynamic>?)?.map(
      (v) => PrenatalVisit.fromJson(v as Map<String, dynamic>),
    ).toList() ?? [];

    return PrenatalProfile(
      gestationalWeek: json['gestationalWeek'] as int?,
      trimester: json['trimester'] as String?,
      dueDate: json['dueDate'] != null 
          ? DateTime.tryParse(json['dueDate'].toString())
          : null,
      riskLevel: json['riskLevel'] as String?,
      babyInsight: json['babyInsight'] as String?,
      progressPercent: json['progressPercent'] as int?,
      nextVisitDate: json['nextVisitDate'] != null 
          ? DateTime.tryParse(json['nextVisitDate'].toString())
          : null,
      nextVisitTime: json['nextVisitTime'] as String?,
      nextVisitLocation: json['nextVisitLocation'] as String?,
      visitHistory: visits,
    );
  }
}

class PrenatalVisit {
  final DateTime? date;
  final String? week;
  final String? staff;
  final String? notes;

  PrenatalVisit({
    this.date,
    this.week,
    this.staff,
    this.notes,
  });

  factory PrenatalVisit.fromJson(Map<String, dynamic> json) {
    return PrenatalVisit(
      date: json['date'] != null 
          ? DateTime.tryParse(json['date'].toString())
          : null,
      week: json['week'] as String?,
      staff: json['staff'] as String?,
      notes: json['notes'] as String?,
    );
  }
}

/// TB DOTS-specific patient data
class TBDotsProfile {
  final DateTime? treatmentStartDate;
  final String? treatmentPhase;
  final String? regimen;
  final int? adherencePercent;
  final DateTime? nextVisitDate;
  final String? nextVisitTime;
  final String? nextVisitLocation;
  final List<TBVisit> visitHistory;
  final List<MedicationLog> medicationLogs;

  TBDotsProfile({
    this.treatmentStartDate,
    this.treatmentPhase,
    this.regimen,
    this.adherencePercent,
    this.nextVisitDate,
    this.nextVisitTime,
    this.nextVisitLocation,
    this.visitHistory = const [],
    this.medicationLogs = const [],
  });

  factory TBDotsProfile.fromJson(Map<String, dynamic> json) {
    final visits = (json['visitHistory'] as List<dynamic>?)?.map(
      (v) => TBVisit.fromJson(v as Map<String, dynamic>),
    ).toList() ?? [];

    final logs = (json['medicationLogs'] as List<dynamic>?)?.map(
      (l) => MedicationLog.fromJson(l as Map<String, dynamic>),
    ).toList() ?? [];

    return TBDotsProfile(
      treatmentStartDate: json['treatmentStartDate'] != null 
          ? DateTime.tryParse(json['treatmentStartDate'].toString())
          : null,
      treatmentPhase: json['treatmentPhase'] as String?,
      regimen: json['regimen'] as String?,
      adherencePercent: json['adherencePercent'] as int?,
      nextVisitDate: json['nextVisitDate'] != null 
          ? DateTime.tryParse(json['nextVisitDate'].toString())
          : null,
      nextVisitTime: json['nextVisitTime'] as String?,
      nextVisitLocation: json['nextVisitLocation'] as String?,
      visitHistory: visits,
      medicationLogs: logs,
    );
  }
}

class TBVisit {
  final DateTime? date;
  final String? week;
  final String? staff;
  final String? notes;

  TBVisit({
    this.date,
    this.week,
    this.staff,
    this.notes,
  });

  factory TBVisit.fromJson(Map<String, dynamic> json) {
    return TBVisit(
      date: json['date'] != null 
          ? DateTime.tryParse(json['date'].toString())
          : null,
      week: json['week'] as String?,
      staff: json['staff'] as String?,
      notes: json['notes'] as String?,
    );
  }
}

class MedicationLog {
  final DateTime? date;
  final String? medicine;
  final bool taken;
  final String? remarks;

  MedicationLog({
    this.date,
    this.medicine,
    this.taken = false,
    this.remarks,
  });

  factory MedicationLog.fromJson(Map<String, dynamic> json) {
    return MedicationLog(
      date: json['date'] != null 
          ? DateTime.tryParse(json['date'].toString())
          : null,
      medicine: json['medicine'] as String?,
      taken: json['taken'] ?? false,
      remarks: json['remarks'] as String?,
    );
  }
}

/// NCD-specific patient data
class NCDProfile {
  final String? hypertensionStage;
  final String? diabetesType;
  final String? lastHbA1c;
  final String? lastFastingGlucose;
  final String? lastLDL;
  final String? medication;
  final String? complications;

  NCDProfile({
    this.hypertensionStage,
    this.diabetesType,
    this.lastHbA1c,
    this.lastFastingGlucose,
    this.lastLDL,
    this.medication,
    this.complications,
  });

  factory NCDProfile.fromJson(Map<String, dynamic> json) {
    return NCDProfile(
      hypertensionStage: json['hypertensionStage'] as String?,
      diabetesType: json['diabetesType'] as String?,
      lastHbA1c: json['lastHbA1c'] as String?,
      lastFastingGlucose: json['lastFastingGlucose'] as String?,
      lastLDL: json['lastLDL'] as String?,
      medication: json['medication'] as String?,
      complications: json['complications'] as String?,
    );
  }
}

/// Pediatric-specific patient data
class PediatricProfile {
  final String? school;
  final String? grade;
  final String? guardianName;
  final String? guardianRelation;
  final String? guardianPhone;
  final String? birthWeight;
  final String? immunizationStatus;

  PediatricProfile({
    this.school,
    this.grade,
    this.guardianName,
    this.guardianRelation,
    this.guardianPhone,
    this.birthWeight,
    this.immunizationStatus,
  });

  factory PediatricProfile.fromJson(Map<String, dynamic> json) {
    return PediatricProfile(
      school: json['school'] as String?,
      grade: json['grade'] as String?,
      guardianName: json['guardianName'] as String?,
      guardianRelation: json['guardianRelation'] as String?,
      guardianPhone: json['guardianPhone'] as String?,
      birthWeight: json['birthWeight'] as String?,
      immunizationStatus: json['immunizationStatus'] as String?,
    );
  }
}

/// Family Planning-specific patient data
class FamilyPlanningProfile {
  final String? method;
  final DateTime? lastCheckup;
  final DateTime? nextFollowUp;
  final String? sideEffects;
  final String? partnerInvolved;

  FamilyPlanningProfile({
    this.method,
    this.lastCheckup,
    this.nextFollowUp,
    this.sideEffects,
    this.partnerInvolved,
  });

  factory FamilyPlanningProfile.fromJson(Map<String, dynamic> json) {
    return FamilyPlanningProfile(
      method: json['method'] as String?,
      lastCheckup: json['lastCheckup'] != null 
          ? DateTime.tryParse(json['lastCheckup'].toString())
          : null,
      nextFollowUp: json['nextFollowUp'] != null 
          ? DateTime.tryParse(json['nextFollowUp'].toString())
          : null,
      sideEffects: json['sideEffects'] as String?,
      partnerInvolved: json['partnerInvolved'] as String?,
    );
  }
}

/// Senior Citizen-specific patient data
class SeniorProfile {
  final String? philhealth;
  final String? seniorCitizenId;
  final String? pension;
  final String? oscaId;

  SeniorProfile({
    this.philhealth,
    this.seniorCitizenId,
    this.pension,
    this.oscaId,
  });

  factory SeniorProfile.fromJson(Map<String, dynamic> json) {
    return SeniorProfile(
      philhealth: json['philhealth'] as String?,
      seniorCitizenId: json['seniorCitizenId'] as String?,
      pension: json['pension'] as String?,
      oscaId: json['oscaId'] as String?,
    );
  }
}
