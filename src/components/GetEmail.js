import React, {Component} from 'react';
import {RadioButton} from 'primereact/radiobutton';
import {InputText} from 'primereact/inputtext';
import {Col, Row, Button} from 'react-bootstrap';
import './GetEmail.css';
import axios from 'axios';
import FileUpload from "../core/FileUpload";
import MsgReader from '@freiraum/msgreader';
import {Panel} from 'primereact/panel';
import emlformat from 'eml-format';
import {MultiSelect} from 'primereact/multiselect';
import {Growl} from 'primereact/growl';


function ab2str(buf) {
    return new TextDecoder("utf-8").decode(buf);
}

class GetEmail extends Component {

    state = {
        adSoyad: "",
        file: null,
        fileBase64: null,
    };

    handleButtonClick = () => {
        console.log("handle button click");

        var fileReader = new FileReader();
        fileReader.onload = (evt) => {
            let fileResult = evt.target.result;
            let fileName = this.state.file.name;
            if(fileName.endsWith(".eml")){
                let strOfEml = ab2str(fileResult);
                emlformat.read(strOfEml, (error, data) => {
                    if (error){
                        this.growl.show({severity: 'error', summary: 'Error', detail: "error"});
                    }
                    this.sendGatheredInfo(data);
                });

            }
            else if(fileName.endsWith(".msg")) {
                let msg = new MsgReader(evt.target.result);
                let data = msg.getFileData();
                this.sendGatheredInfo(data);
            }
            else {
                this.growl.show({severity: 'error', summary: 'Error', detail: "File is neither msg nor eml"});
            }
        };
        if(this.state.file) {
            fileReader.readAsArrayBuffer(this.state.file);
        }
        else {
            this.growl.show({severity: 'error', summary: 'Error', detail: "File is not uploaded"});
        }

    };

    sendGatheredInfo = (parsedEmailResult) => {
        let postObject = {...this.state, parsedEmailResult};

        axios.post("http://localhost:8080/gonderileceklink", postObject)
            .then((result) => {
                this.growl.show({severity: 'success', summary: 'Başarılı', detail: "İşlem Başarılı"});
                this.setState({basariylaGonderdi: true});
            })
            .catch((error) => {
                this.growl.show({severity: 'error', summary: 'Error', detail: "error"});
            });
    };

    render() {
        const cryptocurrencies = require('cryptocurrencies');

        const valuelar = Object.values(cryptocurrencies);

        const valueDeger = valuelar.map((val) => {
            return {label: ""+ val, value: val};
        });

        let icerik = <div>
            <Panel className="myPanel" bordered header={"This tool automatically removes your personal data (email address, name etc.)"}>
                <Row className="myRow">
                    <Col xs={6} md={6} className="kelimeler">If you allow us to access you for further enquiries regarding GDPR and Blockchain, please click the consent button</Col>
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
                <Row className="myRow" hidden={this.state.isimGizliMi !== "Evet"}>
                    <Col xs={6} md={6} className="kelimeler">Full Name</Col>
                    <Col xs={6} md={4}>
                        <InputText className="myInput" value={this.state.adSoyad} onChange={(e) => {
                            this.setState({adSoyad: e.target.value})
                        }}
                        />
                    </Col>
                </Row>
                <Row className="myRow">
                    <Col xs={6} md={6} className="kelimeler">Distributed Ledger Systems</Col>
                    <Col xs={6} md={4}>
                        <MultiSelect className="myInput" value={this.state.cryptocurrencies2} options={valueDeger} onChange={(e) => this.setState({cryptocurrencies2: e.value})} filter={true} placeholder="Choose"  />
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
                <Row className="submitButton">
                    <Col><Button onClick={() => {
                        this.handleButtonClick()
                    }} variant="primary">Submit</Button></Col>

                </Row>
            </Panel>
            <Col className="uyari">If you don't know how to convert your email to an eml or msg file, please forward your email to [your email address].</Col>
        </div>;
        if(this.state.basariylaGonderdi){
            icerik = <div>basarili</div>;
        }


        return <div>
            <Growl ref={(el) => this.growl = el} />
            {icerik}
        </div>;
    }
}

export default GetEmail;