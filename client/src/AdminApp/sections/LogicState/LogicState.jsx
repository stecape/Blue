import { Grid, GridCell } from '@react-md/utils'
import LogicStatesList from './LogicStatesList'
import gridStyles from "../../styles/Grid.module.scss"

function LogicState () {  
  return (
  <>
  <Grid>
    <GridCell colSpan={12} className={gridStyles.item}>
      <LogicStatesList/>
    </GridCell>
  </Grid>
  </>
)}

export default LogicState
