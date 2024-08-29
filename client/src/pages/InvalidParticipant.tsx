const InvalidParticipant = () => {
    return (
        <div className="flex flex-col h-full w-full justify-center items-start">
        <div className="flex flex-col w-full h-full items-center justify-center gap-y-4">
            <h1 className="font-semibold text-2xl">Invalid Participant 🤔</h1>
            <p>
            According to our records, you have already participated in this study for <strong>another condition</strong>. If you believe this is an error, please contact us through the Prolific platform.
            </p>
        </div>
    </div>
    );
}

export default InvalidParticipant;
    