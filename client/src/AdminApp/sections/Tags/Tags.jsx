import { Grid, GridCell } from '@react-md/utils'
import TagsList from './TagsList'
import gridStyles from "../../styles/Grid.module.scss"

function Tags () {
  return (
  <>
  <Grid>
    <GridCell colSpan={12} className={gridStyles.item}>
      <TagsList />
    </GridCell>
  </Grid>
  </>
)}

export default Tags