import{ createContext, useState } from "react";
import { State } from "./types/State";

export const StateContext = createContext<any>(null);

interface StateProviderPropse  { 
  children: React.ReactNode
}

const StateProvider = ({ children }: StateProviderPropse) => {
  const [globalState, setGlobalState] = useState<State>({
    preTask: true,
    task: false,
    postTask: false,
    revokedConsent: false,
    completed: false,
  })


  return <StateContext.Provider value={{globalState: globalState, setGlobalState: setGlobalState}}>
    {children}</StateContext.Provider>;
};

export default StateProvider;