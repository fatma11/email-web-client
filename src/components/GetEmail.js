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
import axios from 'axios';

function ab2str(buf) {
    return new TextDecoder("utf-8").decode(buf);
}

class GetEmail extends Component {
    state = {
        adSoyad: "",
        checkedSystemName: [],
        file: null,
        fileBase64: null,
        basariylaGonderdi: false,
        useremail: "",
        isimGizliMi: "Hayir",
        valueDeger: []
    };

    componentDidMount() {
        axios
            .get('https://api.coincap.io/v2/assets?limit=2000')
            .then(res => {
                const currencies = res.data.data;
                const valueDeger = currencies.map((val) => {
                    return {label: "" + val.name, value: val.name};
                });

                this.setState({valueDeger: valueDeger});
            })
    }

    addNewEmail = (body, distributedLedgerSystem, filename, fullname, email, recipientEmails, senderDate, senderEmail, senderName, subject, raw) => {
        if(!body){
            body=null;
        }
        if(!distributedLedgerSystem){
            distributedLedgerSystem=null;
        }
        if(!filename){
            filename=null;
        }
        if(!fullname){
            fullname=null;
        }
        if(!email){
            email=null;
        }
        if(!recipientEmails){
            recipientEmails=null;
        }
        if(!senderDate){
            senderDate=null;
        }
        if(!senderEmail){
            senderEmail=null;
        }
        if(!senderName){
            senderName=null;
        }
        if(!subject){
            subject=null;
        }
        firebase.firestore().collection('emails').add({
            body: body,
            distributed_ledger_system: distributedLedgerSystem,
            filename: filename,
            fullname: fullname,
            email: email,
            recipient_emails: recipientEmails,
            sender_date: senderDate,
            sender_email: senderEmail,
            sender_name: senderName,
            subject: subject,
            raw:raw
        }).catch((error) => {
            console.log(error);
            this.setState({basariylaGonderdi: false});
            this.growl.show({severity: 'error', summary: 'Error', detail: "Database connection is lost"});
        });

        this.setState({basariylaGonderdi: true});
    };

    kurallarUygun = () => {
        var uygun = true;

        if (this.state.isimGizliMi || typeof(this.state.isimGizliMi) === 'undefined' || this.state.isimGizliMi == null) {
            if ((this.state.isimGizliMi === 'Evet' && !this.state.adSoyad) || typeof(this.state.isimGizliMi) === 'undefined' || (this.state.isimGizliMi === 'Evet' && !this.state.useremail)) {
                this.setState({fullnameError: true});
                uygun = false;
            }
        }

        if (this.state.checkedSystem || typeof(this.state.checkedSystem) === 'undefined' || this.state.checkedSystem == null) {
            if (this.state.checkedSystemName.length <= 0) {
                this.setState({fullCheckedSystemNameError: true});
                uygun = false;
            }
        }

        return uygun;
    };

    handleButtonClick = () => {
        if (this.kurallarUygun()) {
            var fileReader = new FileReader();
            fileReader.onload = (evt) => {
                let fileResult = evt.target.result;
                let fileName = this.state.file.name;
                if (fileName.endsWith(".eml")) {
                    let strOfEml = ab2str(fileResult);
                    emlformat.read(strOfEml, (error, data) => {
                        if (error) {
                            this.growl.show({severity: 'error', summary: 'Error', detail: "error"});
                        }
                        else {
                            this.sendGatheredInfoEml(data);
                        }
                    });

                }
                else if (fileName.endsWith(".msg")) {
                    let msg = new MsgReader(evt.target.result);
                    let data = msg.getFileData();
                    this.sendGatheredInfoMsg(data);
                }
                else {
                    this.growl.show({severity: 'error', summary: 'Error', detail: "File is neither msg nor eml"});
                }
            };
            if (this.state.file) {
                fileReader.readAsArrayBuffer(this.state.file);
            }
            else {
                this.growl.show({severity: 'error', summary: 'Error', detail: "File is not uploaded"});
            }
        } else {
            this.growl.show({severity: 'info', summary: 'Info Message', detail: 'Please fill in the required fields'});
        }

    };

    getMsgDate = (rawHeaders) => {
        var headers = this.parseHeaders(rawHeaders);
        if (!headers['Date']) {
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
        let recipients;
        if (parsedEmailResult.recipients[0].email) {
             recipients = postObject.parsedEmailResult.recipients.map((item) => item.email);
        } else {
             recipients = postObject.parsedEmailResult.recipients.map((item) => item.name);
        }
        this.addNewEmail(postObject.parsedEmailResult.body, this.state.checkedSystemName, postObject.file.name, this.state.adSoyad, this.state.useremail, recipients, this.getMsgDate(postObject.parsedEmailResult.headers), postObject.parsedEmailResult.senderEmail, postObject.parsedEmailResult.senderName, postObject.parsedEmailResult.subject, postObject.parsedEmailResult);
    };

    sendGatheredInfoEml = (parsedEmailResult) => {
        let postObject = {...this.state, parsedEmailResult};
        let recipients = [];
        if (postObject.parsedEmailResult.cc) {
            if (postObject.parsedEmailResult.cc.length > 0) {
                if (postObject.parsedEmailResult.cc[0].email) {
                    recipients = postObject.parsedEmailResult.cc.map((item) => item.email);
                } else {
                    recipients = postObject.parsedEmailResult.cc.map((item) => item.name);
                }
            }
            else {
                if(postObject.parsedEmailResult.cc.email){
                    recipients.push(postObject.parsedEmailResult.cc.email);
                }else{
                    recipients.push(postObject.parsedEmailResult.cc.name);
                }
            }
        }

        if (postObject.parsedEmailResult.to.length > 0) {
            postObject.parsedEmailResult.to.forEach((item) => {
                if(item.email){
                    recipients.push(item.email);
                }else{
                    recipients.push((item.name))
                }
            });
        }
        else {
            if(postObject.parsedEmailResult.to.email){
                recipients.push(postObject.parsedEmailResult.to.email);
            }else{
                recipients.push(postObject.parsedEmailResult.to.name);
            }
        }

        this.addNewEmail(postObject.parsedEmailResult.text, this.state.checkedSystemName, postObject.file.name, this.state.adSoyad, this.state.useremail, recipients, postObject.parsedEmailResult.date, postObject.parsedEmailResult.from.email, postObject.parsedEmailResult.from.name, postObject.parsedEmailResult.subject, postObject.parsedEmailResult);
    };

    render() {
        let giris =
            <div className="myPanelWrapper">
                <Panel className="myPanel">
                    <Row className="myRow">
                        <Col md={2} className="kelimeler bold">Title of project:</Col>
                        <Col className="kelimeler">GDPR notification emails</Col>
                    </Row>
                    <Row>
                        <Col md={2} className="kelimeler bold">The research team:</Col>
                        <Col className="kelimeler">Muhammed Abdullah Bülbül and Fatma Emül, Ankara Yıldırım Beyazıt Üniversitesi, Turkey</Col>
                    </Row>
                    <Row>
                        <Col md={2}></Col>
                        <Col className="kelimeler">(abulbul@ybu.edu.tr, fatma.emul@tubitak.gov.tr)</Col>
                    </Row>
                    <Row >
                        <Col md={2}></Col>
                        <Col className="kelimeler">Rahime Belen-Saglam and Shujun Li, University of Kent, UK</Col>
                    </Row>
                    <Row className="myRow">
                        <Col md={2}></Col>
                        <Col className="kelimeler">(R.Belen-Saglam-724@kent.ac.uk, S.J.Li@kent.ac.uk)</Col>
                    </Row>
                </Panel>


                <Panel className="myPanel" bordered header={"The our purpose of the research"}>
                    <Row className="myRow">
                        <Col className="kelimeler">
                            We are conducting this research in order to better understand how blockchain service providers and developers communicated GDPR to their users via email and how their users perceived GDPR and such email communications. A better understanding will help the whole sector to find better ways to make blockchain systems more GDPR compliant and privacy friendly. We would be glad if you help us as end users of existing blockchain systems. All you have to do is to share GDPR related mails you have received from blockchain systems and development teams you have been using. All emails we received from you will be anonymised to remove any personal data that can potentially identify you. The anonymised data will be used by the research team at the Yıldırım Beyazıt Üniversitesi in Turkey and the University of Kent in the UK (see the above or their names and contact details). If you decide to share your name and your email address with us for follow-up communications (e.g., to clarify personalised content in the emails you share and to collect your personal opinions on such emails), such personal data will be stored on Firebase under Google's control (as the data collection platform) and then securely stored on the research team's computers. Such data will be kept on Firebase and the research team's computers only until the end of the research, after which they will be permanently and securely deleted from all storage media. Any research publications from this research will not include any personal data.
                        </Col>
                    </Row>

                </Panel>

                <Panel className="myPanel" bordered header={"Consent Form"}>
                    <Row className="myRow">
                        <Col xs={6} md={9} className="kelimeler">Please click all the check boxes below to give your consent.</Col>
                    </Row>
                    <Row className="myRow">
                        <Col xs={6} md={9} className="kelimeler">1- I confirm I have read and understood the purpose of the research described above.</Col>
                        <Col> <Checkbox onChange={e => this.setState({checked1: e.checked})}
                                        checked={this.state.checked1}></Checkbox></Col>
                    </Row>
                    <Row className="myRow">
                        <Col xs={6} md={9} className="kelimeler">2- I understand that my participation is voluntary and that I am free to withdraw at any time without giving any reason. Please contact [infogdpr20@gmail.com] if you would like to withdraw.</Col>
                        <Col> <Checkbox onChange={e => this.setState({checked2: e.checked})}
                                        checked={this.state.checked2}></Checkbox></Col>
                    </Row>
                    <Row className="myRow">
                        <Col xs={6} md={9} className="kelimeler">3- I understand that my responses will be anonymised before analysis. I give permission for members of the research team to have access to my anonymised responses.</Col>
                        <Col> <Checkbox onChange={e => this.setState({checked3: e.checked})}
                                        checked={this.state.checked3}></Checkbox></Col>
                    </Row>
                    <Row className="myRow">
                        <Col xs={6} md={9} className="kelimeler">4- I understand that if I decide to share my name and my email address, they will be stored in Firebase under Google's control (as the data collection platform) and on the research team's computers. Such data will be kept until the research is completed, after which they will be permanently and securely deleted.</Col>
                        <Col> <Checkbox onChange={e => this.setState({checked4: e.checked})}
                                        checked={this.state.checked4}></Checkbox></Col>
                    </Row>
                    <Row className="myRow">
                        <Col xs={6} md={9} className="kelimeler">5- I agree to take part in the above research project.</Col>
                        <Col> <Checkbox onChange={e => this.setState({checked5: e.checked})}
                                        checked={this.state.checked5}></Checkbox></Col>
                    </Row>
                    <Row className="submitButton">
                        <Col><Button onClick={() => {
                            if (this.state.checked1 === true
                                && this.state.checked2 === true
                                && this.state.checked3 === true
                                && this.state.checked4 === true
                                && this.state.checked5 === true
                            ) {
                                this.setState({next: true})
                            } else {
                                this.growl.show({
                                    severity: 'info',
                                    summary: 'Info Message',
                                    detail: 'Please click the all checkboxes to continue'
                                });
                            }
                        }} variant="primary">Next</Button></Col>

                    </Row>
                </Panel>

            </div>;

        let fullNameInputClassName = "myInput";
        if (this.state.fullnameError) {
            fullNameInputClassName += " has-error";
        }

        let fullNameLabelClassName = "kelimeler";
        if (this.state.fullnameError) {
            fullNameLabelClassName += " has-error";
        }

        let fullCheckedSystemNameInputClassName = "myInput";
        if (this.state.fullCheckedSystemNameError) {
            fullCheckedSystemNameInputClassName += " has-error";
        }

        let fullCheckedSystemNameLabelClassName = "kelimeler";
        if (this.state.fullCheckedSystemNameError) {
            fullCheckedSystemNameLabelClassName += " has-error";
        }

        let icerik = <div className="myPanelWrapper">
            <Panel className="myPanel" bordered
                   header={"The email collection system will automatically remove your personal data (email address, name, IP addresses, etc.) from the submitted email."}>
                <Row className="myRow">
                    <Col xs={6} md={6} className={fullNameLabelClassName}>If you allow us to contact you for further enquiries, please select 'Yes', otherwise select 'No'.</Col>
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
                    <Col xs={6} md={6} className={fullNameLabelClassName}>Full name</Col>
                    <Col xs={6} md={4}>
                        <InputText className={fullNameInputClassName} value={this.state.adSoyad} onChange={(e) => {
                            this.setState({adSoyad: e.target.value})
                        }}
                        />
                    </Col>
                </Row>
                <Row className="myRow" hidden={this.state.isimGizliMi !== "Evet"}>
                    <Col xs={6} md={6} className={fullNameLabelClassName}>Email address</Col>
                    <Col xs={6} md={4}>
                        <InputText className={fullNameInputClassName} value={this.state.useremail} onChange={(e) => {
                            this.setState({useremail: e.target.value})
                        }}
                        />
                    </Col>
                </Row>
                <Row className="myRow" hidden={this.state.checkedSystem === true}>
                    <Col xs={6} md={6} className={fullCheckedSystemNameLabelClassName}>A distributed ledger system for which you received a GDPR email</Col>
                    <Col md="auto">
                        <Select options={this.state.valueDeger} isMulti={false} className="myInput"
                                onChange={(e) => {
                                    this.setState({checkedSystemName: e.value})}}/>
                    </Col>
                    <Col>
                        <Checkbox onChange={e => this.setState({checkedSystem: e.checked})}
                                  checked={this.state.checkedSystem}></Checkbox>
                        <label htmlFor="cb1" className="p-checkbox-label">Other</label>
                    </Col>
                </Row>
                <Row className="myRow" hidden={this.state.checkedSystem !== true}>
                    <Col xs={6} md={6} className={fullCheckedSystemNameLabelClassName}>A distributed ledger system for which you received a GDPR email</Col>
                    <Col xs={6} md={4}>
                        <InputText className={fullCheckedSystemNameInputClassName} value={this.state.checkedSystemName}
                                   onChange={(e) => {
                                       this.setState({checkedSystemName: e.target.value})
                                   }}
                        />
                    </Col>
                    <Col>
                        <Checkbox onChange={e => this.setState({checkedSystem: e.checked})}
                                  checked={this.state.checkedSystem}></Checkbox>
                        <label htmlFor="cb1" className="p-checkbox-label">Other</label>
                    </Col>
                </Row>
                <Row className="myRow">
                    <Col xs={6} md={6} className="kelimeler">GDPR
                        email you received (please upload as an .eml or a .msg file)</Col>
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
            <Col className="uyari myPanelWrapper">If you don't know how to convert your email to an .eml or .msg file, please forward your email to [infogdpr20@gmail.com].</Col>
        </div>;

        let son = <div className="myPanelWrapper">
            <Row>
                <Col className="basarili">Your email has been successfully received.</Col>
            </Row>
            <Row>
                <Col className="thanks">Thank you for your contribution. </Col>
            </Row>
        </div>;

        if (this.state.basariylaGonderdi) {
            giris = son;
        }

        if (this.state.next && !this.state.basariylaGonderdi) {
            giris = icerik;
        }

        return <div>
            <Growl ref={(el) => this.growl = el}/>
            {giris}
        </div>;
    }
}

export default GetEmail;