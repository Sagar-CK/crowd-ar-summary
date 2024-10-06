import { useEffect, useState } from "react";
import { CreateUser } from "../types/User";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { baseUrl } from "../utils/Helper";
import { Button } from "antd";
import TaskInstructions from "./TaskInstructions";
import { QuestionCircleOutlined } from "@ant-design/icons";

const PreTask = ({ condition }: { condition: number }) => {
  const [consent, setConsent] = useState(false);
  const [prolificId, setProlificId] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: (newUser: CreateUser) => axios.post(`${baseUrl}/api/users`, newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`cond${condition}`, prolificId] });
    },
  });

  useEffect(() => {
    const paramID = searchParams.get("prolificID");
    if (paramID) {
      setProlificId(paramID);
    }
  }, [searchParams]);

  const { data, error, isFetching } = useQuery({
    queryKey: ['userDuplicateCheck', prolificId],
    queryFn: async () => {
      if (!prolificId) return null;
      const res = await fetch(`${baseUrl}/api/users/${prolificId}`);
      if (!res.ok) throw new Error("User check failed");
      return await res.json();
    },
    enabled: !!prolificId, // only run query if prolificId is present
  });

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConsent(e.target.checked);
  };

  const handleProlificIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^[a-zA-Z0-9]{24}$/.test(value)) {
      setErrorMessage("Please enter your valid 24-character Prolific ID.");
    } else {
      setErrorMessage(null);
    }
    setProlificId(value);
  };

  const handleProceed = async () => {
    if (!/^[a-zA-Z0-9]{24}$/.test(prolificId)) {
      setErrorMessage("Please enter your valid 24-character Prolific ID.");
      return;
    }

    setLoading(true);

    await queryClient.invalidateQueries({ queryKey: ['userDuplicateCheck', prolificId] });

    if (error) {
      setLoading(false);
      return;
    }

    // Participant is rejoining the same condition
    if (data && data.condition === condition) {
      navigate(`/cond${condition}?prolificID=${prolificId}`);
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: [`cond${condition}`, prolificId] })
      return;
    }

    // A new participant
    setSearchParams({ prolificID: prolificId });
    await mutation.mutateAsync({ prolificID: prolificId, preTask: true, condition });

    queryClient.invalidateQueries({ queryKey: ['layout'] });
  };

  return (
    
    <div className="flex flex-col w-full h-full items-center gap-y-4 overflow-auto">
      
      <h1 className="font-semibold text-2xl">Human and AI Collaboration in Text Summarization Tasks</h1>
      <p className="text-wrap max-w-screen-lg align-top text-sm">
        We are a group of researchers at the Technical University of Delft
        (Delft University of Technology) in the Netherlands. In this
        research project, we aim to investigate the effects of integration
        approaches of large-language models (LLM) on the overall experience
        and performance of crowd-workers in text summarization tasks. This
        task is part of the research project described above.
      </p>
      <div className="w-1/2">
        <TaskInstructions condition={condition} />
      </div>
      <br></br>
      <div className="text-wrap max-w-screen-lg  text-sm gap-x-2 flex items-center justify-start w-full">
        Note, that throughout the study you can always refer to the task instructions by clicking the <Button type='primary' // the hover should be no pointer
         style={{cursor: "default"}} >
            <QuestionCircleOutlined />
            Task Instructions
          </Button>button at the top right corner of the page.
      </div>

      <p className="text-wrap max-w-screen-lg align-top text-sm">
        We will collect this summary
        along with the following demographic-related data: age, gender,
        experience, and occupation.
        <br /> <br />
        Your participation in this task is entirely voluntary and you can
        withdraw at any time. We do not collect any data aside from the
        information described above and your Prolific profile data that is
        automatically transmitted to us when you submit your answers. We
        will keep your information confidential. We ensure that your data is
        stored in a password-protected electronic format. Be aware that the
        data we gather with this task might be published in an anonymized
        form later. Such an anonymized data set would include the answers
        you provide in this task, but no personal information (e.g., your
        Prolific ID) so that the answers will not be traceable back to you.
        <br /> <br />
        By completing the task and clicking <strong>'submit'</strong> at the bottom of this
        page, you confirm that you have read, understood, and consent to all
        of the above information and the processing of your data. Once
        compensation has been provided, your data/responses cannot be
        withdrawn as we will not be able to identify your individual
        submission in the aggregated dataset, as your Prolific ID will be
        discarded from the dataset.
      </p>
      <div className="flex flex-col items-center gap-4 text-sm">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" onChange={handleConsentChange} />
          I consent to participate in this study.
        </label>
        <label className="flex items-center gap-2">
          <span>Enter your Prolific ID:</span>
          <input
            type="text"
            className={`border p-2 mt-1 ${errorMessage ? "border-red-500" : "border-gray-300"}`}
            onChange={handleProlificIdChange}
            placeholder="e.g., 5e8f8c48e4b0a2d1a7d9e6b7"
            value={prolificId}
            maxLength={24}
          />
        </label>
        {errorMessage && <span className="text-red-500 text-sm font-semibold">{errorMessage}</span>}
        <Button
          type='primary'
          onClick={handleProceed}
          disabled={!consent || isFetching}
          loading={loading}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default PreTask;
