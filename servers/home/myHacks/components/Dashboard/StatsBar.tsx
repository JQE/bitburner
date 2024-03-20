import React, { useEffect, useRef, useState } from "react";
import { watchSelectorForUpdates } from "../../utils/bitrunnerDOM";

export interface IStatsProps {
    ns: NS;
}
interface PlayerStats {
    name: string;
    value;
    bar;
    color: string;
}

export const StatsBar = ({ ns }: IStatsProps) => {
    const [stats, setStats] = useState<PlayerStats[]>([]);
    let tbodyClone: HTMLElement;

    const getColor = (stat) => {
        switch (stat) {
            case 0:
                return "rgb(221, 52, 52)";
            case 1:
                return "rgb(255, 215, 0)";
            case 2:
                return "rgb(173, 255, 47)";
            case 3:
            case 4:
            case 5:
            case 6:
                return "rgb(250, 255, 223)";
            case 7:
                return "rgb(166, 113, 209)";
            case 8:
                return "rgb(0,3,239)";
            default:
                return "rgba(0, 0, 0, 0.87)";
        }
    };

    const processStats = () => {
        const tbody: HTMLElement = document.querySelector(
            ".react-draggable:first-of-type tbody"
        );
        const oldClone = tbodyClone;
        tbodyClone = tbody.cloneNode(true) as HTMLElement;
        tbodyClone.style.display = "none";
        if (oldClone !== undefined) {
            oldClone.replaceWith(tbodyClone);
        } else {
            document.body.appendChild(tbodyClone);
        }
        const tdp = tbodyClone.querySelectorAll("td p");
        const thp = tbodyClone.querySelectorAll("th p");
        const tbp = tbodyClone.querySelectorAll("th span");
        const playerStats = [...stats];
        for (let i = 0; i < 9; i++) {
            if ((thp[i] as HTMLElement).innerText === "") {
                continue;
            }
            const name = (thp[i] as HTMLElement).innerText;
            const bar = i < 2 ? undefined : (tbp[(i - 2) * 2] as HTMLElement);
            const value = tdp[i * 2] as HTMLElement;
            const stat: PlayerStats = {
                name: name,
                value: value,
                bar: bar,
                color: getColor(i),
            };
            playerStats[i] = stat;
        }
        setStats(playerStats);
    };

    useEffect(() => {
        processStats();
        const watcher = watchSelectorForUpdates("span", () => {
            processStats();
        });

        return () => {
            watcher.cleanup();
        };
    }, []);

    return (
        <>
            {stats !== undefined && (
                <div
                    style={{
                        width: "100%",
                        borderBottom: "5px solid",
                        paddingTop: "10px",
                        paddingBottom: "15px",
                    }}
                >
                    {stats.map((stat) => (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                height: "25px",
                            }}
                        >
                            {stat.name !== undefined && (
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
                                                color: stat.color,
                                            }}
                                        >
                                            {stat.name}
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
                                            textAlign: "right",
                                            paddingRight: "16px",
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
                                                color: stat.color,
                                            }}
                                            ref={(ref) => {
                                                if (ref !== null) {
                                                    if (
                                                        ref.firstChild !== null
                                                    ) {
                                                        ref.firstChild.remove();
                                                    }
                                                    ref.appendChild(stat.value);
                                                }
                                            }}
                                        ></p>
                                    </div>
                                </div>
                            )}
                            {stat.bar !== undefined && (
                                <div
                                    style={{
                                        color: "inherit",
                                        verticalAlign: "middle",
                                        outline: "0px",
                                        alignItems: "stretch",
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
                                            paddingRight: "16px",
                                            color: "rgba(0, 0, 0, 0.87)",
                                        }}
                                        ref={(ref) => {
                                            if (ref !== null) {
                                                if (ref.firstChild !== null) {
                                                    ref.firstChild.remove();
                                                }
                                                ref.appendChild(stat.bar);
                                            }
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};
