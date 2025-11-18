import React, { createContext, useState, useMemo, useCallback } from "react";

const UpsertTypeContext = createContext()

const UpsertTypeContextProvider = ({children}) => {
    const [upsertType, setUpsertType] = useState({
        create: true,
        typeNameQuery: '',
        insertQuery:[],
        updateQuery:[],
        deleteQuery:[],
        name: '',
        type: 0,
        fields: [],
        typesList: [],
        typeNameNotValid: false,
        fieldTypeNotValid: false,
        fieldNameNotValid: false
    })

    const initUpsertTypeContext = useCallback((filteredTypesList) => {
      setUpsertType({
        create: true,
        typeNameQuery: '',
        insertQuery:[],
        updateQuery:[],
        deleteQuery:[],
        name: '',
        type: 0,
        fields: [],
        typesList: filteredTypesList,
        typeNameNotValid: false,
        fieldTypeNotValid: false,
        fieldNameNotValid: false
      })
    },[])

    const value = useMemo(
        () => ({ upsertType, setUpsertType, initUpsertTypeContext }),
        [upsertType, setUpsertType, initUpsertTypeContext]
      );

    return (
      // the Provider gives access to the context to its children
      <UpsertTypeContext.Provider value = {value}>
        {children}
      </UpsertTypeContext.Provider>
    );
}

export { UpsertTypeContext, UpsertTypeContextProvider };