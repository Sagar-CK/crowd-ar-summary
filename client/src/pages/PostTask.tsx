import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "../utils/Helper";

const PostTask = ({condition}: {condition: number}) => {
    const [continueButton, setContinueButton] = useState(true);

    const [searchParams, _setSearchParams] = useSearchParams();
    const prolificID = searchParams.get("prolificID");
    const queryClient = useQueryClient();

    const completeTask = useMutation({
        mutationFn: ({prolificID}: {prolificID: string}) => {
          return axios.patch(`${baseUrl}/api/users/${prolificID}`, {postTask: true})
        },
      })
      

    useEffect(() => {
        const handleSurveyCompletion = (event: MessageEvent) => {
            if (event.data === 'surveyCompleted') {
                const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
                if (submitButton) {
                    setContinueButton(false);
                }
            }
        };

        window.addEventListener('message', handleSurveyCompletion);

        return () => {
            window.removeEventListener('message', handleSurveyCompletion);
        };
    }, []);

    return (
        <div className="flex flex-col h-full w-full justify-center items-center">
            <iframe src="https://tudelft.fra1.qualtrics.com/jfe/form/SV_3PGMt9ubq6gbHIG" className="h-5/6 w-full"></iframe>
            <button id="submit-button" disabled={continueButton} className="transition-all bg-blue-500 text-white py-2 px-4 rounded mt-4 disabled:bg-gray-500 text-sm" onClick={
                () => {
                    completeTask.mutate({prolificID: prolificID!}, {onSuccess:() => queryClient.invalidateQueries({queryKey: [`cond${condition}`]})});
                }

            }>
                Continue
            </button>
        </div>
    )
}

export default PostTask;
