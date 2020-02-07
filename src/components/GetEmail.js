import React, {Component} from 'react';
import {RadioButton} from 'primereact/radiobutton';
import {Col, Row} from 'react-bootstrap';
import './GetEmail.css';

class GetEmail extends Component {

    state = {

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



        </div>;
    }
}

export default GetEmail;