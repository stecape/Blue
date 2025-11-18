import { Grid, GridCell } from '@react-md/utils'
import TypesList from './TypesList'
import gridStyles from "../../styles/Grid.module.scss"
import { UpsertTypeContextProvider } from "./UpsertType/UpsertTypeContext"

function Types () {
  return (
  <>
  <Grid>
    <GridCell colSpan={12} className={gridStyles.item}>
      <UpsertTypeContextProvider>
        <TypesList/>
      </UpsertTypeContextProvider>
    </GridCell>
  </Grid>
  </>
)}

export default Types