import React, { useState } from "react";
import { ServerManager } from "../../ServerManger";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";

export interface IServerProps {
    ns: NS;
    sm: ServerManager;
}

export const ServerDisplay = ({ ns, sm }: IServerProps) => {
    const maxRam = useSelector(
        (state: RootState) => state.servermanager.CurrentRam
    );
    const serverCount = useSelector(
        (state: RootState) => state.servermanager.ServerCount
    );
    const maxServers = useSelector(
        (state: RootState) => state.servermanager.MaxServers
    );

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                borderBottom: "5px solid",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: "100%",
                }}
            >
                <div
                    style={{
                        fontFamily:
                            '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"',
                        fontWeight: "400",
                        fontSize: "0.875rem",
                        lineHeight: "1.43",
                        verticalAlign: "inherit",
                        textAlign: "left",
                        paddingLeft: "16px",
                        color: "rgba(0, 0, 0, 0.87)",
                    }}
                >
                    <p
                        className="MuiTypography-root MuiTypography-body1"
                        style={{
                            margin: "0px",
                            fontFamily:
                                '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"',
                            fontWeight: "400",
                            fontSize: "1rem",
                            lineHeight: "1.5",
                            color: "yellow",
                        }}
                    >
                        Server Count
                    </p>
                </div>
                <div
                    style={{
                        fontFamily:
                            '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"',
                        fontWeight: "400",
                        fontSize: "0.875rem",
                        lineHeight: "1.43",
                        verticalAlign: "inherit",
                        textAlign: "left",
                        paddingLeft: "16px",
                        color: "rgba(0, 0, 0, 0.87)",
                    }}
                >
                    <p
                        className="MuiTypography-root MuiTypography-body1"
                        style={{
                            margin: "0px",
                            fontFamily:
                                '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"',
                            fontWeight: "400",
                            fontSize: "1rem",
                            lineHeight: "1.5",
                            color: "yellow",
                        }}
                    >
                        {serverCount}
                    </p>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: "100%",
                }}
            >
                <div
                    style={{
                        fontFamily:
                            '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"',
                        fontWeight: "400",
                        fontSize: "0.875rem",
                        lineHeight: "1.43",
                        verticalAlign: "inherit",
                        textAlign: "left",
                        paddingLeft: "16px",
                        color: "rgba(0, 0, 0, 0.87)",
                    }}
                >
                    <p
                        className="MuiTypography-root MuiTypography-body1"
                        style={{
                            margin: "0px",
                            fontFamily:
                                '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"',
                            fontWeight: "400",
                            fontSize: "1rem",
                            lineHeight: "1.5",
                            color: "yellow",
                        }}
                    >
                        Max Servers
                    </p>
                </div>
                <div
                    style={{
                        fontFamily:
                            '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"',
                        fontWeight: "400",
                        fontSize: "0.875rem",
                        lineHeight: "1.43",
                        verticalAlign: "inherit",
                        textAlign: "left",
                        paddingLeft: "16px",
                        color: "rgba(0, 0, 0, 0.87)",
                    }}
                >
                    <p
                        className="MuiTypography-root MuiTypography-body1"
                        style={{
                            margin: "0px",
                            fontFamily:
                                '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"',
                            fontWeight: "400",
                            fontSize: "1rem",
                            lineHeight: "1.5",
                            color: "yellow",
                        }}
                    >
                        {maxServers}
                    </p>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: "100%",
                }}
            >
                <div
                    style={{
                        fontFamily:
                            '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"',
                        fontWeight: "400",
                        fontSize: "0.875rem",
                        lineHeight: "1.43",
                        verticalAlign: "inherit",
                        textAlign: "left",
                        paddingLeft: "16px",
                        color: "rgba(0, 0, 0, 0.87)",
                    }}
                >
                    <p
                        className="MuiTypography-root MuiTypography-body1"
                        style={{
                            margin: "0px",
                            fontFamily:
                                '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"',
                            fontWeight: "400",
                            fontSize: "1rem",
                            lineHeight: "1.5",
                            color: "yellow",
                        }}
                    >
                        Current Ram
                    </p>
                </div>
                <div
                    style={{
                        fontFamily:
                            '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"',
                        fontWeight: "400",
                        fontSize: "0.875rem",
                        lineHeight: "1.43",
                        verticalAlign: "inherit",
                        textAlign: "left",
                        paddingLeft: "16px",
                        color: "rgba(0, 0, 0, 0.87)",
                    }}
                >
                    <p
                        className="MuiTypography-root MuiTypography-body1"
                        style={{
                            margin: "0px",
                            fontFamily:
                                '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"',
                            fontWeight: "400",
                            fontSize: "1rem",
                            lineHeight: "1.5",
                            color: "yellow",
                        }}
                    >
                        {maxRam}
                    </p>
                </div>
            </div>
        </div>
    );
};
