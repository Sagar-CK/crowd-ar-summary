import { Button } from "antd";
import TUDLogo from "../assets/TUDelft_logo_black.png";
const RevokedConsent = () => {;
    return (
        <div className="flex flex-col h-full w-full justify-center items-start">
            <nav className="flex w-full justify-start p-4">
                <img className="h-10" src={TUDLogo} alt="TU Delft" />
            </nav>
            <div className="flex flex-col w-full h-full items-center justify-center gap-y-4">
                <h1 className="font-semibold text-2xl">Consent Revoked</h1>
                <p>
                    We have taken note of your revoked consent. Your data collected so far
                    will be discarded and any time spent will be compensated on Prolific.
                </p>
                <p>
                    You can click the button below to be redirected to the Prolific Platform to be compensated. If you have any questions, please contact us through the Prolific platform.
                </p>
                <Button type='primary' onClick={() => window.location.href = "https://app.prolific.com/submissions/complete?cc=C1CCE19H"}>Go to Prolific</Button>
            </div>
        </div>
    );
};

export default RevokedConsent;
