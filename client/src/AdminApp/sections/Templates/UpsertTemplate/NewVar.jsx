import { useState, useContext } from 'react';
import { Button } from '@react-md/button';
import { Form, TextField, FormThemeProvider, Select } from '@react-md/form';
import { ctxData } from '../../../Helpers/CtxProvider';
import { UpsertTemplateContext } from './UpsertTemplateContext';
import formStyles from '../../../styles/Form.module.scss';

function NewVar() {
  const ctx = useContext(ctxData);
  const { upsertTemplate, setUpsertTemplate } = useContext(
    UpsertTemplateContext,
  );
  const [fixedId, setFixedId] = useState('');
  const [fixedIdError, setFixedIdError] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState(0);
  const [um, setUm] = useState(0);
  const [logic_state, setLogicState] = useState(0);
  const [comment, setComment] = useState('');

  // Validazione fixed_id. Non possono partire da zero, altrimenti ci sono degli alias sulla prima tag (che avrebbe tutti zeri su tutti i livelli)
  const validateFixedId = (value) => {
    const intVal = parseInt(value, 10);
    const isDuplicate = upsertTemplate.vars.some((i) => i.fixed_id === value);
    const notValid =
      value === '' || isNaN(intVal) || intVal < 1 || intVal > 48 || isDuplicate;
    setFixedIdError(notValid);
    return !notValid;
  };

  const handleFixedIdChange = (e) => {
    setFixedId(e.target.value);
    validateFixedId(e.target.value);
  };

  //Input Validation
  const InlineNameValidation = (value) => {
    setName(value);
    let pattern = /[^A-Za-z0-9_]|^[^A-Za-z_]/;
    const isPatternInvalid = pattern.test(value);
    setUpsertTemplate((prevState) => ({
      ...prevState,
      varNameNotValid:
        isPatternInvalid ||
        upsertTemplate.vars.find((i) => i.name === value) ||
        value === '',
    }));
  };
  const InlineTypeValidation = (value) => {
    setType(Number(value));
    setUpsertTemplate((prevState) => ({
      ...prevState,
      varTypeNotValid: value === 0,
    }));
  };

  //Form Events
  const handleSubmit = (event) => {
    event.preventDefault();
    let pattern = /[^A-Za-z0-9_]|^[^A-Za-z_]/;
    var varNameNotValid =
      pattern.test(name) ||
      upsertTemplate.vars.find((i) => i.name === name) ||
      name === '';
    var varTypeNotValid = type === 0;
    setUpsertTemplate((prevState) => ({
      ...prevState,
      varNameNotValid: varNameNotValid,
      varTypeNotValid: varTypeNotValid,
    }));
    if (!varNameNotValid && !varTypeNotValid && validateFixedId(fixedId)) {
      var QRef = Date.now();
      setUpsertTemplate(
        (prevState) => ({
          ...prevState,
          vars: [
            ...upsertTemplate.vars,
            {
              type: type,
              template: upsertTemplate.template,
              name: name,
              um: um,
              logic_state: logic_state,
              comment: comment,
              fixed_id: fixedId,
              QRef: QRef,
            },
          ],
          insertQuery: [
            ...upsertTemplate.insertQuery,
            {
              query: `INSERT into "Var" (id, name, template, type, um, logic_state, comment, fixed_id) VALUES (DEFAULT, '${name}', templateId, ${type}, ${um !== 0 ? um : 'NULL'}, ${logic_state !== 0 ? logic_state : 'NULL'}, ${comment !== '' ? `'${comment}'` : 'NULL'}, ${fixedId !== '' ? fixedId : 'NULL'});`,
              QRef: QRef,
            },
          ],
        }),
        handleReset(),
      );
    }
  };

  //Form Events
  const handleReset = () => {
    setName('');
    setType(0);
    setUm(0);
    setLogicState(0);
    setComment('');
    setFixedId('');
    setFixedIdError(false);
  };

  return (
    <div className={formStyles.container}>
      <FormThemeProvider theme="outline">
        <Form className={formStyles.form} onSubmit={handleSubmit}>
          <TextField
            id="fixed-id"
            key="fixed-id"
            type="number"
            label="Fixed ID"
            className={formStyles.item}
            value={fixedId}
            min={1}
            max={48}
            onChange={handleFixedIdChange}
            error={fixedIdError}
            helpertext={
              fixedIdError ? 'ID obbligatorio, intero tra 1 e 48, unico' : ''
            }
          />
          <TextField
            id="var-name"
            key="var-name"
            type="string"
            label="Var Name"
            className={formStyles.item}
            value={name}
            onChange={(e) => InlineNameValidation(e.target.value)}
            error={upsertTemplate.varNameNotValid}
          />
          <Select
            id="var-type1"
            key="var-type1"
            options={ctx.types.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
            value={type.toString()}
            placeholder="Choose..."
            label="Var Type"
            className={formStyles.item}
            autoComplete="both"
            onChange={(value) => InlineTypeValidation(value)}
            error={upsertTemplate.varTypeNotValid}
          />
          <Select
            id="var-um"
            key="var-um"
            options={ctx.ums.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
            value={um.toString()}
            placeholder="Choose..."
            label="Var um"
            className={formStyles.item}
            autoComplete="both"
            onChange={(value) => setUm(Number(value))}
          />
          <Select
            id="var-logic_state"
            key="var-logic_state"
            options={ctx.logicStates.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
            value={logic_state.toString()}
            placeholder="Choose..."
            label="Var logic state"
            className={formStyles.item}
            autoComplete="both"
            onChange={(value) => setLogicState(Number(value))}
          />
          <TextField
            id="var-comment"
            key="var-comment"
            type="string"
            label="Var Comment"
            className={formStyles.item}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className={formStyles.btn_container}>
            <Button
              type="submit"
              theme="primary"
              themeType="outline"
              className={formStyles.btn}
              disabled={
                upsertTemplate.varNameNotValid || upsertTemplate.varTypeNotValid
              }
            >
              Add
            </Button>
          </div>
        </Form>
      </FormThemeProvider>
    </div>
  );
}
export default NewVar;
