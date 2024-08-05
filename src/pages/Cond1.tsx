import PreTask from "./PreTask";
import { LLMHuman } from "../components/LLMHuman";
import { useNavigate } from "react-router-dom";
import { StateContext } from "../StateProvider";
import { useContext } from "react";
import PostTask from "./PostTask";

const Cond1 = () => {
    const {globalState, setGlobalState} = useContext(StateContext);

    console.log(globalState);
    
    const navigate = useNavigate();
    
    if (globalState.revokedConsent) {
        navigate("/revoked-consent")
    }

    if (globalState.preTask) {
        return (
            <PreTask
                globalState={globalState}
                setGlobalState={setGlobalState}
            />
        );

    }
    

    if (globalState.task) {
        return <LLMHuman globalState={globalState}
        setGlobalState={setGlobalState} />
    }

    if (globalState.postTask) {
        return (
            <PostTask
                globalState={globalState}
                setGlobalState={setGlobalState}
            />
        );
    }

    if(globalState.completed){
        navigate("/completion")
    }


    return (
        <div className="flex h-full w-full items-center justify-center">
            Something went wrong!
        </div>
    );
}

export default Cond1;