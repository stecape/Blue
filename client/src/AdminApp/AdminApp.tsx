import { BrowserRouter } from 'react-router-dom';
import { Configuration } from '@react-md/layout';
import { SocketContext, socket } from './Helpers/socket';
import { CtxProvider } from './Helpers/CtxProvider';
import Layout from './Layout';

function AdminApp() {
  return (
    <SocketContext.Provider value={socket}>
      <CtxProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Configuration>
            <Layout />
          </Configuration>
        </BrowserRouter>
      </CtxProvider>
    </SocketContext.Provider>
  );
}
export default AdminApp;
