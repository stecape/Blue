import { useState, useEffect } from "react"
import { Button } from "@react-md/button"
import { Dialog, DialogContent, DialogFooter } from "@react-md/dialog"
import { Typography } from "@react-md/typography"

function DeleteFieldPopup (props) {

  const [modalState, setModalState] = useState({ visible: false, name: '' })

  useEffect(() => {
    setModalState((prevState) => ({ ...prevState, name: props.name, visible: props.visible}))
  },[props.name, props.visible])
  
  return (
    <Dialog
      id="delete-field-dialog"
      role="alertdialog"
      modal={modalState.modal}
      visible={modalState.visible}
      onRequestClose={props.cancelCommand}
      aria-labelledby="dialog-title"
    >
      <DialogContent>
        <Typography
          id="dialog-title"
          type="subtitle-1"
          margin="none"
          color="secondary"
        >
          Delete {modalState.name}?
        </Typography>
      </DialogContent>
      <DialogFooter>
        <Button id="dialog-cancel"
          onClick={props.cancelCommand}
        >
          Cancel
        </Button>
        <Button
          id="dialog-discard"
          onClick={()=>props.delField()}
          theme="error"
        >
          Delete
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
export default DeleteFieldPopup