import React, { ChangeEvent, useState } from "react";
import { ServerManager } from "../../Managers/ServerManger";
import { useAppSelector } from "../../state/hooks";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/esm/Container";
import { HacknetManager } from "../../Managers/HacknetManager";
import { RootState } from "../../state/store";

interface IControlButtonsProps {
    ns: NS;
    sm: ServerManager;
    //hnm: HacknetManager;
    onShowServer: () => void;
    onShowGang: () => void;
    onQuit: () => void;
}

export const ControlButtons = ({
    ns,
    sm,
    //hnm,
    onShowServer,
    onShowGang,
    onQuit,
}: IControlButtonsProps) => {
    /*let hacknetsize = useAppSelector(
        (state: RootState) => state.hacknetmanager.Count
    );

    const [isBuyHacknet, setIsBuyHacknet] = useState(hnm.isBuying());
    const [hacknetCount, setHacknetCount] = useState(hacknetsize);

    const maxHacknet = useAppSelector(
        (state: RootState) => state.hacknetmanager.MaxNodes
    );

    const onBuyHacknet = () => {
        hnm.onBuy();
        setIsBuyHacknet(hnm.isBuying());
    };

    const onHacknetCountChange = (event: ChangeEvent<HTMLInputElement>) => {
        setHacknetCount(Number(event.currentTarget.value));
        hnm.setNumServers(Number(event.currentTarget.value));
    }; */

    const handleQuit = () => {
        onQuit();
    };

    return (
        <Container
            fluid="md"
            style={{
                borderBottom: "5px solid",
                paddingTop: "10px",
                paddingBottom: "10px",
            }}
        >
            <div className="d-grid gap-2">
                <Button variant="primary" onClick={onShowServer}>
                    Server Manager
                </Button>
                <Button variant="primary" onClick={onShowGang}>
                    Gang Manager
                </Button>
                {/*<Button
                    variant={isBuyHacknet ? "danger" : "success"}
                    onClick={onBuyHacknet}
                >
                    Hacknet
                </Button>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        paddingBottom: "10px",
                        paddingTop: "10px",
                    }}
                >
                    <Form.Label style={{ color: "white" }}>
                        Total Hacknet Servers {hacknetCount}
                    </Form.Label>
                    <Form.Range
                        min={0}
                        max={maxHacknet}
                        value={hacknetCount}
                        onChange={onHacknetCountChange}
                    />
                </div>*/}
                <Button variant="danger" onClick={handleQuit}>
                    Quit
                </Button>
            </div>
        </Container>
    );
};
