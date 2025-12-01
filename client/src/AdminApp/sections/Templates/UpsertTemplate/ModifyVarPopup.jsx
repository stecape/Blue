import { useState, useEffect, useContext } from 'react';
import { Button } from '@react-md/button';
import { Dialog, DialogContent, DialogFooter } from '@react-md/dialog';
import { Typography } from '@react-md/typography';
import { Form, TextField, FormThemeProvider, Select } from '@react-md/form';
import { ctxData } from '../../../Helpers/CtxProvider';

function ModifyVarPopup(props) {
  const ctx = useContext(ctxData);
  const [modalState, setModalState] = useState({
    visible: false,
    name: '',
    modalType: props.modalType,
    type: 0,
    um: 0,
    logic_state: 0,
    comment: '',
    fixed_id: 0,
    varNameNotValid: false,
    fixedIdError: false,
  });

  // Input Validation
  const InlineValidation = (value) => {
    let pattern = /[^A-Za-z0-9_]|^[^A-Za-z_]/;
    setModalState((prevState) => ({
      ...prevState,
      name: value,
      varNameNotValid:
        pattern.test(value) ||
        props.vars.find((i) => i.name === value && i.QRef !== props.QRef) ||
        value === '',
    }));
  };

  // Live fixed_id validation
  const InlineFixedIdValidation = (value) => {
    const intVal = parseInt(value, 10);
    const isDuplicate = props.vars.some(
      (i) => Number(i.fixed_id) === intVal && i.QRef !== props.QRef,
    );
    const notValid =
      value === '' || isNaN(intVal) || intVal < 1 || intVal > 48 || isDuplicate;
    setModalState((prevState) => ({
      ...prevState,
      fixed_id: value,
      fixedIdError: notValid,
    }));
  };

  //Form Events
  const handleSubmit = (event) => {
    event.preventDefault();
    // Validazione fixed_id. Non possono partire da zero, altrimenti ci sono degli alias sulla prima tag (che avrebbe tutti zeri su tutti i livelli)
    const intVal = parseInt(modalState.fixed_id, 10);
    const isDuplicate = props.vars.some(
      (i) => Number(i.fixed_id) === intVal && i.QRef !== props.QRef,
    );
    const notValid =
      modalState.fixed_id === '' ||
      isNaN(intVal) ||
      intVal < 0 ||
      intVal > 48 ||
      isDuplicate;
    setModalState((prevState) => ({ ...prevState, fixedIdError: notValid }));
    if (notValid) return;
    props.updVar({
      name: modalState.name,
      type: modalState.type,
      um: modalState.um,
      logic_state: modalState.logic_state,
      comment: modalState.comment,
      fixed_id: modalState.fixed_id,
    });
  };

  const handleReset = (event) => {
    event.preventDefault();
    props.cancelCommand();
  };

  useEffect(() => {
    setModalState((prevState) => ({
      ...prevState,
      name: props.name,
      type: props.type,
      um: props.um,
      logic_state: props.logic_state,
      comment: props.comment,
      fixed_id: props.fixed_id,
      visible: props.visible,
    }));
  }, [
    props.name,
    props.visible,
    props.type,
    props.um,
    props.logic_state,
    props.comment,
    props.fixed_id,
  ]);

  return (
    <Dialog
      id="upsert-var-dialog"
      role="alertdialog"
      type={modalState.modalType}
      visible={modalState.visible}
      onRequestClose={props.cancelCommand}
      aria-labelledby="dialog-title"
    >
      <FormThemeProvider theme="outline">
        <Form onSubmit={handleSubmit} onReset={handleReset}>
          <DialogContent>
            <Typography
              id="dialog-title"
              type="subtitle-1"
              margin="none"
              color="secondary"
            >
              Modifying {modalState.name}:
            </Typography>
            <TextField
              id="fixed-id"
              key="fixed-id"
              type="number"
              label="Fixed ID"
              value={
                modalState.fixed_id !== null &&
                modalState.fixed_id !== undefined
                  ? modalState.fixed_id
                  : ''
              }
              onChange={(e) => InlineFixedIdValidation(e.target.value)}
              min={1}
              max={48}
              error={modalState.fixedIdError}
              helpertext={
                modalState.fixedIdError
                  ? 'ID obbligatorio, intero tra 1 e 48, unico'
                  : ''
              }
            />
            <TextField
              id="name"
              key="name"
              type="string"
              label="Var Name"
              value={
                modalState.name !== null && modalState.name !== undefined
                  ? modalState.name
                  : ''
              }
              onChange={(e) => InlineValidation(e.target.value)}
              error={modalState.varNameNotValid}
            />
            <Select
              id="type"
              key="type"
              options={ctx.types.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              value={
                modalState.type !== null && modalState.type !== undefined
                  ? modalState.type.toString()
                  : '0'
              }
              label="Type"
              onChange={(value) =>
                setModalState((prevState) => ({
                  ...prevState,
                  type: Number(value),
                }))
              }
            />
            <Select
              id="um"
              key="um"
              options={ctx.ums.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              value={
                modalState.um !== null && modalState.um !== undefined
                  ? modalState.um.toString()
                  : '0'
              }
              placeholder="Choose..."
              label="um"
              onChange={(value) =>
                setModalState((prevState) => ({
                  ...prevState,
                  um: Number(value),
                }))
              }
            />
            <Select
              id="logic_state"
              key="logic_state"
              options={ctx.logicStates.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              value={
                modalState.logic_state !== null &&
                modalState.logic_state !== undefined
                  ? modalState.logic_state.toString()
                  : '0'
              }
              placeholder="Choose..."
              label="Logic state"
              onChange={(value) =>
                setModalState((prevState) => ({
                  ...prevState,
                  logic_state: Number(value),
                }))
              }
            />
            <TextField
              id="comment"
              key="comment"
              type="string"
              label="Var Comment"
              value={
                modalState.comment !== null && modalState.comment !== undefined
                  ? modalState.comment
                  : ''
              }
              onChange={(e) =>
                setModalState((prevState) => ({
                  ...prevState,
                  comment: e.target.value,
                }))
              }
            />
          </DialogContent>
          <DialogFooter>
            <Button type="reset" id="dialog-cancel">
              Cancel
            </Button>
            <Button
              type="submit"
              id="dialog-modify"
              theme="primary"
              disabled={
                modalState.varNameNotValid || modalState.name.length === 0
              }
            >
              Save
            </Button>
          </DialogFooter>
        </Form>
      </FormThemeProvider>
    </Dialog>
  );
}
export default ModifyVarPopup;
