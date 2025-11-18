import { useContext } from "react"
import { List, ListItem } from "@react-md/list"

import { UpsertTypeContext } from './UpsertTypeContext'

function QueryList () {
  const {upsertType} = useContext(UpsertTypeContext)

  return (
    <List>
      <ListItem key={`typeNameQuery`} id={`typeNameQuery`}>{upsertType.typeNameQuery}</ListItem>
      {upsertType.insertQuery.map((q, i) => (
        <ListItem key={`insertQuery_${i}`} id={`insertQuery_${i}`}>
          {q.query}
        </ListItem>
      ))}
      {upsertType.updateQuery.map((q, i) => (
        <ListItem key={`updateQuery_${i}`} id={`updateQuery_${i}`}>
          {q.query}
        </ListItem>
      ))}
      {upsertType.deleteQuery.map((q, i) => (
        <ListItem key={`deleteQuery_${i}`} id={`deleteQuery_${i}`}>
          {q.query}
        </ListItem>
      ))}
    </List>
  )
}
export default QueryList