import { useState, useContext } from 'react';
import { Button } from '@react-md/button';
import DeleteUserPopup from './DeleteUserPopup';
import UpsertUserPopup from './UpsertUserPopup';
import { DeleteFontIcon, EditFontIcon } from '@react-md/material-icons';
import { getApiUrl } from '../../Helpers/config';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableContainer,
} from '@react-md/table';
import axios from 'axios';
import { ctxData } from '../../Helpers/CtxProvider';
import tableStyles from '../../styles/Table.module.scss';

function UsersList() {
  const serverIp = getApiUrl();
  const ctx = useContext(ctxData);
  const [deletePopup, setDeletePopup] = useState({
    visible: false,
    id: 0,
    name: '',
    email: '',
  });
  const [modifyUserPopup, setModifyUserPopup] = useState({
    visible: false,
    id: 0,
    name: '',
    email: '',
    role: '',
  });

  return (
    <>
      <TableContainer>
        <Table fullWidth className={tableStyles.table}>
          <TableHeader>
            <TableRow>
              <TableCell hAlign="left" grow>
                Name
              </TableCell>
              <TableCell hAlign="left">Email</TableCell>
              <TableCell hAlign="left">Role</TableCell>
              <TableCell hAlign="center">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ctx.users.map((item) => {
              return (
                <TableRow key={item.id}>
                  <TableCell className={tableStyles.cell} hAlign="left">
                    {item.name}
                  </TableCell>
                  <TableCell className={tableStyles.cell} hAlign="left">
                    {item.email}
                  </TableCell>
                  <TableCell className={tableStyles.cell} hAlign="left">
                    {item.role}
                  </TableCell>
                  <TableCell className={tableStyles.cell}>
                    <Button
                      buttonType="icon"
                      theme="error"
                      aria-label="Permanently Delete"
                      onClick={() =>
                        setDeletePopup({
                          visible: true,
                          id: item.id,
                          name: item.name,
                          email: item.email,
                        })
                      }
                    >
                      <DeleteFontIcon />
                    </Button>
                    <Button
                      buttonType="icon"
                      aria-label="Edit"
                      onClick={() =>
                        setModifyUserPopup({
                          visible: true,
                          id: item.id,
                          name: item.name,
                          email: item.email,
                          role: item.role,
                        })
                      }
                    >
                      <EditFontIcon />
                    </Button>
                  </TableCell>
                  <TableCell />
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <DeleteUserPopup
        visible={deletePopup.visible}
        name={deletePopup.name}
        email={deletePopup.email}
        delUser={() => {
          axios
            .post(`${serverIp}/api/removeUser`, { id: deletePopup.id })
            .then(
              setDeletePopup((prevState) => ({ ...prevState, visible: false })),
            );
        }}
        cancelCommand={() => {
          setDeletePopup((prevState) => ({ ...prevState, visible: false }));
        }}
      />
      <UpsertUserPopup
        visible={modifyUserPopup.visible}
        name={modifyUserPopup.name}
        email={modifyUserPopup.email}
        role={modifyUserPopup.role}
        modalType="full-page"
        upsertUser={(data) => {
          axios
            .post(`${serverIp}/api/modifyUser`, {
              ...data,
              id: modifyUserPopup.id,
            })
            .then(
              setModifyUserPopup((prevState) => ({
                ...prevState,
                visible: false,
              })),
            );
        }}
        cancelCommand={() => {
          setModifyUserPopup((prevState) => ({ ...prevState, visible: false }));
        }}
      />
    </>
  );
}
export default UsersList;
