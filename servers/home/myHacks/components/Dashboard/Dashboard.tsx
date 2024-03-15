import { HacknetManager } from "../../HacknetManager";
import { ServerManager } from "../../ServerManger";
import { MainHack } from "../../mainHack";
import { ActionBar } from "./ActionBar";
import { ControlButtons } from "./ControlButtons";
import { HackDisplay } from "./HackDisplay";
import { HacknetDisplay } from "./HacknetDisplay";
import { ServerDisplay } from "./ServerDisplay";
import { StatsBar } from "./StatsBar";
import React from "react";

export interface IDashboardProps {
    ns: NS;
    mh: MainHack;
    sm: ServerManager;
    hnm: HacknetManager;
}
export const Dashboard = ({ ns, mh, sm, hnm }: IDashboardProps) => {
    return (
        <div
            className="dashboard"
            style={{
                font: "12px",
                height: "100%",
                width: "12%",
                border: "2px solid",
                borderColor: "yellow",
                position: "fixed",
                zIndex: 1,
                top: 0,
                right: 2,
                overflowX: "hidden",
            }}
        >
            <div
                style={{
                    paddingLeft: "25px",
                    fontSize: "18px",
                    height: "50px",
                    color: "white",
                    borderBottom: "2px solid",
                    borderColor: "yellow",
                    paddingTop: "10px",
                }}
            >
                Overview
            </div>
            <ActionBar ns={ns} mh={mh}></ActionBar>
            <StatsBar ns={ns}></StatsBar>
            {/*Add your code below here */}
            <ControlButtons ns={ns} mh={mh} sm={sm} hnm={hnm}></ControlButtons>
            <ServerDisplay ns={ns} sm={sm}></ServerDisplay>
            <HacknetDisplay hnm={hnm} ns={ns}></HacknetDisplay>
            <HackDisplay ns={ns}></HackDisplay>
        </div>
    );
};
