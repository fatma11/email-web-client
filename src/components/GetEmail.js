import React, {Component} from 'react';
import {RadioButton} from 'primereact/radiobutton';
import {InputText} from 'primereact/inputtext';
import {Col, Row, Button} from 'react-bootstrap';
import './GetEmail.css';
import axios from 'axios';
import FileUpload from "../core/FileUpload";

class GetEmail extends Component {

    state = {
        adSoyad: "",
        file: null,
    };

    handleButtonClick = () => {
        console.log("handle button click");
        axios.post("http://localhost:8080/gonderileceklink", this.state)
            .then((result) => {
            console.log("islem başarılı");
        })
        .catch((error) => {
            console.log("islem başarısız");
            console.log(error);
        });
    };

    render(){
        return <div>
            <Row>
                <Col>İsim gizli mi olsun?</Col>
                <Col>
                    <div className="isim-radio-button" >
                        <div className="isim-radio-button" >
                            <RadioButton inputId="rb1" name="city" value="Evet" onChange={(e) => this.setState({isimGizliMi: e.value})} checked={this.state.isimGizliMi === 'Evet'} />
                            <label htmlFor="rb1" className="p-radiobutton-label">Evet</label>
                        </div>

                        <div className="isim-radio-button" >
                            <RadioButton inputId="rb2" name="city" value="Hayir" onChange={(e) => this.setState({isimGizliMi: e.value})} checked={this.state.isimGizliMi === 'Hayir'} />
                            <label htmlFor="rb2" className="p-radiobutton-label">Hayır</label>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row hidden={this.state.isimGizliMi !== "Hayir"} >
                <Col>Ad-Soyad</Col>
                <Col>
                    <InputText value={this.state.adSoyad} onChange={(e) => {this.setState({adSoyad: e.target.value})}} />
                </Col>
            </Row>
            <Row >
                <Col>Dosya</Col>
                <Col>
                    <FileUpload value={this.state.file} onChange={(newFile) => {this.setState({file: newFile})}}
                    style={{width: "450px"}}/>
                </Col>
            </Row>
            <Row >
                <Col></Col>
                <Col><Button onClick={() => {this.handleButtonClick()}}
                             variant="primary" >Gönder</Button></Col>

            </Row>



        </div>;
    }
}

export default GetEmail;