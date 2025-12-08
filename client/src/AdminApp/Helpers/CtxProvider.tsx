import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useMemo,
} from 'react';
import { useAddMessage } from '@react-md/alert';
import { SocketContext } from './socket';
import axios from 'axios';
import { getApiUrl } from './config';
import { DBType, DBField, DBVar, DBUser, DBDevice, DBLogicState, DBTag, DBTemplate, DBUm, GetAllResponse, BackendStatus, BackendStatusResponse, GetAllControlsResult, GetAllControlsResponse, AdminContext, DBNotifyPayload } from 'shared/types';

// Usa la variabile d'ambiente per configurare l'URL del server

export const ctxData = createContext<AdminContext | null>(null);

export const CtxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const serverIp = getApiUrl();
  const addMessage = useAddMessage();
  const socket = useContext(SocketContext);
  const [types, setTypes] = useState<DBType[]>([]);
  const [fields, setFields] = useState<DBField[]>([]);
  const [ums, setUms] = useState<DBUm[]>([]);
  const [logicStates, setLogicStates] = useState<DBLogicState[]>([]);
  const [vars, setVars] = useState<DBVar[]>([]);
  const [tags, setTags] = useState<DBTag[]>([]);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    backendConnected: socket !== null && socket.connected,
    dbConnected: false,
    mqttConnected: false,
  });
  const [init, setInit] = useState(false);
  const [users, setUsers] = useState<DBUser[]>([]);
  const [devices, setDevices] = useState<DBDevice[]>([]);
  const [templates, setTemplates] = useState<DBTemplate[]>([]);
  const [controls, setControls] = useState<GetAllControlsResult>({}); //array di oggetti. Ogni oggetto conterrà le tagId appartenenti ad un certo data type
  useEffect(() => {
    const getAllControls = async () => {
      try {
        const response: GetAllControlsResponse = await axios.post(`${serverIp}/api/getAllControls`);
        setControls(response.result);
        addMessage({ children: response.message });
      } catch (error) {
        console.log(error);
      }
    };

    const retrieveData = async () => {
      if (socket !== null && socket.connected) {
        try {
          const requests = [
            axios.post<GetAllResponse<DBType>>(`${serverIp}/api/getAll`, { table: 'Type' }),
            axios.post<GetAllResponse<DBField>>(`${serverIp}/api/getAll`, { table: 'Field' }),
            axios.post<GetAllResponse<DBUm>>(`${serverIp}/api/getAll`, { table: 'um' }),
            axios.post<GetAllResponse<DBLogicState>>(`${serverIp}/api/getAll`, { table: 'LogicState' }),
            axios.post<GetAllResponse<DBVar>>(`${serverIp}/api/getAll`, { table: 'Var' }),
            axios.post<GetAllResponse<DBTag>>(`${serverIp}/api/getAll`, { table: 'Tag' }),
            axios.post<GetAllResponse<DBUser>>(`${serverIp}/api/getAll`, { table: 'User' }),
            axios.post<GetAllResponse<DBDevice>>(`${serverIp}/api/getAll`, { table: 'Device' }),
            axios.post<GetAllResponse<DBTemplate>>(`${serverIp}/api/getAll`, { table: 'Template' }),
            axios.post<GetAllControlsResponse>(`${serverIp}/api/getAllControls`),
            axios.post<BackendStatusResponse>(`${serverIp}/api/getBackendStatus`),
          ] as const; // Utilizziamo 'as const' per dire a TypeScript che questo array è una tupla di richieste con tipi precisi e ordine fisso.
                      // In questo modo, quando usiamo Promise.all, TypeScript saprà associare a ciascun elemento dell'array di risposte il tipo corretto.
                      // Senza 'as const', TypeScript considererebbe l'array come AxiosPromise<any>[], perdendo la corrispondenza tra indice e tipo di risposta.
          
          const responses = await Promise.all(requests);

          setTypes(responses[0].data.result);
          addMessage({ children: responses[0].data.message });

          setFields(responses[1].data.result);
          addMessage({ children: responses[1].data.message });

          setUms(responses[2].data.result);
          addMessage({ children: responses[2].data.message });

          setLogicStates(responses[3].data.result);
          addMessage({ children: responses[3].data.message });

          setVars(responses[4].data.result);
          addMessage({ children: responses[4].data.message });

          setTags(responses[5].data.result);
          addMessage({ children: responses[5].data.message });

          setUsers(responses[6].data.result);
          addMessage({ children: responses[6].data.message });

          setDevices(responses[7].data.result);
          addMessage({ children: responses[7].data.message });

          setTemplates(responses[8].data.result);
          addMessage({ children: responses[8].data.message });

          setControls(responses[9].data.result);
          addMessage({ children: responses[9].data.message });

          setBackendStatus((prevStatus) => ({
            ...prevStatus,
            backendConnected: socket.connected,
            dbConnected: responses[10].data.result.dbConnected,
            mqttConnected: responses[10].data.result.mqttConnected,
          }));
          addMessage({ children: responses[10].data.message });

          setInit(true);
        } catch (error) {
          console.log('error while retrieving data: ', error);
          setInit(false);
        }
      } else {
        console.log('socket not connected');
        setInit(false);
      }
    };

    const on_connect = () => {
      console.log('socket connected');
      setBackendStatus((prevStatus) => ({
        ...prevStatus,
        backendConnected: socket !== null && socket.connected,
      }));
      retrieveData();
    };

    const on_error = (err: Error) => {
      console.log('socket error:', err);
      setBackendStatus((prevStatus) => ({
        ...prevStatus,
        backendConnected: socket !== null && socket.connected,
      }));
    };

    const on_connect_error = (err: Error) => {
      console.log('socket connect error:', err);
      setBackendStatus((prevStatus) => ({
        ...prevStatus,
        backendConnected: socket !== null && socket.connected,
      }));
    };

    const on_update = async (value: DBNotifyPayload) => {

      switch (value.table) {
        //Type
        case 'Type':
          switch (value.operation) {
            case 'INSERT':
              setTypes((prevTypes) => [...prevTypes, value.data]);
              break;

            case 'DELETE':
              setTypes((prevTypes) => [
                ...prevTypes.filter((i) => i.id !== value.data.id),
              ]);
              break;

            case 'TRUNCATE':
              setTypes(() => [...[]]);
              break;

            case 'UPDATE':
              setTypes((prevTypes) => [
                ...prevTypes.map((i) => {
                  return i.id === value.data.id ? value.data : i;
                }),
              ]);
              break;

            default:
              break;
          }
          break;

        //Field
        case 'Field':
          switch (value.operation) {
            case 'INSERT':
              setFields((prevFields) => [...prevFields, value.data]);
              break;

            case 'DELETE':
              setFields((prevFields) => [
                ...prevFields.filter((i) => i.id !== value.data.id),
              ]);
              break;

            case 'TRUNCATE':
              setFields(() => [...[]]);
              break;

            case 'UPDATE':
              setFields((prevFields) => [
                ...prevFields.map((i) => {
                  return i.id === value.data.id ? value.data : i;
                }),
              ]);
              break;

            default:
              break;
          }
          break;

        //um
        case 'um':
          switch (value.operation) {
            case 'INSERT':
              setUms((prevUms) => [...prevUms, value.data]);
              break;

            case 'DELETE':
              setUms((prevUms) => [
                ...prevUms.filter((i) => i.id !== value.data.id),
              ]);
              break;

            case 'TRUNCATE':
              setUms(() => [...[]]);
              break;

            case 'UPDATE':
              setUms((prevUms) => [
                ...prevUms.map((i) => {
                  return i.id === value.data.id ? value.data : i;
                }),
              ]);
              break;

            default:
              break;
          }
          break;

        //LogicState
        case 'LogicState':
          switch (value.operation) {
            case 'INSERT':
              setLogicStates((prevLogicStates) => [
                ...prevLogicStates,
                value.data,
              ]);
              break;

            case 'DELETE':
              setLogicStates((prevLogicStates) => [
                ...prevLogicStates.filter((i) => i.id !== value.data.id),
              ]);
              break;

            case 'TRUNCATE':
              setLogicStates(() => [...[]]);
              break;

            case 'UPDATE':
              setLogicStates((prevLogicStates) => [
                ...prevLogicStates.map((i) => {
                  return i.id === value.data.id ? value.data : i;
                }),
              ]);
              break;

            default:
              break;
          }
          break;

        //Vars
        case 'Var':
          switch (value.operation) {
            case 'INSERT':
              setVars((prevVars) => [...prevVars, value.data]);
              break;

            case 'DELETE':
              setVars((prevVars) => [
                ...prevVars.filter((i) => i.id !== value.data.id),
              ]);
              break;

            case 'TRUNCATE':
              setVars(() => [...[]]);
              break;

            case 'UPDATE':
              setVars((prevVars) => [
                ...prevVars.map((i) => {
                  return i.id === value.data.id ? value.data : i;
                }),
              ]);
              break;

            default:
              break;
          }
          break;

        //Tags
        case 'Tag':
          switch (value.operation) {
            case 'INSERT':
              setTags((prevTags) => [...prevTags, value.data]);
              break;

            case 'DELETE':
              setTags((prevTags) => [
                ...prevTags.filter((i) => i.id !== value.data.id),
              ]);
              break;

            case 'TRUNCATE':
              setTags(() => [...[]]);
              break;

            case 'UPDATE':
              setTags((prevTags) => [
                ...prevTags.map((i) => {
                  return i.id === value.data.id ? value.data : i;
                }),
              ]);
              break;

            default:
              break;
          }
          break;

        //Users
        case 'User':
          switch (value.operation) {
            case 'INSERT':
              setUsers((prevUsers) => [...prevUsers, value.data]);
              break;

            case 'DELETE':
              setUsers((prevUsers) => [
                ...prevUsers.filter((i) => i.id !== value.data.id),
              ]);
              break;

            case 'TRUNCATE':
              setUsers(() => [...[]]);
              break;

            case 'UPDATE':
              setUsers((prevUsers) => [
                ...prevUsers.map((i) => {
                  return i.id === value.data.id ? value.data : i;
                }),
              ]);
              break;

            default:
              break;
          }
          break;

        //Devices
        case 'Device':
          switch (value.operation) {
            case 'INSERT':
              setDevices((prevDevices) => [...prevDevices, value.data]);
              break;

            case 'DELETE':
              setDevices((prevDevices) => [
                ...prevDevices.filter((i) => i.id !== value.data.id),
              ]);
              break;

            case 'TRUNCATE':
              setDevices(() => [...[]]);
              break;

            case 'UPDATE':
              setDevices((prevDevices) => [
                ...prevDevices.map((i) => {
                  return i.id === value.data.id ? value.data : i;
                }),
              ]);
              break;

            default:
              break;
          }
          break;

        //Template
        case 'Template':
          switch (value.operation) {
            case 'INSERT':
              setTemplates((prevTemplates) => [...prevTemplates, value.data]);
              break;

            case 'DELETE':
              setTemplates((prevTemplates) => [
                ...prevTemplates.filter((i) => i.id !== value.data.id),
              ]);
              break;

            case 'TRUNCATE':
              setTemplates(() => [...[]]);
              break;

            case 'UPDATE':
              setTemplates((prevTemplates) => [
                ...prevTemplates.map((i) => {
                  return i.id === value.data.id ? value.data : i;
                }),
              ]);
              break;

            default:
              break;
          }
          break;

        default:
          break;
      }

      // Fetch updated controls
      if (value.table !== 'Tag') {
        getAllControls();
      }
    };

    const on_close = (err: Error) => {
      console.log('socket closed:', err);
      setBackendStatus((prevStatus) => ({
        ...prevStatus,
        backendConnected: socket !== null && socket.connected,
      }));
    };

    const on_db_connected = () => {
      console.log('Web Socket event received: dbConnected');
      setBackendStatus((prevStatus) => ({
        ...prevStatus,
        backendConnected: socket !== null && socket.connected,
        dbConnected: true,
      }));
      retrieveData();
    };

    const on_db_disconnected = () => {
      console.log('Web Socket event received: dbDisconnected');
      setBackendStatus((prevStatus) => ({
        ...prevStatus,
        backendConnected: socket !== null && socket.connected,
        dbConnected: false,
      }));
    };

    const on_mqtt_connected = () => {
      console.log('Web Socket event received: mqttConnected');
      setBackendStatus((prevStatus) => ({
        ...prevStatus,
        backendConnected: socket !== null && socket.connected,
        mqttConnected: true,
      }));
    };

    const on_mqtt_disconnected = () => {
      console.log('Web Socket event received: mqttDisconnected');
      setBackendStatus((prevStatus) => ({
        ...prevStatus,
        backendConnected: socket !== null && socket.connected,
        mqttConnected: false,
      }));
    };

    //On component load request the lists
    if (init === false) {
      retrieveData();
    }

    //On (re)connection request the lists
    if (socket) {
      socket.on('connect', on_connect);

      //Connect arror logging
      socket.on('connect_error', on_connect_error);

      //Error logging
      socket.on('error', on_error);

      //on update
      socket.on('update', on_update);

      //on close
      socket.on('close', on_close);

      //on dbConnected
      socket.on('dbConnected', on_db_connected);

      //on dbDisconnected
      socket.on('dbDisconnected', on_db_disconnected);

      //on mqttConnected
      socket.on('mqttConnected', on_mqtt_connected);

      //on mqttDisconnected
      socket.on('mqttDisconnected', on_mqtt_disconnected);
    }

    //dismantling listeners
    return () => {
      if (socket) {
        socket.off('connect', on_connect);
        socket.off('connect_error', on_connect_error);
        socket.off('error', on_error);
        socket.off('update', on_update);
        socket.off('close', on_close);
        socket.off('dbConnected', on_db_connected);
        socket.off('dbDisconnected', on_db_disconnected);
        socket.off('mqttConnected', on_mqtt_connected);
        socket.off('mqttDisconnected', on_mqtt_disconnected);
      }
    };
  }, [
    serverIp,
    addMessage,
    init,
    backendStatus,
    logicStates,
    socket,
    types,
    fields,
    ums,
    vars,
    tags,
    users,
    devices,
    templates,
    controls,
  ]);

  const value: AdminContext = useMemo(
    () => ({
      types,
      fields,
      ums,
      logicStates,
      vars,
      tags,
      users,
      devices,
      templates,
      controls,
      backendStatus,
      init,
      setTypes,
      setFields,
      setUms,
      setLogicStates,
      setVars,
      setTags,
      setUsers,
      setDevices,
      setTemplates,
      setControls,
      setBackendStatus,
      setInit,
    }),
    [
      types,
      fields,
      ums,
      logicStates,
      vars,
      tags,
      users,
      devices,
      templates,
      controls,
      backendStatus,
      init,
    ]
  );

  return <ctxData.Provider value={value}>{children}</ctxData.Provider>;
};
