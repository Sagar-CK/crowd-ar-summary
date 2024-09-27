import { Button } from "antd";

interface CompletionProps {
    condition: number
}

const Completion = ({condition}: CompletionProps) => {
    return (
        <div className="flex flex-col h-full w-full justify-center items-start">
            <div className="flex flex-col w-full h-full items-center text-center justify-center gap-y-4">
                <h1 className="font-semibold text-2xl">Study Completed🥳!</h1>
                <p>
                Thank you for completing the study! Any time spent on the study will be compensated on Prolific.
                </p>
                <p>
                    You can now click the button below to be redirected to the Prolific platform and receive compensation. If you have any questions, please contact us through the Prolific platform.
                </p>
                {/*  Cond1: https://app.prolific.com/submissions/complete?cc=CF32RB7P */}
                {/* Cond2 : https://app.prolific.com/submissions/complete?cc=C1DK7UVS */}
                {/* Cond3: https://app.prolific.com/submissions/complete?cc=C7S1IME9 */}
                {condition === 1 && <Button type='primary' onClick={() => window.location.href = "https://app.prolific.com/submissions/complete?cc=CF32RB7P"}>Go to Prolific</Button>}
                {condition === 2 && <Button type='primary' onClick={() => window.location.href = "https://app.prolific.com/submissions/complete?cc=C1DK7UVS"}>Go to Prolific</Button>}
                {condition === 3 && <Button type='primary' onClick={() => window.location.href = "https://app.prolific.com/submissions/complete?cc=C7S1IME9"}>Go to Prolific</Button>}
            </div>
        </div>
    );
};

export default Completion;
