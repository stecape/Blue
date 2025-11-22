import React from 'react';
import styles from '../../styles/DeviceInfoPanel.module.scss';

function DeviceInfoItem({ icon, label, value, highlight }) {
  return (
    <div className={styles.infoItem} style={highlight ? {fontWeight:'bold'} : {}}>
      {icon && <span className={styles.infoIcon}>{icon}</span>}
      <span className={styles.infoLabel}>{label}:</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}

export default DeviceInfoItem;
