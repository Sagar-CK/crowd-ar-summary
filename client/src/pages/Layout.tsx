import TUDLogo from "../assets/TUDelft_logo_black.png";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "../utils/Helper";
import { Button } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import TaskInstructions from "./TaskInstructions";
import InvalidParticipant from "./InvalidParticipant";

interface LayoutProps {
  condition?: number;
  children: React.ReactNode
}


const Layout = ({condition, children }: LayoutProps) => {
  const navigate = useNavigate();
  const [searchParams, _setSearchParams] = useSearchParams();
  const [isInstructionsOpen, setInstructionsOpen] = useState(false);
  
  const handleCancel = () => {
    setInstructionsOpen(false);
  }

  const updateConsent = useMutation({
    mutationFn: ({ prolificID }: { prolificID: string }) => {
      return axios.patch(`${baseUrl}/api/users/${prolificID}`, { revokedConsent: true });
    },
  })

  const {isPending, data} = useQuery({
    queryKey: ['layout'],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/users/${searchParams.get("prolificID")}`)
      return await res.json();
    }
  })

  if(data && data.condition !== condition){
    return <InvalidParticipant />
  }

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Fetching your data!
      </div>
    );
  }



  return (
    <div className="flex flex-col h-full w-full justify-center items-start">
      <nav className="flex w-full justify-between p-4">
        <img className="h-10" src={TUDLogo} alt="TU Delft" />
        <div className="flex items-start gap-x-4">
          {
            // data && 
            <Button type='primary' onClick={() => setInstructionsOpen(true)}>
            <QuestionCircleOutlined />
            Task Instructions
          </Button>

          }
          <Button type='primary' danger onClick={
            () => {
              // ensure the user wants to revoke consent
              if (window.confirm("Are you sure you want to withdraw consent?")) {
                // Redirect to the revoked consent page
                const prolificID = searchParams.get("prolificID");

                if (!prolificID) return;

                updateConsent.mutate({ prolificID: prolificID }, { onSuccess: () => navigate("/revoked-consent") })

              }
            }

          }>
            Withdraw Consent
          </Button>
        </div>

      </nav>
      <Modal
        open={isInstructionsOpen}
        footer={null}
        onCancel={handleCancel}
        centered={true}
        className="ant-modal"
        >
        <TaskInstructions condition={condition!} />
        </Modal>
      {children}
    </div>
  );
};

export default Layout;
