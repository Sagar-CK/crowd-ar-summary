import { useState, useEffect } from "react";
import { Cond2State, GlobalStateProps } from "../types/State";
import { sampleArticle, sampleLLMSummary } from "../data/Mocked";

export const HumanLLMHumman = ({ globalState, setGlobalState }: GlobalStateProps) => {
    const [summary, setSummary] = useState("");
    const [finalSummary, setFinalSummary] = useState("");
    const [wordCount, setWordCount] = useState(0);

    const [summaryState, setSummaryState] = useState<Cond2State>({
        initalSummary: true,
        llmSummary: false,
        finalSummary: false,
    })

    useEffect(() => {
        setWordCount(summary.split(/\s+/).filter(word => word.length > 0).length);
    }, [summary]);

    const submitInitialSummary = () => {
        setSummaryState({
            ...summaryState,
            initalSummary: false,
            llmSummary: true,
        })

        setFinalSummary(summary);
    };

    const continueLLMSummary = () => {
        setSummaryState({
            ...summaryState,
            llmSummary: false,
            finalSummary: true,
        })
    };

    const submitFinalSummary = () => {
        setGlobalState({
            ...globalState,
            task: false,
            postTask: true,
        })
    }

    if (summaryState.initalSummary) {
        return (
            <div className="flex flex-col h-full w-full justify-start items-center gap-y-4 overflow-x-hidden text-sm">
                <div id="summary-article-container" className="flex justify-center w-5/6 h-2/3 gap-x-4">
                    <div id='article-container' className="flex flex-col justify-center items-center bg-gray-200 rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                        <h1 className="font-semibold text-xl">Article</h1>
                        <p className="overflow-y-scroll">
                            {sampleArticle}
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
                            onClick={submitInitialSummary}
                            disabled={wordCount > 150 || wordCount < 100}
                        >
                            Submit Summary
                        </button>
                    </form>
                </div>

            </div>
        );
    }

    if (summaryState.llmSummary) {
        return (
            <div className="flex flex-col h-full w-full justify-start items-center gap-y-4 overflow-x-hidden text-sm">
                <div id="summary-article-container" className="flex justify-center w-5/6 h-2/3 gap-x-4">
                    <div id='article-container' className="flex flex-col justify-start items-center bg-green-200 rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                        <h1 className="font-semibold text-xl">AI Revised Summary 🤖</h1>
                        <p>
                            {sampleLLMSummary}
                        </p>
                    </div>
                </div>
                <div className="h-1/3 w-full flex flex-col items-center justify-center">
                    <form className="flex flex-col items-center w-2/3 gap-y-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500 hover:cursor-pointer disabled:hover:cursor-default"
                            onClick={continueLLMSummary}
                        >
                            Continue to Editor
                        </button>
                    </form>
                </div>

            </div>
        );

    }

    if (summaryState.finalSummary) {
        return (
            <div className="flex h-full w-full justify-center items-start overflow-x-hidden text-sm">
                <div id='article-container' className="flex flex-col justify-center items-center w-1/3 h-full text-wrap p-4">
                    <div className="flex flex-col items-center p-4 bg-gray-200 rounded-xl overflow-auto ">
                        <h1 className="font-semibold text-xl">Article</h1>
                        <p>
                            {sampleArticle}
                        </p>
                    </div>
                </div>
                <div id="summary-submission-container" className="flex flex-col justify-center w-2/3 h-full">
                    <div className="flex flex-col items-center justify-evenly gap-y-4 p-4 h-full rounded-xl overflow-auto ">
                        <div id="summary-container" className="flex h-auto gap-x-4">
                            <div id='summary-container' className="flex flex-col justify-start items-center bg-green-200 rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                                <h1 className="font-semibold text-xl">AI Revised Summary 🤖</h1>
                                <p className="overflow-y-auto">
                                    {sampleLLMSummary}
                                </p>
                            </div>
                            <div id='human-summary-container' className="flex flex-col justify-start items-center bg-amber-200 rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                                <h1 className="font-semibold text-xl">Original Summary</h1>
                                <p className="overflow-y-auto">
                                    {summary}
                                </p>
                            </div>
                        </div>
                        <div id="final-container" className="flex flex-col items-center justify-center  w-full h-1/3">

                            <div className="flex justify-center items-center w-5/6 h-full">
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
                                            <div className="text-gray-600  flex self-end">Word Count: {wordCount}</div>
                                        </form>

                                    </div>

                                </div>
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500 hover:cursor-pointer disabled:hover:cursor-default"
                                onClick={submitFinalSummary}
                                disabled={wordCount > 150 || wordCount < 100}
                            >
                                Submit Final Summary
                            </button>
                        </div>
                    </div>
                </div>

            </div>

        );
    }


    return <div className="flex w-full h-full items-center justify-center"> Something went wrong!</div>;
}