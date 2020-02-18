import React, {Component} from 'react';
import {RadioButton} from 'primereact/radiobutton';
import {InputText} from 'primereact/inputtext';
import {Col, Row, Button} from 'react-bootstrap';
import './GetEmail.css';
import axios from 'axios';
import FileUpload from "../core/FileUpload";
import MsgReader from '@freiraum/msgreader';
import fs from 'fs';
import {Panel} from 'primereact/panel';

//var fs = require('fs');

class GetEmail extends Component {

    state = {
        adSoyad: "",
        file: null,
        fileBase64: null,
    };

    handleButtonClick = () => {
        console.log("handle button click");


        //let msgFileBuffer = fs.readFileSync(this.state.file);
        var fileReader = new FileReader();
        fileReader.onload = (evt) => {
            let testMsg = new MsgReader(evt.target.result);
            let testMsgInfo = testMsg.getFileData();
            console.log(testMsgInfo);

            // bunu neden yapmamız gerekti
            let postObject = {...this.state, testMsgInfo};

            axios.post("http://localhost:8080/gonderileceklink", postObject)
                .then((result) => {
                    console.log("islem başarılı");
                })
                .catch((error) => {
                    console.log("islem başarısız");
                    console.log(error);
                });
        };
        fileReader.readAsArrayBuffer(this.state.file);


    };

    render() {
        return <div>
            <Panel className="myPanel" bordered>
                <Row className="myRow">
                    <Col xs={6} md={6} className="kelimeler">Would you like to hide your name and surname?</Col>
                    <Col xs={6} md={4}>
                        <div className="isim-radio-button">
                            <div className="isim-radio-button">
                                <RadioButton inputId="rb1" name="city" value="Evet"
                                             onChange={(e) => this.setState({isimGizliMi: e.value})}
                                             checked={this.state.isimGizliMi === 'Evet'}/>
                                <label htmlFor="rb1" className="p-radiobutton-label">Yes</label>
                            </div>

                            <div className="isim-radio-button">
                                <RadioButton inputId="rb2" name="city" value="Hayir"
                                             onChange={(e) => this.setState({isimGizliMi: e.value})}
                                             checked={this.state.isimGizliMi === 'Hayir'}/>
                                <label htmlFor="rb2" className="p-radiobutton-label">No</label>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row className="myRow" hidden={this.state.isimGizliMi !== "Hayir"}>
                    <Col xs={6} md={6} className="kelimeler">Name-Surname</Col>
                    <Col xs={6} md={4}>
                        <InputText className="myInput" value={this.state.adSoyad} onChange={(e) => {
                            this.setState({adSoyad: e.target.value})
                        }}
                          />
                    </Col>
                </Row>
                <Row className="myRow">
                    <Col xs={6} md={6} className="kelimeler">File (Please upload the file extension in eml or msg format)</Col>
                    <Col>
                        <FileUpload value={this.state.fileBase64} onChange={(newFileBase64, newFile) => {
                            this.setState({fileBase64: newFileBase64, file: newFile})
                        }}
                                    style={{width: "250px"}}/>
                    </Col>
                </Row>
                <Row>
                    <Col><Button onClick={() => {
                        this.handleButtonClick()
                    }} variant="primary">Submit</Button></Col>

                </Row>
            </Panel>
        </div>;
    }
}

export default GetEmail;