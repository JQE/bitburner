import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import Button from "react-bootstrap/Button";
import { RootState } from "../../state/store";
import {
    SetBaseJob,
    SetBuyAugs,
    SetBuyEquipment,
    SetActivity,
    ActivityFocus,
} from "../../state/GangManager/GangManagerSlice";
import { ButtonGroup, Dropdown } from "react-bootstrap";

interface IGangPanelProps {
    ns: NS;
    show: boolean;
    onClose: () => void;
}

export const GangPanel = ({ ns, show, onClose }: IGangPanelProps) => {
    const dispatch = useAppDispatch();
    const buystate = useAppSelector((state: RootState) => {
        return state.gangmanager.Buy;
    });

    const jobstate = useAppSelector((state: RootState) => {
        return state.gangmanager.BaseJob;
    });

    const activitystate = useAppSelector((state: RootState) => {
        return state.gangmanager.Activity;
    });
    const augstate = useAppSelector((state: RootState) => {
        return state.gangmanager.BuyAugs;
    });

    const [jobList, setJobList] = useState<string[]>([]);
    const [job, setJob] = useState(jobstate);
    const [buy, setBuy] = useState(buystate);
    const [activity, setActivity] = useState<ActivityFocus>(activitystate);
    const [augs, setAugs] = useState(augstate);

    useEffect(() => {
        const jobs = ns.gang.getTaskNames();
        setJobList(jobs);
    }, []);

    const handleSave = () => {
        dispatch(SetBuyEquipment(buy));
        dispatch(SetBaseJob(job));
        dispatch(SetActivity(activity));
        dispatch(SetBuyAugs(augs));
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    const handleClickRep = (selection: number) => {
        setActivity(selection);
    };

    const handleClickBuy = () => {
        setBuy(!buy);
    };

    const handleClickBuyAugs = () => {
        setAugs(!augs);
    };

    const onChangeJob = (eventKey: string) => {
        setJob(eventKey);
    };

    return (
        <div
            className="modal show"
            style={{ display: "block", position: "initial" }}
        >
            <Modal show={show} onHide={handleClose} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Gang Controls</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="d-grid gap-2">
                        <Button
                            variant={buy ? "danger" : "success"}
                            onClick={handleClickBuy}
                        >
                            Buy Equipment
                        </Button>{" "}
                        <Button
                            variant={augs ? "danger" : "success"}
                            onClick={handleClickBuyAugs}
                        >
                            Buy Augments
                        </Button>
                        <ButtonGroup>
                            <Button
                                active={activity === ActivityFocus.Money}
                                onClick={() =>
                                    handleClickRep(ActivityFocus.Money)
                                }
                            >
                                Money
                            </Button>
                            <Button
                                active={activity === ActivityFocus.Respect}
                                onClick={() =>
                                    handleClickRep(ActivityFocus.Respect)
                                }
                            >
                                Respect
                            </Button>
                            <Button
                                active={activity === ActivityFocus.Warfare}
                                onClick={() =>
                                    handleClickRep(ActivityFocus.Warfare)
                                }
                            >
                                Warfare
                            </Button>
                            <Button
                                active={activity === ActivityFocus.Balance}
                                onClick={() =>
                                    handleClickRep(ActivityFocus.Balance)
                                }
                            >
                                Balance
                            </Button>
                        </ButtonGroup>
                        <Dropdown onSelect={onChangeJob} className="d-grid">
                            <Dropdown.Toggle variant="primary" id="serverSize">
                                Job: {job}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {jobList.map((task) => {
                                    return (
                                        <Dropdown.Item eventKey={task}>
                                            {task}
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
