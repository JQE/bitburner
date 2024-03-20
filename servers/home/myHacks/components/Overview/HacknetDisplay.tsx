import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { HacknetManager } from "../../HacknetManager";

export interface IHacknetProps {
    ns: NS;
    hnm: HacknetManager;
}

export const HacknetDisplay = ({ ns, hnm }: IHacknetProps) => {
    const count = useSelector((state: RootState) => state.hacknetmanager.Count);
    const purchased = useSelector(
        (state: RootState) => state.hacknetmanager.Purchased
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
                        Node Count
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
                        {purchased}
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
                        Max Nodes
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
                        {count}
                    </p>
                </div>
            </div>
        </div>
    );
};
