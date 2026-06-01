const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CRUD
const getAllAccounts = async (req, res) => {
  try {
    const accounts = await prisma.vf_account.findMany({
      include: {
        account_attributes: true,
        _count: { select: { patient_groups: true, doctor_details: true } },
      },
    });
    res.json({ data: accounts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

const getAccountById = async (req, res) => {
  try {
    const account = await prisma.vf_account.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        account_attributes: true,
        patient_groups: { include: { _count: { select: { patients: true } } } },
        doctor_details: { include: { user: { select: { user_id: true, f_name: true, l_name: true, email: true } } } },
      },
    });
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json({ data: account });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch account' });
  }
};

const createAccount = async (req, res) => {
  try {
    const { name, breezometer, awair, bronchodilator_responsiveness_testing, clinical_decision_support_flowchart } = req.body;
    const account = await prisma.vf_account.create({
      data: {
        name,
        account_attributes: {
          create: {
            breezometer: breezometer ?? true,
            awair: awair ?? true,
            bronchodilator_responsiveness_testing: bronchodilator_responsiveness_testing ?? true,
            clinical_decision_support_flowchart: clinical_decision_support_flowchart ?? false,
          },
        },
      },
      include: { account_attributes: true },
    });
    res.status(201).json({ message: 'Account created', data: account });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { name, ...attrs } = req.body;
    const data = {};
    if (name) data.name = name;
    
    const account = await prisma.vf_account.update({
      where: { id: parseInt(req.params.id) },
      data,
    });

    if (Object.keys(attrs).length > 0) {
      await prisma.vf_account_attributes.update({
        where: { account_id: parseInt(req.params.id) },
        data: attrs,
      });
    }

    res.json({ message: 'Account updated', data: account });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update account' });
  }
};

const getAccountAttributes = async (req, res) => {
  try {
    const attrs = await prisma.vf_account_attributes.findUnique({
      where: { account_id: parseInt(req.params.id) },
    });
    res.json({ data: attrs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attributes' });
  }
};

const getAccountStats = async (req, res) => {
  try {
    const accountId = parseInt(req.params.id);
    const [totalPatients, totalClinicians, groups] = await Promise.all([
      prisma.dc_patient_details.count({ where: { patient_group: { account_id: accountId } } }),
      prisma.dc_doctor_details.count({ where: { h_id_fk: accountId } }),
      prisma.vf_patient_group.findMany({ where: { account_id: accountId }, include: { _count: { select: { patients: true } } } }),
    ]);
    res.json({ data: { total_patients: totalPatients, total_clinicians: totalClinicians, groups } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = { getAllAccounts, getAccountById, createAccount, updateAccount, getAccountAttributes, getAccountStats };
