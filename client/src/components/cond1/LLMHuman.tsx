import { useState, useEffect } from "react";
import { baseUrl, calculateWordCount } from "../../utils/Helper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Button } from "antd";
import { RobotOutlined } from "@ant-design/icons";

export const LLMHuman = () => {
    const [summary, setSummary] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [searchParams, _setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const prolificID = searchParams.get("prolificID");
    const addFinalSummary = useMutation({
        mutationFn: ({prolificID, finalSummary}: {prolificID: string, finalSummary: string}) => {
          return axios.patch(`${baseUrl}/api/users/${prolificID}`, {finalSummary: finalSummary, task: true})
        },
      })

      
    useEffect(() => {
        setWordCount(calculateWordCount(summary))
    }, [summary]);


      const { isPending, error, data } = useQuery({
        queryKey: ['cond1task'],
        queryFn: async () => {
            try {
                const res = await fetch(`${baseUrl}/api/users/${prolificID}`)
                return await res.json();
            }
            catch (e) {
                throw Error("not defined.")
            }

        }
    })


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


    const handleProceed = async (e: React.FormEvent) => {
        e.preventDefault();
        
        addFinalSummary.mutate({prolificID: prolificID!, finalSummary: summary}, {
            onSuccess: () => {
                queryClient.invalidateQueries({queryKey: ['cond1', prolificID]});
            }
        })
      };
    

    return (
        <div className="flex flex-col h-full w-full justify-start items-center gap-y-4 overflow-x-hidden text-sm">
            <div id="summary-article-container" className="flex w-5/6 h-2/3 gap-x-4">
                <div id='article-container' className="flex flex-col justify-start items-center bg-gray-200 rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                    <h1 className="font-semibold text-2xl">Article</h1>
                    <p className="overflow-y-auto">
                        {data.article}
                    </p>
                </div>
                <div id='summary-container' className="flex flex-col justify-start items-center bg-green-200 rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                    <h1 className="font-semibold text-2xl">LLM Summary</h1>
                    <p className="overflow-y-auto">
                        {data.llmSummary}
                    </p>
                </div>
            </div>
            <div className="h-1/3 w-full flex flex-col items-center justify-center">
                <form className="flex flex-col items-center w-2/3 gap-y-2">
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={5}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Write your summary here within 100-150 words..."
                    />
                    <div className="text-gray-600  flex self-end">Word Count: {wordCount}</div>
                    <Button
                        type="primary"
                        onClick={handleProceed}
                        disabled={wordCount > 150 || wordCount < 100}
                    >
                        Submit Summary
                    </Button>
                </form>
            </div>

        </div>
    );
}