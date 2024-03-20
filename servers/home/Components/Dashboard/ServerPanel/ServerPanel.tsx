import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Dropdown from "react-bootstrap/Dropdown";
import Container from "react-bootstrap/esm/Container";
import { SHARE_PORT, TARGET_PORT } from "servers/home/Constants";
import { ButtonGroup } from "react-bootstrap";
import { ServerManager } from "servers/home/Utilities/ServerManagers/ServerManager";
import { store } from "servers/home/state/store";

export interface IServerPanelProps {
    ns: NS;
    sm: ServerManager;
    show: boolean;
    onClose: (saved: boolean, info: IServerPanelInfo) => void;
}

export interface IServerPanelInfo {
    IsBuying: boolean;
    IsHacking: boolean;
    Target: string;
    MaxRam: number;
    HackType: number;
}

export const ServerPanel = ({ ns, sm, show, onClose }: IServerPanelProps) => {
    const [isHacking, setIsHacking] = useState(
        store.getState().servermanager.Hacking
    );
    const [isBuying, setIsBuying] = useState(
        store.getState().servermanager.Buying
    );
    const [hackType, setHackType] = useState(
        store.getState().servermanager.HackType
    );

    const [ramSize, setRamSize] = useState(
        store.getState().servermanager.MaxRam
    );
    const [target, setTarget] = useState(store.getState().servermanager.Target);
    const [serverList, setServerList] = useState([]);
    const [ramSizes, setRamSizes] = useState([]);

    useEffect(() => {
        const tempRamSizes = [];
        ns.getPurchasedServerMaxRam();
        let lastRamSize = 8;
        tempRamSizes.push(lastRamSize);
        while (lastRamSize < ns.getPurchasedServerMaxRam()) {
            lastRamSize *= 2;
            tempRamSizes.push(lastRamSize);
        }
        setRamSizes(tempRamSizes);
    }, []);

    useEffect(() => {
        const newTarget = ns.peek(TARGET_PORT);
        if (newTarget === "NULL PORT DATA") {
            ns.writePort(TARGET_PORT, "n00dles");
        } else {
            setTarget(newTarget);
        }
        const servers = sm.GetPublicServers();
        setServerList(servers);
    }, []);

    const handleClose = (saved: boolean) => {
        onClose(saved, {
            IsBuying: isBuying,
            IsHacking: isHacking,
            Target: target,
            MaxRam: ramSize,
            HackType: hackType,
        });
    };

    const onHackTarget = () => {
        setIsHacking(!isHacking);
    };

    const onServerSizeChange = (eventKey: string) => {
        setRamSize(Number(eventKey));
    };

    const onChangeTarget = (eventKey: string) => {
        setTarget(eventKey);
    };

    const onBuyServers = () => {
        setIsBuying(!isBuying);
    };

    const changeHack = (type: number) => {
        setHackType(type);
    };

    return (
        <Modal show={show} onHide={() => handleClose(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Server Management Panel</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Container
                    fluid="md"
                    style={{
                        borderBottom: "5px solid",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                    }}
                >
                    <div className="d-grid gap-2">
                        <Button
                            variant={isHacking ? "danger" : "success"}
                            onClick={onHackTarget}
                        >
                            Hacking
                        </Button>
                        <ButtonGroup aria-label="hackType">
                            <Button
                                variant="primary"
                                onClick={() => changeHack(0)}
                                active={hackType === 0}
                            >
                                Basic
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => changeHack(1)}
                                active={hackType === 1}
                            >
                                Batch
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => changeHack(2)}
                                active={hackType === 2}
                            >
                                Share
                            </Button>
                        </ButtonGroup>
                        <Dropdown onSelect={onChangeTarget} className="d-grid">
                            <Dropdown.Toggle variant="primary" id="serverSize">
                                Target: {target}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {serverList.map((server) => {
                                    return (
                                        <Dropdown.Item eventKey={server}>
                                            {server}
                                        </Dropdown.Item>
                                    );
                                })}
                            </Dropdown.Menu>
                        </Dropdown>
                        <Button
                            variant={isBuying ? "danger" : "success"}
                            onClick={onBuyServers}
                        >
                            Servers
                        </Button>
                        <Dropdown
                            onSelect={onServerSizeChange}
                            className="d-grid"
                        >
                            <Dropdown.Toggle variant="primary" id="serverSize">
                                Server Size {ramSize}GB
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {ramSizes.map((size) => {
                                    return (
                                        <Dropdown.Item eventKey={size}>
                                            {size}GB
                                        </Dropdown.Item>
                                    );
                                })}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Container>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={() => handleClose(true)}>Save</Button>
                <Button onClick={() => handleClose(false)}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
};
