const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllDevices = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, is_active } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { dev_name: { contains: search } },
        { dev_detail: { contains: search } },
      ];
    }
    if (is_active !== undefined) where.is_active = is_active === 'true';
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [devices, total] = await Promise.all([
      prisma.dc_devices.findMany({
        where, skip, take: parseInt(limit), orderBy: { dev_date_time: 'desc' },
        include: { air_monitors: true, _count: { select: { air_monitors: true } } },
      }),
      prisma.dc_devices.count({ where }),
    ]);
    res.json({ data: devices, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
};

const getDeviceById = async (req, res) => {
  try {
    const device = await prisma.dc_devices.findUnique({
      where: { dev_id: parseInt(req.params.id) },
      include: { air_monitors: true },
    });
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json({ data: device });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device' });
  }
};

const createDevice = async (req, res) => {
  try {
    const { dev_name, dev_detail, dev_image } = req.body;
    const device = await prisma.dc_devices.create({ data: { dev_name, dev_detail: dev_detail || null, dev_image: dev_image || null } });
    res.status(201).json({ message: 'Device registered', data: device });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create device' });
  }
};

const updateDevice = async (req, res) => {
  try {
    const { dev_name, dev_detail, dev_image, is_active } = req.body;
    const data = {};
    if (dev_name) data.dev_name = dev_name;
    if (dev_detail !== undefined) data.dev_detail = dev_detail;
    if (dev_image !== undefined) data.dev_image = dev_image;
    if (is_active !== undefined) data.is_active = is_active;
    const device = await prisma.dc_devices.update({ where: { dev_id: parseInt(req.params.id) }, data });
    res.json({ message: 'Device updated', data: device });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update device' });
  }
};

const assignDevice = async (req, res) => {
  try {
    const { patient_id, monitor_id, label } = req.body;
    const deviceId = parseInt(req.params.id);
    const patient = await prisma.dc_patient_details.findUnique({ where: { pd_id: parseInt(patient_id) }, include: { attributes: true } });
    if (!patient || !patient.attributes) return res.status(404).json({ error: 'Patient or attributes not found' });
    const airMonitor = await prisma.vf_air_monitor.create({
      data: { monitor_id: monitor_id || `MON-${deviceId}`, label: label || 'Patient Monitor', dev_id: deviceId, attributes_id: patient.attributes.id },
      include: { device: true },
    });
    res.status(201).json({ message: 'Device assigned to patient', data: airMonitor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign device' });
  }
};

const getDeviceReadings = async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    const device = await prisma.dc_devices.findUnique({ where: { dev_id: deviceId } });
    if (!device) return res.status(404).json({ error: 'Device not found' });

    // Get air monitors linked to this device
    const airMonitors = await prisma.vf_air_monitor.findMany({
      where: { dev_id: deviceId },
      select: { attributes_id: true },
    });
    
    const attributeIds = airMonitors.map(am => am.attributes_id);

    // Get readings for those attributes
    const readings = attributeIds.length > 0 ? await prisma.portal_indoor_air_quality.findMany({
      where: { user_id: { in: attributeIds } },
      orderBy: { dbdate: 'desc' },
      take: 50,
    }) : [];

    res.json({
      data: {
        device_id: deviceId,
        device_name: device.dev_name,
        readings: readings.map(r => ({
          timestamp: r.dbdate,
          pm25: r.pm25,
          pm10: r.pm10,
          temperature: r.temperature,
          humidity: r.humidity,
          co2: r.co2,
          voc: r.voc,
        })),
      },
    });
  } catch (error) {
    console.error('Get readings error:', error);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
};

module.exports = { getAllDevices, getDeviceById, createDevice, updateDevice, assignDevice, getDeviceReadings };
