const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const userGroupRoutes = require('./routes/user-groups');
const userGroupMemberRoutes = require('./routes/user-group-members');
const parkingRoutes = require('./routes/parkings');
const parkingGroupRoutes = require('./routes/parking-groups');
const parkingSpotRoutes = require('./routes/parking-spots');
const iotDeviceRoutes = require('./routes/iot-devices');
const userGroupParkingGroupAccessRoutes = require('./routes/user-group-parking-group-access');
const parkingAdminRoutes = require('./routes/parking-admins');
const parkingStatsRoutes = require('./routes/parking-stats');
const IoTMQTTHandler = require('./iot-mqtt-handler');
const backupRoutes = require('./routes/backup');

dotenv.config();
const app = express();

app.use(cors());
app.options('*', cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/user-groups', userGroupRoutes);
app.use('/user-group-members', userGroupMemberRoutes);
app.use('/parkings', parkingRoutes);
app.use('/parking-groups', parkingGroupRoutes);
app.use('/parking-spots', parkingSpotRoutes);
app.use('/iot-devices', iotDeviceRoutes);
app.use('/user-group-parking-group-access', userGroupParkingGroupAccessRoutes);
app.use('/parking-admins', parkingAdminRoutes);
app.use('/parking-stats', parkingStatsRoutes);
app.use('/backup', backupRoutes);

console.log('Запуск IoT MQTT-обробника...');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущено на порті ${PORT}`);
});
