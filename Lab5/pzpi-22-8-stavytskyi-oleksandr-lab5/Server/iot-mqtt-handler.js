const mqtt = require('mqtt');
const pool = require('./db');
const IoTDevice = require('./models/IoTDevice');
const ParkingHistory = require('./models/ParkingHistory');
const dotenv = require('dotenv');

dotenv.config();

class IoTMQTTHandler {
  constructor() {
    this.mqttClient = null;
    this.lastStatuses = new Map(); // Зберігаємо останній статус і час для кожного spot_id
    this.initializeMQTT();
  }

  initializeMQTT() {
    this.mqttClient = mqtt.connect({
      host: process.env.MQTT_HOST || 'broker.emqx.io',
      port: process.env.MQTT_PORT || 1883,
      username: process.env.MQTT_USER || '',
      password: process.env.MQTT_PASSWORD || '',
    });

    this.mqttClient.on('connect', () => {
      console.log('Підключено до MQTT брокера');
      this.mqttClient.subscribe('parking/status', (err) => {
        if (err) console.error('Помилка підписки на топік:', err);
        else console.log('Підписано на топік parking/status');
      });
    });

    this.mqttClient.on('message', async (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        console.log('Отримано повідомлення:', payload);

        const { sensor_id, spot_status } = payload;
        const device_uuid = String(sensor_id);
        const occupied = spot_status;

        // Отримуємо spot_id за device_uuid
        const deviceResult = await pool.query(
          'SELECT spot_id FROM iot_devices WHERE device_uuid = $1',
          [device_uuid]
        );
        const spot_id = deviceResult.rows[0]?.spot_id;

        if (spot_id) {
          // Оновлюємо статус паркомісця
          await IoTDevice.updateStatus({ device_uuid, occupied });

          // Отримуємо попередній статус і час
          const lastStatus = this.lastStatuses.get(spot_id);
          let duration_seconds = null;

          if (lastStatus) {
            const lastOccupied = lastStatus.occupied;
            const lastTimestamp = lastStatus.timestamp;

            // Якщо місце було зайняте і стало вільним, обчислюємо тривалість
            if (lastOccupied && !occupied) {
              duration_seconds = Math.floor((new Date() - lastTimestamp) / 1000);
            }
          }

          // Записуємо в історію
          await ParkingHistory.create({
            spot_id,
            device_uuid,
            is_occupied: occupied,
            duration_seconds,
          });

          // Оновлюємо останній статус
          this.lastStatuses.set(spot_id, {
            occupied,
            timestamp: new Date(),
          });

          console.log(`Статус оновлено для device_uuid=${device_uuid}: is_occupied=${occupied}`);
        } else {
          console.error('Spot not found for device_uuid:', device_uuid);
        }
      } catch (error) {
        console.error('Помилка обробки повідомлення:', error);
      }
    });

    this.mqttClient.on('error', (error) => {
      console.error('Помилка MQTT:', error);
    });
  }
}

module.exports = new IoTMQTTHandler();