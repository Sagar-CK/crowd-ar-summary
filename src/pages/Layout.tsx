import TUDLogo from "../assets/TUDelft_logo_black.png";
import React from "react";
import { StateContext } from "../StateProvider";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

 interface LayoutProps  { 
    children: React.ReactNode
 }

 
 
const Layout = ({ children}: LayoutProps) => {
  const {globalState, setGlobalState} = useContext(StateContext);
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-full w-full justify-center items-start">
      <nav className="flex w-full justify-between p-4">
        <img className="h-10" src={TUDLogo} alt="TU Delft" />
        <button className="transition-all bg-red-400 hover:bg-red-500 hover:drop-shadow-md  rounded-xl text-sm py-2 px-4" onClick={
            () => {
                // ensure the user wants to revoke consent
                if (window.confirm("Are you sure you want to withdraw consent?")) {
                    // Redirect to the revoked consent page
                    setGlobalState({
                      ...globalState,
                      revokedConsent: true,
                    })
                    navigate("/revoked-consent")
                }
            }
            
        }>  
          Withdraw Consent
        </button>
      </nav>
      {children}
    </div>
  );
};

export default Layout;
