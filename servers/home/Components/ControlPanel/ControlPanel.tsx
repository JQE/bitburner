import React from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export const ControlPanel = () => {
    return (
        <>
            <h3>Control Panel</h3>
            <Container fluid>
                <Row>
                    <Col>
                        <div className="d-grid gap-2">
                            <Button size="lg">Gangs</Button>
                        </div>
                    </Col>
                    <Col>
                        <div className="d-grid gap-2">
                            <Button size="lg">Batcher</Button>
                        </div>
                    </Col>
                </Row>
                <Row style={{ marginTop: "10px" }}>
                    <Col>
                        <div className="d-grid gap-2">
                            <Button size="lg">Server Manager</Button>
                        </div>
                    </Col>
                    <Col></Col>
                </Row>
            </Container>
        </>
    );
};
