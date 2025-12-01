import React from 'react';
import styles from '../../styles/DeviceInfoPanel.module.scss';
import DeviceInfoItem from './DeviceInfoItem';

function DeviceInfoPanel({ device }) {
  return (
    <div className={styles.deviceInfoPanel}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h2 className={styles.deviceName} style={{ margin: 0 }}>
            {device.name || 'Smart Pot'}
          </h2>
          <DeviceInfoItem
            icon={null}
            label="Stato"
            value={
              device.status === 1 ? (
                <span className={styles.online}>Online</span>
              ) : (
                <span className={styles.offline}>Offline</span>
              )
            }
            highlight
          />
        </div>
      </div>
      <div className={styles.infoGrid}>
        <DeviceInfoItem label="ID dispositivo" value={device.id || '-'} />
        <DeviceInfoItem label="Template" value={device.templateName || '-'} />
        <DeviceInfoItem label="Posizione" value={device.location || '-'} />
        <DeviceInfoItem
          label="Auto-innaffiatura"
          value={device.autoIrrigation ? 'Attiva' : 'Spenta'}
        />
        <DeviceInfoItem
          label="Ultima innaffiatura"
          value={device.lastIrrigation || '-'}
        />
        <DeviceInfoItem
          label="Ultima comunicazione"
          value={device.lastCommunication || '-'}
        />
        <DeviceInfoItem
          label="Sensori"
          value={
            device.sensors && device.sensors.length > 0
              ? device.sensors.join(', ')
              : '-'
          }
        />
      </div>
    </div>
  );
}

export default DeviceInfoPanel;
