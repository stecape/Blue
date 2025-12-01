import { Grid, GridCell } from '@react-md/utils';
import UsersList from './UsersList';
import gridStyles from '../../styles/Grid.module.scss';

function Users() {
  return (
    <>
      <Grid>
        <GridCell colSpan={12} className={gridStyles.item}>
          <UsersList />
        </GridCell>
      </Grid>
    </>
  );
}

export default Users;
