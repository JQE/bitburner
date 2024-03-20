import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { TARGET_PORT } from "../../Constants";
import { ServerManager } from "../../ServerManger";
import Dropdown from "react-bootstrap/esm/Dropdown";
import {
    SetBuying,
    SetHackType,
    SetHacking,
    SetMaxRam,
    SetTarget,
} from "../../state/ServerManager/ServerManagerSlice";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import { RootState } from "../../state/store";

interface IServerPanelProps {
    ns: NS;
    sm: ServerManager;
    show: boolean;
    onClose: () => void;
}

export const ServerPanel = ({ ns, sm, show, onClose }: IServerPanelProps) => {
    const [serverList, setServerList] = useState([]);
    const [ramSizes, setRamSizes] = useState([]);
    const dispatch = useAppDispatch();
    const serverInfo = useAppSelector(
        (state: RootState) => state.servermanager
    );

    const [buying, setBuying] = useState(serverInfo.Buying);
    const [hacking, setHacking] = useState(serverInfo.Hacking);
    const [maxRam, setMaxRam] = useState(serverInfo.MaxRam);
    const [hackType, setHackType] = useState(serverInfo.HackType);
    const [target, setTarget] = useState(serverInfo.Target);

    useEffect(() => {
        const servers = sm.getPublicServers();
        setServerList(servers);
    }, []);

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

    const onBuyServers = () => {
        setBuying(!buying);
    };

    const onHackTarget = () => {
        setHacking(!hacking);
    };

    const onServerSizeChange = (eventKey: string) => {
        setMaxRam(Number(eventKey));
    };

    const onChangeTarget = (eventKey: string) => {
        setTarget(eventKey);
    };

    const onChangeHackMethod = (value) => {
        setHackType(value);
    };

    const handleSave = () => {
        dispatch(SetMaxRam(maxRam));
        dispatch(SetTarget(target));
        dispatch(SetHackType(hackType));
        dispatch(SetHacking(hacking));
        dispatch(SetBuying(buying));
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <div
            className="modal show"
            style={{ display: "block", position: "initial" }}
        >
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Server Controls</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="d-grid gap-2">
                        <Button
                            variant={hacking ? "danger" : "success"}
                            onClick={onHackTarget}
                        >
                            Hacking
                        </Button>
                        <ButtonGroup>
                            <Button
                                value={0}
                                id="Basic"
                                active={hackType === 0}
                                onClick={() => onChangeHackMethod(0)}
                            >
                                Basic
                            </Button>
                            <Button
                                value={1}
                                id="Share"
                                active={hackType === 1}
                                onClick={() => onChangeHackMethod(1)}
                            >
                                Share
                            </Button>
                            <Button
                                value={2}
                                id="Batch"
                                active={hackType === 2}
                                onClick={() => onChangeHackMethod(2)}
                            >
                                Batch
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
                            variant={buying ? "danger" : "success"}
                            onClick={onBuyServers}
                        >
                            Servers
                        </Button>
                        <Dropdown
                            onSelect={onServerSizeChange}
                            className="d-grid"
                        >
                            <Dropdown.Toggle variant="primary" id="serverSize">
                                Server Size {maxRam}GB
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
