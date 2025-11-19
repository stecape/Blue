import { useState, useEffect } from "react"
import { AppBar, AppBarTitle, AppBarNav } from '@react-md/app-bar';
import { Grid, GridCell } from '@react-md/utils'
import { Button } from "@react-md/button"
import { Dialog, DialogContent } from "@react-md/dialog"
import { ArrowBackFontIcon } from '@react-md/material-icons';
import {
  Form,
  TextField,
  FormThemeProvider,
  Select
} from '@react-md/form'
import gridStyles from '../../styles/Grid.module.scss'
import formStyles from '../../styles/Form.module.scss'

function UpsertUserPopup (props) {
  const [modalState, setModalState] = useState({
    visible: false,
    name: '',
    email: '',
    role: 'user',
    modalType: props.modalType
  })
  
  //Form Events
  const handleSubmit = (event) => {
    event.preventDefault()
    props.upsertUser({
      name: modalState.name,
      email: modalState.email,
      role: modalState.role
    })
    setModalState((prevState) => ({ ...prevState, name: "", email: "", role: "user"}))
  }
  const handleReset = () => {
    setModalState((prevState) => ({ ...prevState, name: "", email: "", role: "user"}))
    props.cancelCommand()
  }

  useEffect(() => {
    setModalState((prevState) => ({ 
      ...prevState, 
      name: props.name || '', 
      email: props.email || '', 
      role: props.role || 'user', 
      visible: props.visible
    }))
  },[props.name, props.email, props.role, props.visible])
  
  return (
    <Dialog
      id="upsert-user-dialog"
      role="alertdialog"
      type={modalState.modalType}
      visible={modalState.visible}
      onRequestClose={props.cancelCommand}
      aria-labelledby="dialog-title"
    >
    <AppBar id={`appbarUser`} theme="primary" key="primary">
      <AppBarNav onClick={handleReset} aria-label="Close">
        <ArrowBackFontIcon />
      </AppBarNav>
      <AppBarTitle>{"Modifying " + modalState.name}</AppBarTitle>
    </AppBar>
      <DialogContent>
        <div className={formStyles.container}>
          <Grid>
            <GridCell colSpan={12} className={gridStyles.item}>
              <div className={formStyles.container}>
                <FormThemeProvider theme='outline'>
                  <Form className={formStyles.form} onSubmit={handleSubmit} onReset={handleReset}>
                    <TextField
                      id='name'
                      key='name'
                      type='string'
                      label="User Name"
                      className={formStyles.item}
                      value={modalState.name}
                      onChange={(e) => setModalState((prevState) => ({ ...prevState, name: e.target.value}))}
                    />
                    <TextField
                      id='email'
                      key='email'
                      type='email'
                      label="Email"
                      className={formStyles.item}
                      value={modalState.email}
                      onChange={(e) => setModalState((prevState) => ({ ...prevState, email: e.target.value}))}
                    />
                    <Select
                      id="role"
                      key="role"
                      options={[
                        { label: 'Admin', value: 'admin' },
                        { label: 'User', value: 'user' }
                      ]}
                      value={modalState.role}
                      label="Role"
                      className={formStyles.item}
                      onChange={(value) =>
                        setModalState((prevState) => ({
                          ...prevState,
                          role: value,
                        }))
                      }
                    />
                    <div className={formStyles.btn_container}>
                      <Button
                        type="submit"
                        theme="primary"
                        themeType="outline"
                        className={formStyles.btn}
                      >
                        Save
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
            </GridCell>
          </Grid>
        </div>
      </DialogContent>      
    </Dialog>
  )
}
export default UpsertUserPopup
