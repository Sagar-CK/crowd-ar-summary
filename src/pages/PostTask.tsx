import { useNavigate } from "react-router-dom";
import { GlobalStateProps } from "../types/State";

const PostTask = ({ globalState, setGlobalState }: GlobalStateProps) => {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col h-full w-full justify-center items-center">
            <iframe src="https://tudelft.fra1.qualtrics.com/jfe/form/SV_3PGMt9ubq6gbHIG" className="h-5/6 w-full"></iframe>
            <button className="transition-all bg-green-200 hover:bg-green-400 rounded-xl text-sm py-2 px-4" onClick={
                () => {
                    // Redirect to the revoked consent page
                    setGlobalState({
                        ...globalState,
                        completed: true,
                    })
                    navigate("/completion")
                }

            }>
                Continue
            </button>
        </div>
    )
}

export default PostTask;
