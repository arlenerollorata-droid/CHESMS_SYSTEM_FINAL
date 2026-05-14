const mongoose = require("mongoose");

const ResidentSchema = new mongoose.Schema({
  // 1. Resident Identity
  residentId: { type: String, unique: true },
  firstName: { type: String, required: true },
  middleName: String,
  lastName: { type: String, required: true },
  suffix: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] }, 
  birthdate: { type: Date, required: true },
  age: { type: Number },
  nationality: { type: String, default: 'Filipino' },
  civilStatus: { type: String, enum: ['Single', 'Married', 'Widowed', 'Separated', 'Divorced'] },
  religion: String,
  birthplace: String,
  occupation: String,
  monthlyIncome: String,
  contactNumber: String,
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, select: false },
  profileImage: String,
  isMobileAccount: { type: Boolean, default: false },
  streetAddress: String,

  // Government IDs
  sssNumber: String,
  philhealthNumber: String,
  pagibigNumber: String,
  voterStatus: { type: String, enum: ['Yes', 'No'], default: 'No' },
  registeredVoter: { type: String, enum: ['Yes', 'No'], default: 'No' },

  // 2. Spouse Profile
  spouseFirstName: String,
  spouseMiddleName: String,
  spouseLastName: String,
  spouseBirthdate: Date,
  spouseAge: Number,
  spouseNationality: { type: String, default: 'Filipino' },
  spouseOccupation: String,
  spouseMonthlyIncome: String,
  spouseReligion: String,
  spouseBirthplace: String,
  spouseSSS: String,
  spousePhilhealth: String,
  spousePagibig: String,

  // 3. Children Roster (Enhanced)
  childrenRoster: [{
    childFirstName: String,
    childMiddleName: String,
    childLastName: String,
    childBirthdate: Date,
    childAge: Number,
    childGender: String,
    childBirthplace: String,
    childNationality: { type: String, default: 'Filipino' },
    childStatus: { type: String, enum: ['Student', 'Working', 'Not in School'] },
    childEducation: { type: String, enum: ['Elementary', 'High School', 'Senior High', 'College', 'Vocational', 'Post Graduate'] },
    childSchoolName: String,
    childSchoolAddress: String,
    childCourse: String,
    childOccupation: String,
    childIncome: String
  }],

  // 4. Household Mapping & Summary
  householdId: String,
  totalMembersInHousehold: { type: Number, default: 1 },
  housingType: { type: String, enum: ['Concrete', 'Semi-Concrete', 'Wood/Bamboo', 'Mixed', 'Others'] },
  ownershipStatus: { type: String, enum: ['Owned', 'Rented', 'Free Use', 'Shared', 'Homeless'] },
  lotArea: String,
  floorArea: String,
  hasElectricity: { type: Boolean, default: true },
  hasWater: { type: Boolean, default: false },

  // Structured Senior Roster (Enhanced)
  isAnyMemberSenior: { type: Boolean, default: false },
  seniorRoster: [{
    firstName: String,
    middleName: String,
    lastName: String,
    age: Number,
    birthdate: Date,
    gender: { type: String, enum: ['Male', 'Female'] },
    birthplace: String,
    nationality: { type: String, default: 'Filipino' },
    healthStatus: { type: String, enum: ['Healthy', 'With Illness', 'Bedridden'] },
    isPensioner: { type: Boolean, default: false },
    pensionAmount: String,
    oscaId: String,
    registrationDate: Date,
    livingWithFamily: { type: Boolean, default: true },
    emergencyContact: String,
    emergencyRelation: String,
    emergencyPhone: String
  }],

  // Structured PWD Roster (Enhanced)
  isAnyMemberPWD: { type: Boolean, default: false },
  pwdRoster: [{
    firstName: String,
    middleName: String,
    lastName: String,
    age: Number,
    birthdate: Date,
    gender: { type: String, enum: ['Male', 'Female'] },
    disabilityType: { type: String, enum: ['Physical/Orthopedic', 'Visual', 'Hearing/Speech', 'Intellectual', 'Psychosocial', 'Multiple'] },
    disabilityCause: { type: String, enum: ['Congenital', 'Accident', 'Illness', 'Other'] },
    nationality: { type: String, default: 'Filipino' },
    pwdId: String,
    registrationDate: Date,
    isEmployed: { type: Boolean, default: false },
    occupation: String,
    needsAssistance: { type: Boolean, default: false },
    assistiveDevice: String,
    emergencyContact: String,
    emergencyPhone: String
  }],

  // 5. Address
  purok: { type: String, required: true },
  barangay: { type: String, required: true },
  municipality: { type: String, required: true },
  province: { type: String, required: true },
  region: String,
  postalCode: String,

  // System
  registeredBy: String,
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

ResidentSchema.pre("save", async function () {
  if (!this.residentId) {
    try {
      const count = await mongoose.model("Resident").countDocuments();
      this.residentId = `CHEMS-${(count + 1).toString().padStart(4, '0')}`;
    } catch (err) {
      console.error("ID Generation Error:", err);
    }
  }
});

module.exports = mongoose.model("Resident", ResidentSchema);