export interface State{
    preTask: boolean;
    task: boolean;
    postTask: boolean;
    revokedConsent: boolean;
    completed: boolean;
}

export type GlobalStateProps = {
    globalState: State;
    setGlobalState: React.Dispatch<React.SetStateAction<State>>;
}