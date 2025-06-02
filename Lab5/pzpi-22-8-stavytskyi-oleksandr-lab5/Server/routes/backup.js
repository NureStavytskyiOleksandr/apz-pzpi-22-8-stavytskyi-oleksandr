const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const restrictTo = require('../middleware/restrictTo');

dotenv.config();

router.post('/backup', restrictTo('super_admin'), async (req, res) => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(500).json({ error: 'DATABASE_URL is not configured' });
  }

  const backupDir = path.join(__dirname, '../backups');
  const timestamp = Date.now();
  const backupFileName = `backup_${timestamp}.backup`;
  const backupFilePath = path.join(backupDir, backupFileName);

  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const cmd = `pg_dump --format=custom --file="${backupFilePath}" "${dbUrl}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('pg_dump error:', stderr);
        return res.status(500).json({ error: 'Failed to create backup' });
      }

      console.log('Backup created at:', backupFilePath);

      res.status(200).json({
        message: 'Backup created successfully',
        filePath: backupFilePath,
        fileName: backupFileName,
      });
    });

  } catch (error) {
    console.error('Backup error:', error);
    return res.status(500).json({ error: 'Unexpected server error during backup' });
  }
});

module.exports = router;