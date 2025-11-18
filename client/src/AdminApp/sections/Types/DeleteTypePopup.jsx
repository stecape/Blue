import { useState, useEffect } from "react"
import { Button } from "@react-md/button"
import { Dialog, DialogContent, DialogFooter } from "@react-md/dialog"
import { Typography } from "@react-md/typography"

function DeleteTypePopup (props) {

  const [modalState, setModalState] = useState({ visible: false, name: '' })

  useEffect(() => {
    setModalState((prevState) => ({ ...prevState, visible: props.visible}))
  },[props.visible])
  
  return (
    <Dialog
      id="delete-type-dialog"
      role="alertdialog"
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
          Delete {props.name}?
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
          onClick={()=>props.delType(props.id)}
          theme="error"
        >
          Delete
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
export default DeleteTypePopup