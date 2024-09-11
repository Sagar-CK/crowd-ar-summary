import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl, calculateWordCount } from "../../utils/Helper";
import { useSearchParams } from "react-router-dom";
import { Button } from "antd";
import { LoadingOutlined, RobotOutlined, RollbackOutlined } from "@ant-design/icons";
import { QueryState } from "../../types/QueryState";

type FinalCond2Props = {
    queryState: QueryState;
    setQueryState: React.Dispatch<React.SetStateAction<QueryState>>;
};

export const FinalCond2 = ({ queryState, setQueryState }: FinalCond2Props) => {
    const [finalSummary, setFinalSummary] = useState("");
    const [finalSummaryWordCount, setFinalSummaryWordCount] = useState(0);
    const [searchParams, _setSearchParams] = useSearchParams();

    const prolificID = searchParams.get("prolificID");

    const queryClient = useQueryClient();

    const { isPending, error, data } = useQuery({
        queryKey: ['initialSummary', prolificID],
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/api/users/${prolificID}`)
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return await res.json();
        }
    })

    const createLLMSummary = useMutation({
        mutationFn: () => {
            return axios.post(`${baseUrl}/api/users/query`, {
                model: "llama3.1",
                messages: [
                    {
                        role: "user",
                        content: `Summarize the following text in 100-150 words: ${data.article}  Ensure the summary captures the main points and key details.  Format your response as: SUMMARY: <your summary here>`
                    }
                ],
                stream: false,
            })
        }
    })

    const retryLLMSummary = async () => {
        // Set loading to true at the start.
        setQueryState({ loading: true, error: false });

        try {
            // Fetch LLM summary
            const llmSummary = await createLLMSummary.mutateAsync();
            // Remove the "SUMMARY: " prefix from the LLM summary if it exists
            const summaryContent = llmSummary.data.message.content.replace("SUMMARY:", "");

            // Update with LLM summary
            await addLLMSummary.mutateAsync({ prolificID: prolificID!, llmSummary: summaryContent });

            // Invalidate the query used by FinalCond2 to fetch the updated data
            queryClient.invalidateQueries({ queryKey: ['initialSummary', prolificID] });

            // Ensure loading is set to false no matter the outcome.
            setQueryState({ loading: false, error: false });
        } catch (error) {
            setQueryState({ loading: false, error: true });
            // Handle error gracefully.
        }
    };


    const addLLMSummary = useMutation({
        mutationFn: ({ prolificID, llmSummary }: { prolificID: string, llmSummary: string }) => {
            return axios.patch(`${baseUrl}/api/users/${prolificID}`, { llmSummary: llmSummary })
        },
    })

    const addFinalSummary = useMutation({
        mutationFn: ({ prolificID, finalSummary }: { prolificID: string, finalSummary: string }) => {
            return axios.patch(`${baseUrl}/api/users/${prolificID}`, { finalSummary: finalSummary, task: true })
        },
    })


    useEffect(() => {
        setFinalSummaryWordCount(calculateWordCount(finalSummary));
    }, [finalSummary]);


    if (isPending || !data) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                Fetching your response!
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                Something went wrong.
            </div>
        );
    }

    const submitFinalSummary = async (e: React.FormEvent) => {
        e.preventDefault();
        addFinalSummary.mutate({ prolificID: prolificID!, finalSummary: finalSummary }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['cond2', prolificID] });
            }
        })
    };

    return (
        <div className="flex h-full w-full justify-center items-center overflow-x-hidden text-sm">
            <div className="flex h-full w-full">

                <div id='article-container' className="flex flex-col justify-start items-center w-1/3 h-full text-wrap p-4">
                    <div className="flex flex-col items-center p-4 bg-gray-200 rounded-xl overflow-auto ">
                        <h1 className="font-semibold text-xl">Article</h1>
                        <p className="overflow-y-auto">
                            {data.article}
                        </p>
                    </div>
                </div>
                <div id="summary-submission-container" className="flex flex-col justify-center w-2/3 h-full">
                    <div className="flex flex-col items-center justify-start gap-y-4 p-4 h-full rounded-xl overflow-auto ">
                        <div id="summary-container" className="flex h-auto gap-x-4">
                            <div id='summary-container' className="flex flex-col justify-start items-center bg-green-200 rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                                <h1 className="font-semibold text-xl">{<RobotOutlined />} CondenseCrew Summary</h1>
                                <p className="overflow-y-auto">
                                    {queryState.loading ? <LoadingOutlined /> : data.llmSummary}
                                </p>
                                {!data.llmSummary || !queryState.loading && queryState.error ? <>
                                    <div className="text-red-500 text-lg font-semibold w-full h-full flex items-center flex-col justify-evenly">
                                        <p>
                                            We failed to fetch the LLM summary! Please try again.
                                            If the error persists, contact the researcher on Prolific.
                                        </p>

                                        <Button
                                            type="primary"
                                            onClick={() => retryLLMSummary()}
                                        >
                                            Retry <RollbackOutlined />
                                        </Button>
                                    </div>
                                </>
                                    : null}
                            </div>
                            <div id='human-summary-container' className="flex flex-col justify-start items-center bg-amber-200 rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                                <h1 className="font-semibold text-xl">Original Summary</h1>
                                <p className="overflow-y-auto">
                                    {data.initialSummary}
                                </p>
                            </div>
                        </div>
                        <div id="final-container" className="flex flex-col items-center justify-center  w-full h-1/3">

                            <div className="flex justify-center items-center w-full h-full">
                                <div id="submission-container" className="flex w-full h-full gap-x-4">

                                    <div className="w-full h-full flex flex-col items-center justify-center">

                                        <form className="flex flex-col items-center justify-center  h-full w-full gap-y-2">
                                            <textarea
                                                className="w-full h-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows={5}
                                                value={finalSummary}
                                                onChange={(e) => setFinalSummary(e.target.value)}
                                                placeholder="Write your revised summary here within 100-150 words..."
                                            />
                                            <div className="text-gray-600  flex self-end">Word Count: {finalSummaryWordCount}</div>
                                        </form>

                                    </div>

                                </div>
                            </div>
                            <Button
                                type="primary"
                                // className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500 hover:cursor-pointer disabled:hover:cursor-default"
                                onClick={submitFinalSummary}
                                disabled={finalSummaryWordCount > 150 || finalSummaryWordCount < 100}
                            >
                                Submit Final Summary
                            </Button>
                        </div>
                    </div>
                </div>
            </div>



        </div>

    );
}