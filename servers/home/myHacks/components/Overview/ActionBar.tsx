import React, { useEffect, useState } from "react";
import {
    watchElForDeletion,
    watchSelectorForCreation,
} from "../../utils/bitrunnerDOM";
import { Col, Container, Row } from "react-bootstrap";
import { ServerManager } from "../../ServerManger";

export interface IActionBarProps {
    ns: NS;
    sm: ServerManager;
}
export const ActionBar = ({ ns, sm }: IActionBarProps) => {
    const [focusFn, setFocusFn] = useState<() => void>();
    const [focus, setFocus] = useState(false);

    const watch = () => {
        const watcher = watchSelectorForCreation("button", (element) => {
            if (element.innerText === "Focus") {
                setFocus(true);
                if (focusFn === undefined) {
                    setFocusFn(() => element[Object.keys(element)[1]].onClick);
                }
                watchElForDeletion(element, () => {
                    setFocus(false);
                    watch();
                });
            }
        });
        return watcher;
    };
    const saveBtn: HTMLElement = document.querySelector(
        'button[aria-label="save game"]'
    );
    const saveFn = saveBtn[Object.keys(saveBtn)[1]].onClick;

    useEffect(() => {
        const watcher = watch();
        return () => {
            watcher.cleanup();
        };
    }, []);

    return (
        <Container fluid="md" style={{ borderBottom: "5px solid" }}>
            <Row>
                <Col>
                    <button
                        className="MuiBUttonBase-root MuiIconButton-root MuiIconButton-sizeMedium"
                        tabIndex={0}
                        type="button"
                        aria-label="Save game"
                        style={{
                            display: "inline-flex",
                            WebkitBoxAlign: "center",
                            alignItems: "center",
                            WebkitBoxPack: "center",
                            justifyContent: "center",
                            position: "relative",
                            boxSizing: "border-box",
                            WebkitTapHighlightColor: "transparent",
                            backgroundColor: "transparent",
                            outline: "0px",
                            border: "0px",
                            margin: "0px",
                            cursor: "pointer",
                            userSelect: "none",
                            verticalAlign: "middle",
                            appearance: "none",
                            textDecoration: "none",
                            textAlign: "center",
                            flex: "0 0 auto",
                            fontSize: "1.5rem",
                            padding: "8px",
                            borderRadius: "50%",
                            overflow: "visible",
                            transition:
                                "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                            color: "rgb(0, 204, 0)",
                        }}
                        onClick={saveFn}
                    >
                        <svg
                            className="MuiSvgIcon-root MuiSvgIcon-colorPrimary MuiSvgIcon-fontSizeMedium css-wz14si"
                            focusable="false"
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            data-testid="SaveIcon"
                            aria-label="Save game"
                            style={{
                                userSelect: "none",
                                width: "1em",
                                height: "1em",
                                display: "inline-block",
                                fill: "currentcolor",
                                flexShrink: "0",
                                transition:
                                    "fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                                fontSize: "1.5rem",
                                color: "rgb(0, 204, 0)",
                            }}
                        >
                            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"></path>
                        </svg>
                    </button>
                </Col>
                <Col>
                    <button
                        className="MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium"
                        tabIndex={0}
                        type="button"
                        aria-label="Focus"
                        disabled={!focus}
                        style={{
                            display: "inline-flex",
                            WebkitBoxAlign: "center",
                            alignItems: "center",
                            WebkitBoxPack: "center",
                            justifyContent: "center",
                            position: "relative",
                            boxSizing: "border-box",
                            WebkitTapHighlightColor: "transparent",
                            backgroundColor: "transparent",
                            outline: "0px",
                            border: "0px",
                            margin: "0px",
                            cursor: !focus ? "default" : "pointer",
                            userSelect: "none",
                            verticalAlign: "middle",
                            appearance: "none",
                            textDecoration: "none",
                            textAlign: "center",
                            flex: "0 0 auto",
                            fontSize: "1.5rem",
                            padding: "8px",
                            borderRadius: "50%",
                            overflow: "visible",
                            transition:
                                "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                            color: "rgb(0, 204, 0)",
                        }}
                        onClick={focusFn}
                    >
                        <svg
                            className="MuiSvgIcon-root MuiSvgIcon-colorError MuiSvgIcon-fontSizeMedium"
                            focusable="false"
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            data-testid="ClearAllIcon"
                            aria-label="Focus"
                            style={{
                                userSelect: "none",
                                width: "1em",
                                height: "1em",
                                display: "inline-block",
                                fill: "currentcolor",
                                flexShrink: "0",
                                transition:
                                    "fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                                fontSize: "1.5rem",
                                color: !focus ? "gray" : "rgb(0, 204, 0)",
                            }}
                        >
                            <path d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"></path>
                        </svg>
                        <span className="MuiTouchRipple-root css-w0pj6f"></span>
                    </button>
                </Col>
                <Col>
                    <button
                        className="MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium"
                        tabIndex={0}
                        type="button"
                        aria-label="kill all"
                        style={{
                            display: "inline-flex",
                            WebkitBoxAlign: "center",
                            alignItems: "center",
                            WebkitBoxPack: "center",
                            justifyContent: "center",
                            position: "relative",
                            boxSizing: "border-box",
                            WebkitTapHighlightColor: "transparent",
                            backgroundColor: "transparent",
                            outline: "0px",
                            border: "0px",
                            margin: "0px",
                            cursor: "pointer",
                            userSelect: "none",
                            verticalAlign: "middle",
                            appearance: "none",
                            textDecoration: "none",
                            textAlign: "center",
                            flex: "0 0 auto",
                            fontSize: "1.5rem",
                            padding: "8px",
                            borderRadius: "50%",
                            overflow: "visible",
                            transition:
                                "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                            color: "red",
                        }}
                        onClick={() => sm.killAll(true)}
                    >
                        <svg
                            className="MuiSvgIcon-root MuiSvgIcon-colorError MuiSvgIcon-fontSizeMedium"
                            focusable="false"
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            data-testid="ClearAllIcon"
                            aria-label="Focus"
                            style={{
                                userSelect: "none",
                                width: "1em",
                                height: "1em",
                                display: "inline-block",
                                fill: "currentcolor",
                                flexShrink: "0",
                                transition:
                                    "fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                                fontSize: "1.5rem",
                                color: "red",
                            }}
                        >
                            <path d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"></path>
                        </svg>
                        <span className="MuiTouchRipple-root css-w0pj6f"></span>
                    </button>
                </Col>
            </Row>
        </Container>
    );
};
