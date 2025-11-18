import { useState, useContext } from "react"
import { Button } from '@react-md/button'
import {
  Form,
  TextField,
  FormThemeProvider,
  Select
} from '@react-md/form'
import {ctxData} from "../../../Helpers/CtxProvider"
import { UpsertTypeContext } from './UpsertTypeContext'
import formStyles from '../../../styles/Form.module.scss'


function NewField () {
  const ctx = useContext(ctxData)
  const {upsertType, setUpsertType} = useContext(UpsertTypeContext)
  const [name, setName] = useState("")
  const [type, setType] = useState(0)
  const [um, setUm] = useState(0)
  const [logic_state, setLogicState] = useState(0)
  const [comment, setComment] = useState('')

  //Input Validation
  const InlineNameValidation = (value) => {
    setName(value)
    let pattern = /[^A-Za-z0-9_]|^[^A-Za-z_]/
    const isPatternInvalid = pattern.test(value)
    setUpsertType((prevState) => ({
      ...prevState, 
      fieldNameNotValid: isPatternInvalid || upsertType.fields.find(i => i.name === value) || value === ""
    }))
  }
  const InlineTypeValidation = (value) => {
    setType(Number(value))
    setUpsertType((prevState) => ({
      ...prevState, 
      fieldTypeNotValid: value === 0
    }))
  }

  //Form Events
  const handleSubmit = (event) => {
    event.preventDefault()
    //it begins validating the input and then, if both type and name are valid, it proceed with the insert of the field and of the query
    let pattern = /[^A-Za-z0-9_]|^[^A-Za-z_]/
    var fieldNameNotValid = pattern.test(name) || upsertType.fields.find(i => i.name === name) || name === ""
    var fieldTypeNotValid = type === 0
    setUpsertType((prevState) => ({
      ...prevState, 
      fieldNameNotValid: fieldNameNotValid,
      fieldTypeNotValid: fieldTypeNotValid
    }))
    if (!fieldNameNotValid && !fieldTypeNotValid){
      var QRef = Date.now()
      setUpsertType((prevState) => ({
        ...prevState, 
        fields: [...upsertType.fields, { type: type, name: name, um: um, logic_state: logic_state, comment: comment, QRef: QRef }],
        insertQuery: [...upsertType.insertQuery, {query: `INSERT into "Field" (id, name, type, um, logic_state, comment, parent_type) VALUES (DEFAULT, '${name}', ${type}, ${um !== 0 ? um : 'NULL'}, ${logic_state !== 0 ? logic_state : 'NULL'}, ${comment !== null ? `'${comment}'` : ''}, typeId);`, QRef: QRef}]}), handleReset()
      )
    }
  }

  //Form Events
  const handleReset = () => {
    setName("")
    setType(0)
    setUm(0)
    setLogicState(0)
    setComment('')
  }
  
  return(
    <div className={formStyles.container}>
    <FormThemeProvider theme='outline'>
      <Form className={formStyles.form} onSubmit={handleSubmit}>
        <TextField
          id='field-name'
          key='field-name'
          type='string'
          label="Field Name"
          className={formStyles.item}
          value={name}
          onChange={(e) => InlineNameValidation(e.target.value)}
          error={upsertType.fieldNameNotValid}
        />
        <Select
          id='field-type1'
          key='field-type1'
          options={upsertType.typesList.map((item) => ({
            label: item.name,
            value: item.id
          }))}
          value={type.toString()}
          placeholder="Choose..."
          label="Field Type"
          className={formStyles.item}
          autoComplete="both"
          onChange={(value) => InlineTypeValidation(value)}
          error={upsertType.fieldTypeNotValid}
        />
        <Select
          id='field-um'
          key='field-um'
          options= {ctx.ums.map((item) => ({
            label: item.name,
            value: item.id
          }))}
          value={um.toString()}
          placeholder="Choose..."
          label="Field um"
          className={formStyles.item}
          autoComplete="both"
          onChange={(value) => setUm(Number(value))}
        />
        <Select
          id='field-logic_state'
          key='field-logic_state'
          options= {ctx.logicStates.map((item) => ({
            label: item.name,
            value: item.id
          }))}
          value={logic_state.toString()}
          placeholder="Choose..."
          label="Field logic state"
          className={formStyles.item}
          autoComplete="both"
          onChange={(value) => setLogicState(Number(value))}
        />
        <TextField
          id='field-comment'
          key='field-comment'
          type='string'
          label="Field Comment"
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
            disabled={upsertType.fieldNameNotValid || upsertType.fieldTypeNotValid}
          >
            Add
          </Button>
        </div>
      </Form>
    </FormThemeProvider>
    </div>
  )}
export default NewField