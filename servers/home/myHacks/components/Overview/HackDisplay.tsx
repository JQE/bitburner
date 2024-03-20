import React, { useEffect } from "react";
import { useState } from "react";
import { SHARE_PORT } from "../../Constants";
import { useAppSelector } from "../../state/hooks";
import { RootState } from "../../state/store";

export interface IHackProps {
    ns: NS;
}

export const HackDisplay = ({ ns }: IHackProps) => {
    const hackType = useAppSelector(
        (state: RootState) => state.servermanager.HackType
    );
    const sharePower = useAppSelector(
        (state: RootState) => state.servermanager.ShareValue
    );

    const getHackTypeString = () => {
        switch (hackType) {
            case 0:
                return "Basic";
            case 1:
                return "Share";
            case 2:
                return "Batch";
        }
    };

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
                        Share Power
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
                        {sharePower.toFixed(2)}
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
                        Hack Type
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
                        {getHackTypeString()}
                    </p>
                </div>
            </div>
        </div>
    );
};
