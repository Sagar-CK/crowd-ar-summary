import { Button } from "antd";

const InvalidParticipant = () => {
    return (
        <div className="flex flex-col h-full w-full justify-center items-start">
        <div className="flex flex-col w-full h-full items-center justify-center gap-y-4">
            <h1 className="font-semibold text-2xl">Invalid Participant 🤔</h1>
            <p>
            According to our records, you have already participated in this study for <strong>another condition</strong>. If you believe this is an error, please contact us through the Prolific platform.
            </p>
            <p>
                You can click the button below to be redirected to the Prolific platform. If you have any questions, please contact us through the Prolific platform.
            </p>
            {/* <Button type='primary' onClick={() => window.location.href = "https://app.prolific.com/submissions/complete?cc=C11QUVXW"}>Go to Prolific</Button> */}
        </div>
    </div>
    );
}

export default InvalidParticipant;
    