const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Resident = require("../models/resident");

const JWT_SECRET = process.env.JWT_SECRET || "chesms_mobile_secret";

function sanitizeResident(residentDoc) {
  const resident = residentDoc.toObject ? residentDoc.toObject() : residentDoc;
  const name = [resident.firstName, resident.middleName, resident.lastName]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    _id: resident._id,
    id: resident._id,
    residentId: resident.residentId,
    firstName: resident.firstName,
    middleName: resident.middleName,
    lastName: resident.lastName,
    name,
    email: resident.email,
    contactNumber: resident.contactNumber,
    birthdate: resident.birthdate,
    gender: resident.gender,
    civilStatus: resident.civilStatus,
    purok: resident.purok,
    barangay: resident.barangay,
    municipality: resident.municipality,
    province: resident.province,
    region: resident.region,
    postalCode: resident.postalCode,
    streetAddress: resident.streetAddress,
    profileImage: resident.profileImage,
    status: resident.status,
  };
}

exports.register = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      contactNumber,
      birthdate,
      gender,
      civilStatus,
      purok,
      barangay,
      municipality,
      province,
      region,
      postalCode,
      streetAddress,
    } = req.body;

    const errors = [];
    if (!firstName?.trim()) errors.push("First name is required");
    if (!lastName?.trim()) errors.push("Last name is required");
    if (!email?.trim()) errors.push("Email is required");
    if (!password || password.length < 6) errors.push("Password must be at least 6 characters");
    if (!birthdate) errors.push("Birthdate is required");
    if (!purok?.trim()) errors.push("Purok is required");
    if (!barangay?.trim()) errors.push("Barangay is required");
    if (!municipality?.trim()) errors.push("Municipality is required");
    if (!province?.trim()) errors.push("Province is required");
    if (!region?.trim()) errors.push("Region is required");

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(", "),
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingEmail = await Resident.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Check for duplicate identity (Same Name and Birthdate)
    const existingIdentity = await Resident.findOne({
      firstName: { $regex: new RegExp(`^${firstName.trim()}$`, "i") },
      lastName: { $regex: new RegExp(`^${lastName.trim()}$`, "i") },
      birthdate: new Date(birthdate)
    });

    if (existingIdentity) {
      return res.status(400).json({
        success: false,
        message: "A resident with this name and birthdate is already registered in the system",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const resident = await Resident.create({
      firstName: firstName.trim(),
      middleName: middleName?.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      isMobileAccount: true,
      contactNumber,
      birthdate,
      gender,
      civilStatus,
      purok: purok.trim(),
      barangay: barangay.trim(),
      municipality: municipality.trim(),
      province: province.trim(),
      region: region?.trim(),
      postalCode: postalCode?.trim(),
      streetAddress: streetAddress?.trim(),
      registeredBy: "Mobile App",
      status: "Active",
    });

    const token = jwt.sign(
      { residentId: resident._id.toString(), role: "resident" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: sanitizeResident(resident),
    });
  } catch (error) {
    console.error("Mobile register error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const resident = await Resident.findOne({ email: normalizedEmail }).select("+passwordHash");

    if (!resident || !resident.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, resident.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { residentId: resident._id.toString(), role: "resident" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeResident(resident),
    });
  } catch (error) {
    console.error("Mobile login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};