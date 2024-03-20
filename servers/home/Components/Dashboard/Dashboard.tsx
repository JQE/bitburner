import React, { useState } from "react";
import Style from "../../CSS/bootstrap.css";
import { ActionMenu } from "./ActionMenu/ActionMenu";
import { store } from "../../state/store";
import { Provider, useDispatch } from "react-redux";
import { IServerPanelInfo, ServerPanel } from "./ServerPanel/ServerPanel";
import { ServerManager } from "../../Utilities/ServerManagers/ServerManager";
import {
    setBuying,
    setHackType,
    setMaxRam,
    setTarget,
} from "../../state/ServerManager/ServerManagerSlice";
import { AdditionalStats } from "../Overview/AdditionalStats";

export interface IDashboardProps {
    ns: NS;
    sm: ServerManager;
}

export const Dashboard = ({ ns, sm }: IDashboardProps) => {
    const [showServerPanel, setShowServerPanel] = useState(false);
    const dispatch = useDispatch();

    const OnServerPanelClose = async (
        saved: boolean,
        info: IServerPanelInfo
    ) => {
        setShowServerPanel(false);
        if (saved) {
            dispatch(setBuying(info.IsBuying));
            dispatch(setTarget(info.Target));
            dispatch(setMaxRam(info.MaxRam));
            dispatch(setHackType(info.HackType));
            if (info.IsHacking) {
                await sm.StartHacking();
            } else {
                await sm.StopHacking();
            }
        }
    };

    return (
        <>
            <Style></Style>
            <div style={{ position: "absolute", bottom: "15px", left: "15px" }}>
                <ActionMenu
                    ns={ns}
                    onShowServer={() => {
                        setShowServerPanel(true);
                    }}
                ></ActionMenu>
            </div>
            <ServerPanel
                ns={ns}
                sm={sm}
                show={showServerPanel}
                onClose={OnServerPanelClose}
            ></ServerPanel>
            <AdditionalStats></AdditionalStats>
        </>
    );
};
