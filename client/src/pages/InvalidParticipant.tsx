// import { Button } from "antd";

import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "../utils/Helper";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "antd";



const InvalidParticipant = () => {
    const [searchParams, _setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const {isPending, data} = useQuery({
        queryKey: ['layout'],
        queryFn: async () => {
          const res = await fetch(`${baseUrl}/api/users/${searchParams.get("prolificID")}`)
          return await res.json();
        }
      })
      
    return (
        <div className="flex flex-col h-full w-full justify-center items-start">
        <div className="flex flex-col w-full h-full items-center justify-center gap-y-4">
            <h1 className="font-semibold text-2xl">Invalid Participant 🤔</h1>
            <p>
            According to our records, you have already participated in this study for <strong>another condition</strong>. If you believe this is an error, please contact us through the Prolific platform.
            </p>
            <p>
                You can click the button below to be redirected to the correct condition.
            </p>
            <p>
                <strong>  If you have already completed the study for this condition at an earlier stage, please return the study on Prolific!</strong>
            </p>
            <Button type="primary" onClick={() => navigate(`/cond${data.condition}?prolificID=${data.prolificID}`)}>Go to correct condition</Button>
            
        </div>
    </div>
    );
}

export default InvalidParticipant;
    