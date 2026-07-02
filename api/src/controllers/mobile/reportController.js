const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// In-memory task store (use DB in production)
const taskStore = {};

// 28. Generate Report
const generateReport = async (req, res) => {
  try {
    const {
      admin_id, start_date, end_date,
      spirometry_report_ids, pre_post_report_ids,
      rpm_billing_report_ids, pdf_preference,
    } = req.body;

    const taskId = crypto.randomBytes(16).toString('hex');
    
    taskStore[taskId] = {
      status: 'processing',
      progress: 0,
      created: new Date(),
    };

    // Simulate async processing
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (taskStore[taskId]) {
        taskStore[taskId].progress = progress;
        if (progress >= 100) {
          taskStore[taskId].status = 'complete';
          taskStore[taskId].download_ready = true;
          clearInterval(interval);
        }
      }
    }, 2000);

    res.status(202).json({
      task_id: taskId,
      message: 'Report generation started',
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// 29. Get Report Status
const getReportStatus = async (req, res) => {
  try {
    const { task_id } = req.params;
    const task = taskStore[task_id];

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      task_status: task.status,
      progress: task.progress,
      message: task.status === 'processing' ? 'Generating PDF...' : 'Complete',
      ...(task.download_ready && { download_ready: true }),
    });
  } catch (error) {
    console.error('Get report status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
};

// 30. Get Report Download Link
const downloadReport = async (req, res) => {
  try {
    const { task_id } = req.params;
    const task = taskStore[task_id];

    if (!task || task.status !== 'complete') {
      return res.status(404).json({ error: 'Report not ready' });
    }

    res.json({
      download_link: `https://storage.example.com/reports/report_${task_id}.pdf?token=signed_url_123`,
      expires_in: 3600,
    });
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ error: 'Failed to get download link' });
  }
};

module.exports = { generateReport, getReportStatus, downloadReport };
