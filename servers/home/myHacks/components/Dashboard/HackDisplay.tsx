import React, { useEffect } from "react";
import { useState } from "react";
import { SHARE_PORT } from "../../Constants";

export interface IHackProps {
    ns: NS;
}

export const HackDisplay = ({ ns }: IHackProps) => {
    const [sharePower, setSharePower] = useState(0);
    const [isSharing, setIsSharing] = useState("false");

    useEffect(() => {
        const interval = setInterval(() => {
            const sp = ns.getSharePower();
            setSharePower(sp);
            const iss = ns.peek(SHARE_PORT);
            setIsSharing(iss);
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

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
                        {sharePower}
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
                        Is Sharing
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
                        {isSharing}
                    </p>
                </div>
            </div>
        </div>
    );
};
