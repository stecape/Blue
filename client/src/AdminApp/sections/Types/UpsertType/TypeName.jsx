import { useState, useContext } from "react"
import { useAddMessage } from "@react-md/alert"
import { Button } from '@react-md/button'
import {
  Form,
  TextField,
  FormThemeProvider
} from '@react-md/form'
import {ctxData} from "../../../Helpers/CtxProvider"
import { UpsertTypeContext } from './UpsertTypeContext'
import formStyles from '../../../styles/Form.module.scss'

function TypeName (props) {
  const ctx = useContext(ctxData)
  const addMessage = useAddMessage()
  const {upsertType, setUpsertType} = useContext(UpsertTypeContext)
  const [prevName, setPrevName] = useState(upsertType.name)


  //Input Validation
  const InlineValidation = (value) => {
    let pattern = /[^A-Za-z0-9_]|^[^A-Za-z_]/
    const isPatternInvalid = pattern.test(value)
    setUpsertType((prevState) => ({...prevState, name: value, typeNameNotValid: isPatternInvalid || ctx.types.find(i => i.name === value && i.id !== upsertType.type) || value === ""}))
  }


  //Form Events
  const handleSubmit = (event) => {
    event.preventDefault()
    //si chiama una promise in arrivo dalle props. La funzione deve eseguire la query di creazione, sul then poi bisogna resettare il form
    return props.upsertType()
    .then(()=>{
      addMessage({children: "Type updated or inserted"})
    })
    .catch(error => {
      if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      addMessage({children: "Error: " + error.response.data.message})
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        addMessage({children: "Error: database not reachable"})
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        addMessage({children: "Error: wrong request parameters"})
        console.log('Error', error.message);
      }
      console.log(error.config);
    })
    .finally(handleReset)
  }

  const handleReset = () => {
    props.reset()
  }

  return(
    <div className={formStyles.container}>
    <FormThemeProvider theme='outline'>
      <Form className={formStyles.form} onSubmit={handleSubmit}  onReset={handleReset}>
        <TextField
          id='name'
          key='name'
          type='string'
          label="Type Name"
          className={formStyles.item}
          value={upsertType.name}
          onChange={(e) => InlineValidation(e.target.value)}
          onBlur={(e) => {
            if (prevName !== upsertType.name && !upsertType.typeNameNotValid) {
              upsertType.create ? 
              setUpsertType((prevState) => ({...prevState, typeNameQuery: `INSERT INTO "Type" (id, name, base_type, locked) VALUES (DEFAULT, '${upsertType.name}', false, false) RETURNING id INTO typeId;`})) :
              setUpsertType((prevState) => ({...prevState, typeNameQuery: `UPDATE "Type" SET name='${upsertType.name}' WHERE id = ${upsertType.type} RETURNING id INTO typeId;`}))
              setPrevName(upsertType.name)
            }
          }}
          error={upsertType.typeNameNotValid}
        />
        <div className={formStyles.btn_container}>
          <Button
            type="submit"
            theme="primary"
            themeType="outline"
            className={formStyles.btn}
            disabled={upsertType.typeNameNotValid || upsertType.fields.length === 0}
          >
            Save Type
          </Button>
          <Button
            type="reset"
            themeType="outline"
            className={formStyles.btn}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </FormThemeProvider>
    </div>
  )}
export default TypeName