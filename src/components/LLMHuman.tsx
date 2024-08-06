import { useState, useEffect } from "react";
import { GlobalStateProps } from "../types/State";
import { sampleLLMSummary, sampleArticle } from "../data/Mocked";

export const LLMHuman = ({globalState, setGlobalState}: GlobalStateProps) => {
    const [summary, setSummary] = useState("");
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        setWordCount(summary.split(/\s+/).filter(word => word.length > 0).length);
    }, [summary]);

    const handleProceed = () => {
        setGlobalState({
          ...globalState,
                    task: false,
                    postTask: true
        })
      };
    

    return (
        <div className="flex flex-col h-full w-full justify-start items-center gap-y-4 overflow-x-hidden text-sm">
            <div id="summary-article-container" className="flex w-5/6 h-2/3 gap-x-4">
                <div id='article-container' className="flex flex-col justify-center items-center bg-gray-200 rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                    <h1 className="font-semibold text-2xl">Article</h1>
                    <p className="overflow-y-scroll">
                        {sampleArticle}
                    </p>
                </div>
                <div id='summary-container' className="flex flex-col justify-start items-center bg-green-200 rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                    <h1 className="font-semibold text-2xl">LLM Summary</h1>
                    <p className="overflow-y-auto">
                        {sampleLLMSummary}
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
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500 hover:cursor-pointer disabled:hover:cursor-default"
                        onClick={handleProceed}
                        disabled={wordCount > 150 || wordCount < 100}
                    >
                        Submit Summary
                    </button>
                </form>
            </div>

        </div>
    );
}