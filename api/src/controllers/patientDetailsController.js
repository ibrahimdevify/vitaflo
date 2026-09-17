const patientService = require("../services/patientService");

const { ValidationError } = patientService;
const ALLOWED_TABS = [
  "patient-info",
  "spirometry",
  "analysis",
  "session-comparison",
  "reports",
  "billing",
  "alerts",
];
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { hashPassword } = require("../utils/password");
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

function parsePositiveInt(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
  return parsed;
}

function parseDateParam(value, fieldName) {
  if (typeof value !== "string" || !DATE_REGEX.test(value)) {
    throw new ValidationError(
      `${fieldName} must be a valid date in YYYY-MM-DD format`,
    );
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`${fieldName} is not a valid date`);
  }
  return parsed;
}

function ensureRangeOrdered(startDate, endDate) {
  if (startDate > endDate) {
    throw new ValidationError("startDate must be before or equal to endDate");
  }
}

/**
 * startDate/endDate are optional on every list tab now (no default filter except Spirometry,
 * which is applied in the service layer). If either is supplied, both must be, and in order.
 */
function parseOptionalDateRange(query) {
  const hasStart = query.startDate !== undefined && query.startDate !== "";
  const hasEnd = query.endDate !== undefined && query.endDate !== "";

  if (hasStart !== hasEnd) {
    throw new ValidationError(
      "startDate and endDate must be provided together",
    );
  }
  if (!hasStart) {
    return { startDate: undefined, endDate: undefined };
  }

  const startDate = parseDateParam(query.startDate, "startDate");
  const endDate = parseDateParam(query.endDate, "endDate");
  ensureRangeOrdered(startDate, endDate);
  return { startDate, endDate };
}

function parsePagination(query) {
  const page =
    query.page !== undefined ? parsePositiveInt(query.page, "page") : 1;
  const limitRaw =
    query.limit !== undefined
      ? parsePositiveInt(query.limit, "limit")
      : DEFAULT_PAGE_SIZE;
  const limit = Math.min(limitRaw, MAX_PAGE_SIZE);
  return { page, limit };
}

function buildTabParams(tab, userId, query) {
  switch (tab) {
    case "patient-info":
      return { userId };

    case "spirometry": {
      const { startDate, endDate } = parseOptionalDateRange(query);
      const { page, limit } = parsePagination(query);
      return { userId, startDate, endDate, page, limit };
    }

    case "analysis": {
      const { startDate, endDate } = parseOptionalDateRange(query);
      return { userId, startDate, endDate, variable: query.variable || "FEV1" };
    }

    case "session-comparison": {
      const sessionId1 = parsePositiveInt(query.sessionId1, "sessionId1");
      const sessionId2 = parsePositiveInt(query.sessionId2, "sessionId2");
      return { userId, sessionId1, sessionId2 };
    }

    case "reports":
    case "billing":
    case "alerts": {
      const { startDate, endDate } = parseOptionalDateRange(query);
      const { page, limit } = parsePagination(query);
      return { userId, startDate, endDate, page, limit };
    }

    default:
      throw new ValidationError(`Unsupported tab: ${tab}`);
  }
}

const getPatientById = async (req, res) => {
  try {
    const userId = parsePositiveInt(req.params.id, "id");
    const tab = req.query.tab;

    if (!ALLOWED_TABS.includes(tab)) {
      return res
        .status(400)
        .json({ error: `tab must be one of: ${ALLOWED_TABS.join(", ")}` });
    }

    const patient = await patientService.ensurePatientExists(userId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const params = buildTabParams(tab, userId, req.query);
    const data = await patientService.getPatientTabData(tab, params);

    return res.json({ tab, data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Get patient error:", error);
    return res.status(500).json({ error: "Failed to fetch patient data" });
  }
};
/**
 * Custom validation error — thrown for bad input so the catch block
 * can return a clean 400 instead of letting Prisma throw an opaque error.
 */
class ValidateError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidateError";
    this.field = field;
  }
}

/**
 * Safely coerces a value to boolean.
 * Bug fixed: Boolean("false") === true in plain JS, so raw `Boolean(value)`
 * silently flipped any falsy-looking string to `true`.
 */
const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  if (typeof value === "number") return value !== 0;
  return Boolean(value);
};

const parseRequiredInt = (value, fieldName) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new ValidateError(fieldName, `${fieldName} must be a valid integer`);
  }
  return parsed;
};

const parseNullableInt = (value, fieldName) => {
  if (value === null) return null;
  return parseRequiredInt(value, fieldName);
};

const parseNullableFloat = (value, fieldName) => {
  if (value === null) return null;
  const parsed = parseFloat(value);
  if (Number.isNaN(parsed)) {
    throw new ValidateError(fieldName, `${fieldName} must be a valid number`);
  }
  return parsed;
};

const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        error: "Invalid patient ID",
      });
    }

    const {
      // dc_users
      f_name,
      l_name,
      email,
      phone,
      userName,
      us_id_fk,
      is_guardian,
      is_availible,
      is_profile_completed,
      is_rpm_allow,
      password,

      // dc_user_details
      dob,
      gender_id_fk,
      martial_status_fk,
      address,
      zip_code,
      city_id_fk,

      // dc_patient_details
      height,
      weight,
      blood_group,
      geno_type,
      patient_group_id,
      assigned_clinician_id,
      graph_view,
      access_code,
      rpm_consent,
      status,

      // vf_attributes
      smoking,
      ethnic_group,
      identify,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Prepare dc_users data
    |--------------------------------------------------------------------------
    */

    const userData = {};

    if (f_name !== undefined) userData.f_name = f_name;
    if (l_name !== undefined) userData.l_name = l_name;
    if (email !== undefined) userData.email = email;
    if (phone !== undefined) userData.phone = phone;
    if (userName !== undefined) userData.userName = userName;

    if (us_id_fk !== undefined) {
      userData.us_id_fk = parseRequiredInt(us_id_fk, "us_id_fk");
    }

    if (is_guardian !== undefined) {
      userData.is_guardian = toBoolean(is_guardian);
    }

    if (is_availible !== undefined) {
      userData.is_availible = toBoolean(is_availible);
    }

    if (is_profile_completed !== undefined) {
      userData.is_profile_completed = toBoolean(is_profile_completed);
    }

    if (is_rpm_allow !== undefined) {
      userData.is_rpm_allow = toBoolean(is_rpm_allow);
    }

    if (password) {
      userData.password = await hashPassword(password);
    }

    userData.profile_update_date = new Date();

    /*
    |--------------------------------------------------------------------------
    | Prepare dc_user_details data
    |--------------------------------------------------------------------------
    */

    const userDetailsData = {};

    if (dob !== undefined) {
      const parsedDob = new Date(dob);
      if (Number.isNaN(parsedDob.getTime())) {
        throw new ValidateError("dob", "dob must be a valid date");
      }
      userDetailsData.dob = parsedDob;
    }

    if (gender_id_fk !== undefined) {
      userDetailsData.gender_id_fk = parseRequiredInt(gender_id_fk, "gender_id_fk");
    }

    if (martial_status_fk !== undefined) {
      userDetailsData.martial_status_fk = parseRequiredInt(
        martial_status_fk,
        "martial_status_fk"
      );
    }

    if (address !== undefined) {
      userDetailsData.address = address;
    }

    if (zip_code !== undefined) {
      userDetailsData.zip_code = zip_code;
    }

    if (city_id_fk !== undefined) {
      userDetailsData.city_id_fk = parseRequiredInt(city_id_fk, "city_id_fk");
    }

    /*
    |--------------------------------------------------------------------------
    | Prepare dc_patient_details data
    |--------------------------------------------------------------------------
    */

    const patientData = {};

    if (height !== undefined) {
      patientData.height = parseNullableFloat(height, "height");
    }

    if (weight !== undefined) {
      patientData.weight = parseNullableFloat(weight, "weight");
    }

    if (blood_group !== undefined) {
      patientData.blood_group = blood_group;
    }

    if (geno_type !== undefined) {
      patientData.geno_type = geno_type;
    }

    if (patient_group_id !== undefined) {
      patientData.patient_group_id = parseNullableInt(
        patient_group_id,
        "patient_group_id"
      );
    }

    if (assigned_clinician_id !== undefined) {
      patientData.assigned_clinician_id = parseNullableInt(
        assigned_clinician_id,
        "assigned_clinician_id"
      );
    }

    if (graph_view !== undefined) {
      patientData.graph_view = toBoolean(graph_view);
    }

    if (access_code !== undefined) {
      patientData.access_code = access_code;
    }

    if (rpm_consent !== undefined) {
      patientData.rpm_consent = toBoolean(rpm_consent);
    }

    if (status !== undefined) {
      patientData.status = status;
    }

    /*
    |--------------------------------------------------------------------------
    | Prepare vf_attributes data
    |--------------------------------------------------------------------------
    */

    const attributesData = {};

    if (f_name !== undefined) {
      attributesData.first_name = f_name;
    }

    if (l_name !== undefined) {
      attributesData.last_name = l_name;
    }

    if (phone !== undefined) {
      // FIX: vf_attributes.phone is VarChar(20) — much shorter than
      // dc_users.phone (VarChar(255)). A phone value that's valid for
      // dc_users can still be too long for vf_attributes and throw a raw
      // Prisma P2000 error mid-transaction. Validate up front with a clear
      // message instead.
      if (phone.length > 20) {
        throw new ValidateError(
          "phone",
          `phone must be at most 20 characters long for vf_attributes (currently ${phone.length})`
        );
      }
      attributesData.phone = phone;
    }

    if (dob !== undefined) {
      attributesData.dob = dob;
    }

    if (height !== undefined) {
      const parsedHeight = parseNullableFloat(height, "height");
      attributesData.height = parsedHeight === null ? 0 : parsedHeight;
    }

    if (weight !== undefined) {
      attributesData.weight = parseNullableFloat(weight, "weight");
    }

    if (smoking !== undefined) {
      attributesData.smoking = toBoolean(smoking);
    }

    if (ethnic_group !== undefined) {
      attributesData.ethnic_group = ethnic_group;
    }

    if (identify !== undefined) {
      attributesData.identify = identify;
    }

    /*
    |--------------------------------------------------------------------------
    | Transaction
    |--------------------------------------------------------------------------
    */

    const result = await prisma.$transaction(
      async (tx) => {
        // Get patient first
        const patient = await tx.dc_patient_details.findUnique({
          where: {
            user_id_fk: userId,
          },
          include: {
            attributes: true,
            user: {
              include: {
                user_details: true,
              },
            },
          },
        });

        if (!patient) {
          throw new Error("PATIENT_NOT_FOUND");
        }

        // Update user
        let updatedUser = patient.user;

        if (Object.keys(userData).length > 0) {
          updatedUser = await tx.dc_users.update({
            where: {
              user_id: userId,
            },
            data: userData,
          });
        }

        // Update user details.
        // dc_user_details has NOT NULL columns (gender_id_fk,
        // martial_status_fk, city_id_fk) that this endpoint's callers
        // (e.g. the patient-info edit form) never collect or send. So we
        // only ever `update` an existing row with whatever fields were
        // provided — we never try to create one here, since a create
        // would require values (gender/marital status/city) this endpoint
        // has no way to get. If the row doesn't exist yet, that part of
        // the request is skipped (not failed) and flagged in the response
        // so the caller knows those fields weren't saved.
        let updatedUserDetails = patient.user.user_details;
        let userDetailsSkipped = false;

        if (Object.keys(userDetailsData).length > 0) {
          if (patient.user.user_details) {
            updatedUserDetails = await tx.dc_user_details.update({
              where: {
                user_id_fk: userId,
              },
              data: userDetailsData,
            });
          } else {
            userDetailsSkipped = true;
          }
        }

        // Update patient details
        let updatedPatient = patient;

        if (Object.keys(patientData).length > 0) {
          updatedPatient = await tx.dc_patient_details.update({
            where: {
              user_id_fk: userId,
            },
            data: patientData,
          });
        }

        // Update vf_attributes
        let updatedAttributes = patient.attributes;

        if (Object.keys(attributesData).length > 0) {
          if (!patient.attributes) {
            // Previously this silently skipped the update with no feedback.
            // Better to fail loudly than lose data the caller thought was saved.
            throw new Error("ATTRIBUTES_NOT_FOUND");
          }

          updatedAttributes = await tx.vf_attributes.update({
            where: {
              pd_id: patient.pd_id,
            },
            data: attributesData,
          });
        }

        return {
          user: updatedUser,
          userDetails: updatedUserDetails,
          userDetailsSkipped,
          patient: updatedPatient,
          attributes: updatedAttributes,
        };
      },
      {
        // FIX: Prisma's default interactive-transaction timeout is 5000ms.
        // This transaction runs up to 5 sequential queries (patient lookup +
        // up to 4 updates), and over a higher-latency connection (e.g. this
        // API running locally while the database is remote, reached via an
        // SSH tunnel) the round-trips alone can exceed that default — as
        // seen in production (P2028, "5018 ms passed since the start of
        // the transaction"). 20s gives real headroom without masking a
        // genuinely stuck query forever.
        timeout: 20000,
      }
    );

    // Never return password
    const { password: _password, ...safeUser } = result.user;

    return res.json({
      message: "Patient information updated successfully",
      warning: result.userDetailsSkipped
        ? "No patient-details record exists for this user yet (missing gender/marital status/city), so address/DOB/zip changes were not saved. Set those fields via the patient setup flow first."
        : undefined,
      data: {
        user: safeUser,
        user_details: result.userDetails,
        patient_details: result.patient,
        attributes: result.attributes,
      },
    });
  } catch (error) {
    if (error instanceof ValidateError) {
      return res.status(400).json({
        error: error.message,
        field: error.field,
      });
    }

    console.error("Update patient error:", error);

    if (error.message === "PATIENT_NOT_FOUND") {
      return res.status(404).json({
        error: "Patient not found",
      });
    }

    if (error.message === "ATTRIBUTES_NOT_FOUND") {
      return res.status(404).json({
        error: "Patient attributes record not found for this user",
      });
    }

    // Prisma unique constraint
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Email, phone, or username already exists",
        field: error.meta?.target,
      });
    }

    // Prisma transaction timeout — surface a clear, actionable message
    // rather than a generic 500.
    if (error.code === "P2028") {
      return res.status(504).json({
        error: "Update timed out. Please try again.",
      });
    }

    // Value too long for the target column (e.g. vf_attributes.phone is
    // VarChar(20), shorter than dc_users.phone's VarChar(255)).
    if (error.code === "P2000") {
      return res.status(400).json({
        error: `Value too long for column "${error.meta?.column_name}" on ${error.meta?.modelName}`,
        field: error.meta?.column_name,
      });
    }

    return res.status(500).json({
      error: "Failed to update patient",
    });
  }
};






const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({
        error: "Invalid patient ID",
      });
    }

    const patient = await prisma.dc_users.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        user_id: true,
        us_id_fk: true,
        f_name: true,
        l_name: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        error: "Patient not found",
      });
    }

    // Change user status to 3 instead of deleting the record
    const updatedPatient = await prisma.dc_users.update({
      where: {
        user_id: userId,
      },
      data: {
        us_id_fk: 3,
        profile_update_date: new Date(),
      },
      select: {
        user_id: true,
        f_name: true,
        l_name: true,
        email: true,
        phone: true,
        us_id_fk: true,
      },
    });

    return res.json({
      message: "Patient deleted successfully",
      data: updatedPatient,
    });
  } catch (error) {
    console.error("Delete patient error:", error);

    return res.status(500).json({
      error: "Failed to delete patient",
    });
  }
};

const listPatients = async (req, res) => {
  try {
    const patients = await patientService.getPatientsList();
    return res.json({ data: patients });
  } catch (error) {
    console.error("List patients error:", error);
    return res.status(500).json({ error: "Failed to fetch patients" });
  }
};

module.exports = { getPatientById, listPatients, updatePatient, deletePatient };
