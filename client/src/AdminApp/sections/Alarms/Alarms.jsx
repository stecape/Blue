import { Grid, GridCell } from '@react-md/utils'
import AlarmsList from './AlarmsList'
import gridStyles from "../../styles/Grid.module.scss"

function Alarms () {  
  return (
  <>
  <Grid>
    <GridCell colSpan={12} className={gridStyles.item}>
      <AlarmsList/>
    </GridCell>
  </Grid>
  </>
)}

export default Alarms