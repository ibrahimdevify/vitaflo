const { PrismaClient } = require("@prisma/client");
const { hashPassword } = require("../utils/password");
const { generateUserName } = require("../utils/usernameGenerator");
const patientService = require("../services/reportTemplates/patientService");
const { ValidationError } = patientService;
const { getVisibleClinicianIds } = require("../helpers/visible_clinician");
const prisma = new PrismaClient();

const ALLOWED_TABS = [
  "patient-info",
  "spirometry",
  "analysis",
  "session-comparison",
  "reports",
  "billing",
  "alerts",
];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Get all patients with medical details
// const getAllPatients = async (req, res) => {
//   try {
//     const { page = 1, limit = 20, search, status, patient_group_id, assigned_clinician_id } = req.query;

//     const where = { ut_id_fk: 4 }; // Only patients

//     if (search) {
//       const searchTerm = search.trim();
//       const nameParts = searchTerm.split(/\s+/).filter(Boolean);

//       where.OR = [
//         { f_name: { contains: searchTerm } },
//         { l_name: { contains: searchTerm } },
//         { userName: { contains: searchTerm } },
//         { email: { contains: searchTerm } },
//         { phone: { contains: searchTerm } },
//         { patient_details: { chart_no: { contains: searchTerm } } },
//       ];

//       // Handle "First Last" style full-name search across two fields
//       if (nameParts.length > 1) {
//         where.OR.push(
//           {
//             AND: [
//               { f_name: { contains: nameParts[0] } },
//               { l_name: { contains: nameParts.slice(1).join(' ') } },
//             ],
//           },
//           {
//             AND: [
//               { f_name: { contains: nameParts[nameParts.length - 1] } },
//               { l_name: { contains: nameParts.slice(0, -1).join(' ') } },
//             ],
//           },
//         );
//       }
//     }

//     if (status) {
//       where.patient_details = { ...where.patient_details, status };
//     }

//     if (patient_group_id) {
//       where.patient_details = { ...where.patient_details, patient_group_id: parseInt(patient_group_id) };
//     }

//     if (assigned_clinician_id) {
//       where.patient_details = { ...where.patient_details, assigned_clinician_id: parseInt(assigned_clinician_id) };
//     }

//     // 🔒 Clinicians only see their assigned patients
//     // Admin (ut_id_fk=2) and Technician (ut_id_fk=1) see all
//     if (req.user.ut_id_fk === 3) {
//       where.patient_details = { ...where.patient_details, assigned_clinician_id: req.user.user_id };
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const [patients, total] = await Promise.all([
//       prisma.dc_users.findMany({
//         where,
//         skip,
//         take: parseInt(limit),
//         orderBy: { reg_date: 'desc' },
//         select: {
//           user_id: true,
//           f_name: true,
//           l_name: true,
//           email: true,
//           phone: true,
//           profile_pic: true,
//           is_rpm_allow: true,
//           reg_date: true,
//           userName: true,
//           user_status: { select: { name: true } },
//           patient_details: {
//             select: {
//               pd_id: true,
//               chart_no: true,
//               blood_group: true,
//               status: true,
//               graph_view: true,
//               rpm_consent: true,
//               height: true,
//               weight: true,
//               patient_group: { select: { id: true, name: true } },
//               assigned_clinician: { select: { user_id: true, f_name: true, l_name: true } },
//               attributes: {
//                 select: {
//                   id: true,
//                   dob: true,
//                   gender: true,
//                   height: true,
//                   weight: true,
//                   ethnic_group: true,
//                   lookup_table: true,
//                   smoking: true,
//                 },
//               },
//             },
//           },
//         },
//       }),
//       prisma.dc_users.count({ where }),
//     ]);

//     // Format patients to include attributes at top level
//     const formattedPatients = patients.map(p => ({
//       ...p,
//       attributes: p.patient_details?.attributes || null,
//     }));

//     res.json({
//       data: formattedPatients,
//       pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
//     });
//   } catch (error) {
//     console.error('Get patients error:', error);
//     res.status(500).json({ error: 'Failed to fetch patients' });
//   }
// };

const getAllPatients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      patient_group_id,
      assigned_clinician_id,
      // Filter fields
      first_name,
      last_name,
      dob_from,
      dob_to,
      chart_no,
      clinician_name,
      spirometry_date_from,
      spirometry_date_to,
      last_alert_from,
      last_alert_to,
      last_spirometry_from,
      last_spirometry_to,
    } = req.query;

    const where = {
      ut_id_fk: 4,
      us_id_fk: 1,
    };

    // Search across multiple fields
    if (search) {
      const searchTerm = search.trim();
      const nameParts = searchTerm.split(/\s+/).filter(Boolean);

      where.OR = [
        { f_name: { contains: searchTerm } },
        { l_name: { contains: searchTerm } },
        { userName: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { phone: { contains: searchTerm } },
        { patient_details: { chart_no: { contains: searchTerm } } },
      ];

      if (nameParts.length > 1) {
        where.OR.push(
          {
            AND: [
              { f_name: { contains: nameParts[0] } },
              { l_name: { contains: nameParts.slice(1).join(" ") } },
            ],
          },
          {
            AND: [
              { f_name: { contains: nameParts[nameParts.length - 1] } },
              { l_name: { contains: nameParts.slice(0, -1).join(" ") } },
            ],
          },
        );
      }
    }

    // ────────────────────────────────────────────────────────────
    // Clinician visibility scoping (security-critical — resolved
    // from req.user, never trusted from the client alone)
    // ────────────────────────────────────────────────────────────
    const visibleClinicianIds = await getVisibleClinicianIds(req.user);

    if (visibleClinicianIds.length === 0) {
      return res.json({
        data: [],
        pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, pages: 0 },
        filters: { available_filters: [] },
      });
    }

    // Build patient_details where clause
    let patientDetailsWhere = {};

    if (status) {
      patientDetailsWhere.status = status;
    }

    if (patient_group_id) {
      patientDetailsWhere.patient_group_id = parseInt(patient_group_id);
    }

    // If a specific clinician was requested, it must be within the
    // caller's visible set (self, or a clinician they manage).
    // Otherwise, default to everyone the caller can see.
    if (assigned_clinician_id) {
      const requestedId = parseInt(assigned_clinician_id);

      if (!visibleClinicianIds.includes(requestedId)) {
        return res.status(403).json({
          error: "Not authorized to view this clinician's patients",
        });
      }

      patientDetailsWhere.assigned_clinician_id = requestedId;
    } else {
      patientDetailsWhere.assigned_clinician_id = { in: visibleClinicianIds };
    }

    if (chart_no) {
      patientDetailsWhere.chart_no = { contains: chart_no };
    }

    if (dob_from || dob_to) {
      let dobFilter = {};

      if (dob_from) {
        const fromDate = new Date(dob_from);
        const fromDateString = fromDate.toISOString().split("T")[0];
        dobFilter.gte = fromDateString;
      }

      if (dob_to) {
        const toDate = new Date(dob_to);
        const toDateString = toDate.toISOString().split("T")[0];
        dobFilter.lte = toDateString;
      }

      if (Object.keys(dobFilter).length > 0) {
        patientDetailsWhere.attributes = {
          dob: dobFilter,
        };
      }
    }

    if (Object.keys(patientDetailsWhere).length > 0) {
      where.patient_details = patientDetailsWhere;
    }

    if (first_name) {
      where.f_name = { contains: first_name };
    }

    if (last_name) {
      where.l_name = { contains: last_name };
    }

    if (clinician_name) {
      const clinicianNameParts = clinician_name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      if (clinicianNameParts.length > 1) {
        where.patient_details = {
          ...(where.patient_details || {}),
          assigned_clinician: {
            OR: [
              {
                AND: [
                  { f_name: { contains: clinicianNameParts[0] } },
                  {
                    l_name: { contains: clinicianNameParts.slice(1).join(" ") },
                  },
                ],
              },
              {
                AND: [
                  {
                    f_name: {
                      contains:
                        clinicianNameParts[clinicianNameParts.length - 1],
                    },
                  },
                  {
                    l_name: {
                      contains: clinicianNameParts.slice(0, -1).join(" "),
                    },
                  },
                ],
              },
            ],
          },
        };
      } else {
        where.patient_details = {
          ...(where.patient_details || {}),
          assigned_clinician: {
            OR: [
              { f_name: { contains: clinician_name } },
              { l_name: { contains: clinician_name } },
            ],
          },
        };
      }
    }

    if (spirometry_date_from || spirometry_date_to) {
      where.observations = {
        some: {
          spirometries: {
            some: {
              dbdate: {
                ...(spirometry_date_from && {
                  gte: new Date(spirometry_date_from),
                }),
                ...(spirometry_date_to && {
                  lte: new Date(spirometry_date_to),
                }),
              },
            },
          },
        },
      };
    }

    if (last_spirometry_from || last_spirometry_to) {
      where.observations = {
        some: {
          spirometries: {
            some: {
              dbdate: {
                ...(last_spirometry_from && {
                  gte: new Date(last_spirometry_from),
                }),
                ...(last_spirometry_to && {
                  lte: new Date(last_spirometry_to),
                }),
              },
            },
          },
        },
      };
    }

    if (last_alert_from || last_alert_to) {
      where.alerts = {
        some: {
          created: {
            ...(last_alert_from && { gte: new Date(last_alert_from) }),
            ...(last_alert_to && { lte: new Date(last_alert_to) }),
          },
        },
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [patients, total] = await Promise.all([
      prisma.dc_users.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { reg_date: "desc" },
        select: {
          user_id: true,
          f_name: true,
          l_name: true,
          email: true,
          phone: true,
          profile_pic: true,
          is_rpm_allow: true,
          reg_date: true,
          userName: true,
          user_status: { select: { name: true } },
          patient_details: {
            select: {
              pd_id: true,
              chart_no: true,
              blood_group: true,
              status: true,
              graph_view: true,
              rpm_consent: true,
              height: true,
              weight: true,
              patient_group: { select: { id: true, name: true } },
              assigned_clinician: {
                select: { user_id: true, f_name: true, l_name: true },
              },
              attributes: {
                select: {
                  id: true,
                  dob: true,
                  gender: true,
                  height: true,
                  weight: true,
                  ethnic_group: true,
                  lookup_table: true,
                  smoking: true,
                },
              },
            },
          },
          alerts: {
            orderBy: { created: "desc" },
            take: 1,
            select: {
              id: true,
              message: true,
              created: true,
              is_read: true,
            },
          },
          observations: {
            orderBy: { dbdate: "desc" },
            take: 1,
            select: {
              id: true,
              dbdate: true,
              spirometries: {
                select: {
                  id: true,
                  dbdate: true,
                  fvc: true,
                  fev1: true,
                  pefr: true,
                  fef2575: true,
                  fev1_perc: true,
                  quality_message: true,
                },
              },
            },
          },
          portal_notes: {
            orderBy: { dbdate: "desc" },
            take: 1,
            select: {
              id: true,
              text: true,
              dbdate: true,
              page: true,
            },
          },
          _count: {
            select: {
              observations: true,
              alerts: true,
            },
          },
        },
      }),
      prisma.dc_users.count({ where }),
    ]);

    const formattedPatients = patients.map((p) => {
      const latestAlert = p.alerts?.[0] || null;
      const latestObservation = p.observations?.[0] || null;
      const latestSpirometry = latestObservation?.spirometries?.[0] || null;
      const latestNote = p.portal_notes?.[0] || null;

      return {
        ...p,
        attributes: p.patient_details?.attributes || null,
        last_alert: latestAlert
          ? {
              message: latestAlert.message,
              date: latestAlert.created,
              is_read: latestAlert.is_read,
            }
          : null,
        last_spirometry: latestSpirometry
          ? {
              date: latestSpirometry.dbdate || latestObservation.dbdate,
              fvc: latestSpirometry.fvc,
              fev1: latestSpirometry.fev1,
              pefr: latestSpirometry.pefr,
              fef2575: latestSpirometry.fef2575,
              fev1_perc: latestSpirometry.fev1_perc,
              quality_message: latestSpirometry.quality_message,
            }
          : null,
        last_note: latestNote
          ? {
              text: latestNote.text,
              date: latestNote.dbdate,
              page: latestNote.page,
            }
          : null,
        total_observations: p._count?.observations || 0,
        total_alerts: p._count?.alerts || 0,
      };
    });

    res.json({
      data: formattedPatients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      filters: {
        available_filters: [
          "first_name",
          "last_name",
          "dob_from",
          "dob_to",
          "chart_no",
          "clinician_name",
          "spirometry_date_from",
          "spirometry_date_to",
          "last_alert_from",
          "last_alert_to",
          "last_spirometry_from",
          "last_spirometry_to",
          "status",
          "patient_group_id",
          "assigned_clinician_id",
        ],
      },
    });
  } catch (error) {
    console.error("Get patients error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch patients", details: error.message });
  }
};
// Get single patient with full medical details
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

function buildTabParams(tab, userId, query) {
  switch (tab) {
    case "patient-info":
    case "alerts":
      return { userId };

    case "spirometry": {
      if (!query.date || !DATE_REGEX.test(query.date)) {
        throw new ValidationError(
          "date (YYYY-MM-DD) is required for the spirometry tab",
        );
      }
      return { userId, date: query.date };
    }

    case "analysis": {
      const startDate = parseDateParam(query.startDate, "startDate");
      const endDate = parseDateParam(query.endDate, "endDate");
      ensureRangeOrdered(startDate, endDate);
      return { userId, startDate, endDate, variable: query.variable || "FEV1" };
    }

    case "session-comparison": {
      const sessionId1 = parsePositiveInt(query.sessionId1, "sessionId1");
      const sessionId2 = parsePositiveInt(query.sessionId2, "sessionId2");
      return { userId, sessionId1, sessionId2 };
    }

    case "reports":
    case "billing": {
      const startDate = parseDateParam(query.startDate, "startDate");
      const endDate = parseDateParam(query.endDate, "endDate");
      ensureRangeOrdered(startDate, endDate);
      return { userId, startDate, endDate };
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

const listPatients = async (req, res) => {
  try {
    const patients = await patientService.getPatientsList();
    return res.json({ data: patients });
  } catch (error) {
    console.error("List patients error:", error);
    return res.status(500).json({ error: "Failed to fetch patients" });
  }
};

// Create medical attributes for patient
const createAttributes = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      phone,
      dob,
      height,
      weight,
      gender,
      ethnic_group,
      smoking,
      chart_number,
      account_type,
      welcome_method,
      addresses,
      air_monitors,
    } = req.body;

    // Check patient exists
    const patient = await prisma.dc_patient_details.findFirst({
      where: { pd_id: parseInt(id) },
    });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Check if attributes already exist
    const existing = await prisma.vf_attributes.findFirst({
      where: { pd_id: parseInt(id) },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "Attributes already exist. Use update." });
    }

    const attributes = await prisma.vf_attributes.create({
      data: {
        first_name: first_name || patient.chart_no || "",
        last_name: last_name || "",
        phone: phone || null,
        dob: dob || "",
        height: height || 0,
        weight: weight || null,
        gender: gender || "",
        ethnic_group: ethnic_group || "",
        smoking: smoking || false,
        chart_number: chart_number || patient.chart_no,
        account_type: account_type || "test",
        welcome_method: welcome_method || "text",
        pd_id: parseInt(id),
        addresses: addresses
          ? {
              create: addresses.map((a) => ({
                street: a.street || "",
                city: a.city || "",
                state: a.state || "",
                zip: a.zip || "",
              })),
            }
          : undefined,
        air_monitors: air_monitors
          ? {
              create: air_monitors.map((am) => ({
                monitor_id: am.monitor_id || "",
                label: am.label || "",
                dev_id: am.dev_id || null,
              })),
            }
          : undefined,
      },
      include: {
        addresses: true,
        air_monitors: { include: { device: true } },
      },
    });

    res
      .status(201)
      .json({ message: "Patient attributes created", data: attributes });
  } catch (error) {
    console.error("Create attributes error:", error);
    res.status(500).json({ error: "Failed to create attributes" });
  }
};

// Update medical attributes
const updateAttributes = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove nested objects for separate handling
    const { addresses, air_monitors, ...attrData } = updateData;

    const attributes = await prisma.vf_attributes.update({
      where: { pd_id: parseInt(id) },
      data: attrData,
      include: { addresses: true, air_monitors: true },
    });

    res.json({ message: "Attributes updated", data: attributes });
  } catch (error) {
    console.error("Update attributes error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Attributes not found" });
    }
    res.status(500).json({ error: "Failed to update attributes" });
  }
};

// Get patient prescriptions
const getPrescriptions = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, start_date, end_date } = req.query;

    let patientId = null;

    // Check if id is numeric
    if (/^\d+$/.test(id)) {
      patientId = parseInt(id);
    } else {
      // Search ONLY by userName
      const patient = await prisma.dc_users.findFirst({
        where: {
          ut_id_fk: 4,
          userName: id,
        },
      });

      if (patient) {
        patientId = patient.user_id;
      } else {
        // Return empty list instead of error
        return res.json({
          data: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0,
          },
        });
      }
    }

    const where = {
      patient_id_fk: patientId,
      is_deleted: false,
    };

    if (start_date || end_date) {
      where.pr_date = {};
      if (start_date) where.pr_date.gte = new Date(start_date);
      if (end_date) where.pr_date.lte = new Date(end_date + "T23:59:59Z");
    }

    const [prescriptions, total] = await Promise.all([
      prisma.dc_ehr_prescriptions.findMany({
        where,
        include: {
          doctor: { select: { user_id: true, f_name: true, l_name: true } },
          medicines: true,
        },
        orderBy: { pr_date: "desc" },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.dc_ehr_prescriptions.count({ where }),
    ]);

    res.json({
      data: prescriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
};
// GET /prescriptions
// Lists prescriptions across ALL clinic patients (ut_id_fk: 4), paginated.
// Optional filters: search (username/patient id), start_date, end_date, order.


const getPrescriptionsList = async (req, res) => {
  try {
    const {
      search,
      start_date,
      end_date,
      page = 1,
      limit = 10,
      order = "desc",
    } = req.query;

    const sortOrder = String(order).toLowerCase() === "asc" ? "asc" : "desc";

    // Base: only prescriptions for actual clinic patients
    const patientFilter = { ut_id_fk: 4 };

    // 🔒 Visibility scoping via shared helper — same rule as
    // getAllPatients / getSpirometryList: clinicians (ut_id_fk=3) and
    // clinician_admins (ut_id_fk=6) only see patients assigned
    // directly to their own user_id.
    if (req.user.ut_id_fk === 3 || req.user.ut_id_fk === 6) {
      const visibleClinicianIds = await getVisibleClinicianIds(req.user);

      if (visibleClinicianIds.length === 0) {
        return res.json({
          data: [],
          pagination: {
            page: Math.max(parseInt(page) || 1, 1),
            limit: Math.max(parseInt(limit) || 10, 1),
            total: 0,
            pages: 0,
          },
          order: sortOrder,
        });
      }

      patientFilter.patient_details = {
        assigned_clinician_id: { in: visibleClinicianIds },
      };
    }

    if (search && search.trim()) {
      const term = search.trim();
      if (/^\d+$/.test(term)) {
        patientFilter.user_id = parseInt(term);
      } else {
        patientFilter.OR = [
          { email: term },
          { phone: term },
          { userName: term },
        ];
      }
    }

    const where = {
      is_deleted: false,
      patient: patientFilter, // ⚠️ adjust relation name — see note below
    };

    if (start_date || end_date) {
      where.pr_date = {};
      if (start_date) where.pr_date.gte = new Date(start_date);
      if (end_date) where.pr_date.lte = new Date(end_date + "T23:59:59Z");
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 10, 1);

    const [prescriptions, total] = await Promise.all([
      prisma.dc_ehr_prescriptions.findMany({
        where,
        include: {
          doctor: { select: { user_id: true, f_name: true, l_name: true } },
          medicines: true,
          patient: {
            // ⚠️ same relation name as above
            select: {
              user_id: true,
              f_name: true,
              l_name: true,
              userName: true,
            },
          },
        },
        orderBy: { pr_date: sortOrder },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.dc_ehr_prescriptions.count({ where }),
    ]);

    // Flatten patient info onto each row, since this list spans multiple patients
    const data = prescriptions.map((p) => ({
      ...p,
      patient_id: p.patient?.user_id ?? p.patient_id_fk,
      patient_name: p.patient
        ? `${p.patient.f_name} ${p.patient.l_name}`.trim()
        : null,
      patient_username: p.patient?.userName || null,
    }));

    res.json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      order: sortOrder,
    });
  } catch (error) {
    console.error("Get prescriptions list error:", error);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
};



const createPrescription = async (req, res) => {
  console.log("createPrescription req.body:", req.body);
  try {
    const { pharmacy_instruction, diagnosis, medicines } = req.body;
    const { id } = req.params;
    const doctorId = req.user?.user_id;

    let patientId = null;

    // Check if id is numeric
    if (/^\d+$/.test(id)) {
      patientId = parseInt(id);
    } else {
      // Search ONLY by userName
      const patient = await prisma.dc_users.findFirst({
        where: {
          ut_id_fk: 4,
          userName: id,
        },
      });

      if (patient) {
        patientId = patient.user_id;
      } else {
        return res.status(404).json({ error: "Patient not found" });
      }
    }

    if (!doctorId || isNaN(doctorId)) {
      return res.status(400).json({ error: "Doctor ID is required" });
    }

    const prescription = await prisma.dc_ehr_prescriptions.create({
      data: {
        pharmacy_instruction: pharmacy_instruction || "",
        diagnosis: diagnosis || "",
        patient_id_fk: patientId,
        doctor_id_fk: doctorId,
        medicines:
          medicines && medicines.length > 0
            ? {
                create: medicines.map((m) => ({
                  type: m.type || null,
                  drug: m.drug || "N/A",
                  dosage: m.dosage || "N/A",
                  frequency: m.frequency || "N/A",
                  quantity: m.quantity || "1",
                  days: m.days || "1",
                  units: m.units || null,
                  direction: m.direction || "N/A",
                })),
              }
            : undefined,
      },
      include: {
        doctor: { select: { user_id: true, f_name: true, l_name: true } },
        medicines: true,
      },
    });

    res.status(201).json({
      message: "Prescription created",
      data: prescription,
    });
  } catch (error) {
    console.error("Create prescription error:", error);
    res.status(500).json({
      error: "Failed to create prescription",
      message: error.message,
    });
  }
};
// Get patient groups
const getPatientGroups = async (req, res) => {
  try {
    const groups = await prisma.vf_patient_group.findMany({
      include: {
        account: { select: { id: true, name: true } },
        _count: { select: { patients: true } },
      },
    });
    res.json({ data: groups });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// Create patient group
const createPatient = async (req, res) => {
  try {
    const body = req.body || {};
    const {
      f_name,
      l_name,
      email,
      phone,
      password,
      dob,
      chart_no,
      blood_group,
      height,
      weight,
      gender,
      patient_group_id,
      assigned_clinician_id,
      status,
    } = body;

    const first_name = f_name || "";
    const last_name = l_name || "";
    const userEmail = email || phone || `patient-${Date.now()}@vitalflow.com`;
    const userPhone = phone || `phone-${crypto.randomBytes(8).toString("hex")}`;

    // Check for existing user by email
    const existingEmail = await prisma.dc_users.findFirst({
      where: { email: userEmail },
    });
    if (existingEmail) {
      return res.status(409).json({
        error: "User already exists",
        message: "A user with this email already exists",
        field: "email",
      });
    }

    // Check for existing user by phone
    const existingPhone = await prisma.dc_users.findFirst({
      where: { phone: userPhone },
    });
    if (existingPhone) {
      return res.status(409).json({
        error: "User already exists",
        message: "A user with this phone number already exists",
        field: "phone",
      });
    }

    const hashedPassword = await hashPassword(password || "TempPass123!");

    let chartNo =
      chart_no || crypto.randomBytes(4).toString("hex").toUpperCase();

    // Generate username from email
    const userName = await generateUserName(userEmail);

    const heightValue = height ? parseFloat(height) : null;
    const weightValue = weight ? parseFloat(weight) : null;
    const clinicianId = assigned_clinician_id
      ? parseInt(assigned_clinician_id)
      : null;
    const groupId = patient_group_id ? parseInt(patient_group_id) : null;

    // Create user with patient_details AND attributes
    const user = await prisma.dc_users.create({
      data: {
        f_name: first_name,
        l_name: last_name,
        email: userEmail,
        phone: userPhone,
        password: hashedPassword,
        userName,
        ut_id_fk: 4,
        us_id_fk: status === "active" ? 1 : 4,
        is_availible: true,
        patient_details: {
          create: {
            chart_no: chartNo,
            invite_code: chartNo,
            access_code: chartNo,
            assigned_clinician_id: clinicianId,
            status: status || "active",
            height: heightValue,
            weight: weightValue,
            blood_group: blood_group || null,
            patient_group_id: groupId,
            attributes: {
              create: {
                first_name: first_name,
                last_name: last_name,
                phone: userPhone,
                dob: dob || "",
                height: heightValue || 0,
                weight: weightValue,
                gender: gender || "",
                chart_number: chartNo,
              },
            },
          },
        },
      },
      include: {
        patient_details: {
          include: {
            attributes: true,
            assigned_clinician: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Patient created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Create patient error:", error.message);
    if (error.code === "P2002") {
      const targets = error.meta?.target || [];
      let field = "field";
      if (targets.includes("email")) field = "email";
      else if (targets.includes("phone")) field = "phone";
      return res.status(409).json({
        error: "User already exists",
        message: `A user with this ${field} already exists`,
        field,
      });
    }
    res
      .status(400)
      .json({ error: "Failed to create patient", message: error.message });
  }
};

// Get all clinicians for dropdown
const getClinicians = async (req, res) => {
  try {
    const clinicians = await prisma.dc_users.findMany({
      where: { ut_id_fk: 3 },
      select: {
        user_id: true,
        f_name: true,
        l_name: true,
        email: true,
        userName: true,
      },
      orderBy: { f_name: "asc" },
    });
    res.json({ data: clinicians });
  } catch (error) {
    console.error("Get clinicians error:", error);
    res.status(500).json({ error: "Failed to fetch clinicians" });
  }
};

// Create patient group
const createPatientGroup = async (req, res) => {
  try {
    const { name, account_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    const group = await prisma.vf_patient_group.create({
      data: {
        name,
        account_id: account_id ? parseInt(account_id) : 1,
        creation_date: new Date(),
      },
    });

    res.status(201).json({ message: "Group created", data: group });
  } catch (error) {
    console.error("Create patient group error:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
};

module.exports = {
  getAllPatients,
  createPatient,
  getPatientById,
  createAttributes,
  updateAttributes,
  getPrescriptions,
  createPrescription,
  getPatientGroups,
  createPatientGroup,
  getClinicians,
  listPatients,
  getPrescriptionsList,
};
