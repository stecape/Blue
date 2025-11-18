import { Grid, GridCell } from '@react-md/utils'
import UmList from './UmList'
import gridStyles from "../../styles/Grid.module.scss"

function Um () {
  return (
  <>
  <Grid>
    <GridCell colSpan={12} className={gridStyles.item}>
      <UmList/>
    </GridCell>
  </Grid>
  </>
)}

export default Um
