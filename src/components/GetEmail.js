import React, {Component} from 'react';
import {RadioButton} from 'primereact/radiobutton';
import {InputText} from 'primereact/inputtext';
import {Col, Row, Button} from 'react-bootstrap';
import './GetEmail.css';
import FileUpload from "../core/FileUpload";
import MsgReader from '@freiraum/msgreader';
import {Panel} from 'primereact/panel';
import emlformat from 'eml-format';
import {Growl} from 'primereact/growl';
import {Checkbox} from 'primereact/checkbox';
import Select from 'react-select';
import firebase from './firebase'

function ab2str(buf) {
    return new TextDecoder("utf-8").decode(buf);
}

class GetEmail extends Component {
    state = {
        adSoyad: "",
        checkedSystemName: [],
        file: null,
        fileBase64: null,
        basariylaGonderdi: false
    };

    addNewEmail = (body, distributedLedgerSystem, filename, fullname, recipientEmails, senderDate, senderEmail, senderName, subject) => {

        firebase.firestore().collection('emails').add({
            body: body,
            distributed_ledger_system: distributedLedgerSystem,
            filename: filename ,
            fullname: fullname ,
            recipient_emails: recipientEmails,
            sender_date: senderDate ,
            sender_email: senderEmail ,
            sender_name: senderName ,
            subject: subject
        }).catch((error) => {
            this.growl.show({severity: 'error', summary: 'Error', detail: "error"});
        });
        this.setState({basariylaGonderdi:true});
    };

    handleButtonClick = () => {
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
                    else {
                        this.sendGatheredInfoEml(data);
                    }
                });

            }
            else if(fileName.endsWith(".msg")) {
                let msg = new MsgReader(evt.target.result);
                let data = msg.getFileData();
                this.sendGatheredInfoMsg(data);
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

    getMsgDate = (rawHeaders) => {
        var headers = this.parseHeaders(rawHeaders);
        if (!headers['Date']){
            return '-';
        }
        return new Date(headers['Date']);
    };

    parseHeaders = (headers) => {
        let parsedHeaders = {};
        if (!headers) {
            return parsedHeaders;
        }
        let headerRegEx = /(.*)\: (.*)/g;
        let m = undefined;
        while (m = headerRegEx.exec(headers)) {
            parsedHeaders[m[1]] = m[2];
        }
        return parsedHeaders;
    };

    sendGatheredInfoMsg = (parsedEmailResult) => {
        let postObject = {...this.state, parsedEmailResult};
        if (postObject.parsedEmailResult.subject) {
            let recipients = postObject.parsedEmailResult.recipients.map((item) => item.email);
            this.addNewEmail(postObject.parsedEmailResult.body.toString(), this.state.checkedSystemName, postObject.file.name.toString(), this.state.adSoyad.toString(), recipients, this.getMsgDate(postObject.parsedEmailResult.headers).toString(), postObject.parsedEmailResult.senderEmail.toString(), postObject.parsedEmailResult.senderName.toString(), postObject.parsedEmailResult.subject.toString());
        }else {
            let recipients = postObject.parsedEmailResult.recipients.map((item) => item.name);
            this.addNewEmail(postObject.parsedEmailResult.body.toString(), this.state.checkedSystemName, postObject.file.name.toString(), this.state.adSoyad.toString(), recipients, this.getMsgDate(postObject.parsedEmailResult.headers).toString(), "", postObject.parsedEmailResult.senderName.toString(), "");
        }
    };

    sendGatheredInfoEml = (parsedEmailResult) => {
        let postObject = {...this.state, parsedEmailResult};
        let recipients = [];
        if (postObject.parsedEmailResult.cc){
            if(postObject.parsedEmailResult.cc.length > 0){
                recipients = postObject.parsedEmailResult.cc.map((item) => item.email);
            }
            else {
                recipients.push(postObject.parsedEmailResult.cc.email);
            }
        }

        if(postObject.parsedEmailResult.to.length > 0){
            postObject.parsedEmailResult.to.forEach((item) => {
                recipients.push(item.email);
            });
        }
        else {
            recipients.push(postObject.parsedEmailResult.to.email);
        }

        if(postObject.parsedEmailResult.subject){
            this.addNewEmail(postObject.parsedEmailResult.text.toString(), this.state.checkedSystemName, postObject.file.name.toString(), this.state.adSoyad.toString(), recipients, postObject.parsedEmailResult.date.toString(), postObject.parsedEmailResult.from.email.toString(), postObject.parsedEmailResult.from.name.toString(), postObject.parsedEmailResult.subject.toString());
        }else{
            this.addNewEmail(postObject.parsedEmailResult.text.toString(), this.state.checkedSystemName, postObject.file.name.toString(), this.state.adSoyad.toString(), recipients, postObject.parsedEmailResult.date.toString(), postObject.parsedEmailResult.from.email.toString(), postObject.parsedEmailResult.from.name.toString(), "");
        }
    };

    handleCheckedSystemNameSelect = (e) => {
        let valueMap = e.map((item) => item.value);
        this.setState({checkedSystemName: valueMap});
    };


    render() {
        const cryptocurrencies = require('cryptocurrencies');

        const valuelar = Object.values(cryptocurrencies);

        const valueDeger = valuelar.map((val) => {
            return {label: ""+ val, value: val};
        });

        let giris = <div className="myPanelWrapper" >
            <Panel className="myPanel" bordered header={"The our purpose of the research"}>
                <Row className="myRow">
                    <Col className="kelimeler">
                        We want to better understand how  blockchain service providers and developers
                        communicate GDPR to their users  via email and how their users perceive GDPR and such email communications. A better
                        understanding will help the whole sector to find better ways to make blockchain systems more GDPR friendly.
                        We will not do "name and shame" thing.
                    </Col>
                </Row>
                <Row >
                    <Col xs={6} md={7} className="kelimeler">If you want to share your mail with us, please click the checkbox to consent.</Col>
                    <Col> <Checkbox onChange={e => this.setState({checked: e.checked})} checked={this.state.checked}></Checkbox></Col>
                </Row>
                <Row className="submitButton">
                    <Col><Button onClick={() => {
                        if(this.state.checked === true){
                            this.setState({next : true})
                        }else{
                            this.growl.show({severity: 'info', summary: 'Info Message', detail: 'Please click the checkbox to continue'});
                        }
                    }} variant="primary">Next</Button></Col>

                </Row>
            </Panel>
        </div>;

                    //error veriyorsa validationlar için yap
        let fullNameInputClassName = "myInput";
        if(this.state.fullnameError){
            fullNameInputClassName += " has-error";
        }

        let fullNameLabelClassName = "kelimeler";
        if(this.state.fullnameError){
            fullNameLabelClassName += " has-error";
        }

        let icerik = <div className="myPanelWrapper" >
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
                    <Col xs={6} md={6} className={fullNameLabelClassName}>Full Name</Col>
                    <Col xs={6} md={4}>
                        <InputText className={fullNameInputClassName} value={this.state.adSoyad} onChange={(e) => {
                            this.setState({adSoyad: e.target.value})
                        }}
                        />
                    </Col>
                </Row>
                <Row className="myRow">
                    <Col xs={6} md={6} className="kelimeler">Distributed Ledger Systems</Col>
                    <Col md="auto">
                        <Select options={valueDeger} isMulti={true} className="myInput" onChange={e => this.handleCheckedSystemNameSelect(e)}/>
                    </Col>
                    <Col>
                        <Checkbox onChange={e => this.setState({checkedSystem: e.checked})} checked={this.state.checkedSystem}></Checkbox>
                        <label htmlFor="cb1" className="p-checkbox-label">Other</label>
                    </Col>
                </Row>
                <Row className="myRow" hidden={this.state.checkedSystem !== true}>
                    <Col xs={6} md={6} ></Col>
                    <Col xs={6} md={4}>
                        <InputText className="myInput" value={this.state.checkedSystemName} onChange={(e) => {
                            this.setState({checkedSystemName: e.target.value})
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
                <Row className="submitButton">
                    <Col><Button onClick={() => {
                        this.handleButtonClick()
                    }} variant="primary">Submit</Button></Col>

                </Row>
            </Panel>
            <Col className="uyari myPanelWrapper">If you don't know how to convert your email to an eml or msg file, please forward your email to [your email address].</Col>
        </div>;

        let son  = <div className="myPanelWrapper" >
                <Row>
                    <Col className="basarili">The operation is succesfully completed. </Col>
                </Row>
                 <Row>
                     <Col className="thanks">Thank you for attention. </Col>
                 </Row>
        </div>;

        if(this.state.basariylaGonderdi){
            giris = son;
        };

        if(this.state.next && !this.state.basariylaGonderdi){
            giris = icerik;
        };

        return <div>
            <Growl ref={(el) => this.growl = el} />
            {giris}
        </div>;
    }
}

export default GetEmail;