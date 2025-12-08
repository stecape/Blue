import { useContext } from 'react';
import { Button } from '@react-md/button';
import { getApiUrl } from '../../Helpers/config';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableContainer,
} from '@react-md/table';
import { CheckCircleSVGIcon } from '@react-md/material-icons';
import { ctxData } from '../../Helpers/CtxProvider';
import tableStyles from '../../styles/Table.module.scss';
import axios from 'axios';
import { AdminContext, DBTag } from 'shared/types';

type AlarmRow = {
  Device: string;
  Name: string;
  Description: string;
  Reaction: string;
  Status: string;
  Ts: string;
};

type DeviceAlarms = {
  device: string;
  alarms: AlarmRow[];
};

function AlarmsList() {
  // Usa la variabile d'ambiente per configurare l'URL del server
  const serverIp = getApiUrl();
  const ctx = useContext(ctxData);
  
  // Se il contesto non è disponibile, non renderizzare nulla
  if (!ctx) return <></>;
  
  // Recupero gli ID dei tipi e dei campi necessari
  let alarmTypeId: number = ctx.types.find((t) => t.name === 'Alarm')?.id || 0;
  let alarmStatusFieldId: number =
    ctx.fields.find((t) => t.parent_type === alarmTypeId && t.name === 'Status')
      ?.id || 0;
  let alarmReactionFieldId: number =
    ctx.fields.find(
      (t) => t.parent_type === alarmTypeId && t.name === 'Reaction',
    )?.id || 0;
  let alarmTsFieldId: number =
    ctx.fields.find((t) => t.parent_type === alarmTypeId && t.name === 'Ts')
      ?.id || 0;

  // Semplificare il controllo utilizzando direttamente tag.type === alarmTypeId
  let alarms: DeviceAlarms[] = ctx.devices.map((device) => {
    // filtro le tag di tipo Alarm del dispositivo corrente, che siano type_field o vars
    let alarmTags: DBTag[] = getDeviceAlarms(device.id, ctx, alarmTypeId);
    let deviceAlarms: AlarmRow[] = alarmTags.map((al) => {
      let alarm: AlarmRow = {
        Device: '',
        Name: '',
        Description: '',
        Reaction: '',
        Status: '',
        Ts: ''
      };
      let alarmSubTags: DBTag[] = ctx.tags.filter((t) => t.parent_tag === al.id);

      alarm.Device = device.name;
      alarm.Name = al.name;
      alarm.Description = al.comment || '';
      alarm.Reaction =
        alarmSubTags.find((t) => t.type_field === alarmReactionFieldId)?.value
          ?.value ?? '';
      alarm.Status =
        alarmSubTags.find((t) => t.type_field === alarmStatusFieldId)?.value
          ?.value ?? '';

      let ts = alarmSubTags.find((t) => t.type_field === alarmTsFieldId);
      let utc_offset = device.utc_offset || 0; // Usa l'offset UTC del dispositivo, se disponibile
      //console.log("device: ", device.name, "utc_offset: ", utc_offset)
      ts !== undefined && ts.value !== undefined && ts.value !== null
        ? (alarm.Ts = new Date(
            Number(ts.value.value) + Number(utc_offset),
          ).toLocaleString())
        : (alarm.Ts = new Date(0).toLocaleString());

      return alarm;
    });
    return { device: device.name, alarms: deviceAlarms };
  });

  return (
    <>
      <TableContainer>
        <Table fullWidth>
          <TableHeader>
            <TableRow>
              <TableCell hAlign="left">Device</TableCell>
              <TableCell hAlign="left" style={{ minWidth: '200px' }}>
                TimeStamp
              </TableCell>
              <TableCell hAlign="left" style={{ minWidth: '200px' }}>
                Name
              </TableCell>
              <TableCell hAlign="left" grow>
                Description
              </TableCell>
              <TableCell hAlign="center">Reaction</TableCell>
              <TableCell hAlign="center">Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alarms.map(({ device, alarms }) =>
              alarms
                .filter((alarm: AlarmRow) => alarm.Status) // Filtra gli allarmi con Status diverso da 0, "" o null
                .sort((a: AlarmRow, b: AlarmRow) => {
                  const dateA = new Date(a.Ts).getTime();
                  const dateB = new Date(b.Ts).getTime();
                  return dateB - dateA; // Ordina in ordine decrescente
                })
                .map((alarm: AlarmRow) => {
                  return (
                    <TableRow key={`${device}-${alarm.Name}`}>
                      <TableCell className={tableStyles.cell} hAlign="left">
                        {device}
                      </TableCell>
                      <TableCell className={tableStyles.cell} hAlign="left">
                        {alarm.Ts}
                      </TableCell>
                      <TableCell className={tableStyles.cell} hAlign="left">
                        {alarm.Name}
                      </TableCell>
                      <TableCell className={tableStyles.cell} hAlign="left">
                        {alarm.Description}
                      </TableCell>
                      <TableCell className={tableStyles.cell} hAlign="center">
                        {alarm.Reaction}
                      </TableCell>
                      <TableCell className={tableStyles.cell} hAlign="center">
                        {alarm.Status}
                      </TableCell>
                    </TableRow>
                  );
                }),
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        floating="bottom-right"
        onClick={() => axios.post(`${serverIp}/api/mqtt/alarms_ack`)}
      >
        <CheckCircleSVGIcon />
      </Button>
    </>
  );
}
export default AlarmsList;

/**
 * Estrae tutte le tag di tipo Alarm per un device.
 * @param {number} deviceId - L'id del device
 * @param {object} ctx - Il context React (deve contenere tags, vars, fields, types)
 * @param {string|number} alarmTypeNameOrId - Nome o id del type che identifica un Alarm (default: 'Alarm')
 * @returns {Array} Array di oggetti tag che sono allarmi
 */
function getDeviceAlarms(
  deviceId: number,
  ctx: AdminContext,
  alarmTypeNameOrId: string | number = 'Alarm'
): DBTag[] {
  if (!ctx?.tags || !ctx?.vars || !ctx?.fields || !ctx?.types) return [];
  return ctx.tags.filter((tag) => {
    if (tag.device !== deviceId) return false;
    let typeId: number | undefined;
    if (tag.type_field !== null && tag.type_field !== undefined) {
      // Aggregato: risali al field
      const field = ctx.fields.find((f) => f.id === tag.type_field);
      typeId = field?.type;
    } else {
      // Non aggregato: risali alla var
      const parentVar = ctx.vars.find((v) => v.id === tag.var);
      typeId = parentVar?.type;
    }
    if (!typeId) return false;
    const typeObj = ctx.types.find((t) => t.id === typeId); // || t.name === typeId);
    if (!typeObj) return false;
    return (
      typeObj.name === alarmTypeNameOrId || typeObj.id === alarmTypeNameOrId
    );
  });
}
