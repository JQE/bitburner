import React, { ChangeEvent, useEffect, useState } from "react";
import { MainHack } from "../../mainHack";
import { ServerManager } from "../../ServerManger";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { setMaxRam } from "../../state/ServerManager/ServerManagerSlice";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import { HacknetManager } from "../../HacknetManager";
import { RootState } from "../../state/store";
import Container from "react-bootstrap/esm/Container";
import { SHARE_PORT, TARGET_PORT } from "../../Constants";

interface IControlButtonsProps {
    ns: NS;
    mh: MainHack;
    sm: ServerManager;
    hnm: HacknetManager;
}

export const ControlButtons = ({ ns, mh, sm, hnm }: IControlButtonsProps) => {
    let hacknetsize = useAppSelector(
        (state: RootState) => state.hacknetmanager.Count
    );
    const [isHacking, setIsHacking] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [isSharing, setIsSharing] = useState("false");
    const [isBuyHacknet, setIsBuyHacknet] = useState(hnm.isBuying());
    const [hacknetCount, setHacknetCount] = useState(hacknetsize);
    const [ramSize, setRamSize] = useState(8);
    const [target, setTarget] = useState("n00dles");
    const [serverList, setServerList] = useState([]);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const newTarget = ns.peek(TARGET_PORT);
        if (newTarget === "NULL PORT DATA") {
            ns.writePort(TARGET_PORT, "n00dles");
        } else {
            setTarget(newTarget);
        }

        const sharePort = ns.peek(SHARE_PORT);
        if (sharePort === "NULL PORT DATA") {
            ns.writePort(SHARE_PORT, isSharing);
        }
    }, []);

    useEffect(() => {
        const servers = sm.getPublicServers();
        const newList = [];
        Object.keys(servers).forEach((server) => {
            newList.push(server);
        });
        setServerList(newList);
    }, []);

    const maxHacknet = useAppSelector(
        (state: RootState) => state.hacknetmanager.MaxNodes
    );

    const ramSizes = [];
    ns.getPurchasedServerMaxRam();
    let lastRamSize = 8;
    ramSizes.push(lastRamSize);
    while (lastRamSize < ns.getPurchasedServerMaxRam()) {
        lastRamSize *= 2;
        ramSizes.push(lastRamSize);
    }

    const onBuyHacknet = () => {
        hnm.onBuy();
        setIsBuyHacknet(hnm.isBuying());
    };

    const onHackTarget = () => {
        mh.hack();
        setIsHacking(mh.isHacking());
    };

    const onShare = () => {
        isSharing === "true" ? setIsSharing("false") : setIsSharing("true");
        ns.clearPort(SHARE_PORT);
        ns.writePort(SHARE_PORT, isSharing);
    };

    const onBuyServers = () => {
        sm.buyServers();
        setIsBuying(sm.isBuying());
    };

    if (mh.isHacking()) {
        if (mh.checkTools()) {
            mh.restartHack();
        }
    }

    const onServerSizeChange = (eventKey: string) => {
        setRamSize(Number(eventKey));
        dispatch(setMaxRam(Number(eventKey)));
    };

    const onHacknetCountChange = (event: ChangeEvent<HTMLInputElement>) => {
        setHacknetCount(Number(event.currentTarget.value));
        hnm.setNumServers(Number(event.currentTarget.value));
    };

    const onChangeTarget = (eventKey: string) => {
        setTarget(eventKey);
        ns.clearPort(TARGET_PORT);
        ns.writePort(TARGET_PORT, eventKey);
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
                <Button
                    variant={isHacking ? "danger" : "success"}
                    onClick={onHackTarget}
                >
                    Hacking
                </Button>
                <Button
                    variant={isSharing === "true" ? "danger" : "success"}
                    onClick={onShare}
                >
                    XP Only
                </Button>
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
                <Dropdown onSelect={onServerSizeChange} className="d-grid">
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
                <Button
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
                </div>
            </div>
        </Container>
    );
};
