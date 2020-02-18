import React, {Component} from "react";
import PropTypes from "prop-types";
import _uniqueId from "lodash/uniqueId";
import {Button} from "react-bootstrap";
import {downloadBlob, base64ToBlob} from "../utilities/file-download";
import "./FileUpload.css";

export default class FileUpload extends Component {
    static defaultProps = {
        id: null,
        value: null,
        multiple: false,
        accept: null,
        specificFileTypes: [],
        disabled: false,
        hidden: false,
        maxFileSize: null,
        invalidFileSizeMessage: null,
        invalidFileTypeMessage: null,
        style: null,
        className: "",
        chooseLabel: "Choose",
        noFileLabel: "No Selected File/s...",
        onChange: null,
        uploadHandler: null
    };

    static propTypes = {
        id: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        multiple: PropTypes.bool,
        accept: PropTypes.string,
        specificFileTypes: PropTypes.array,
        disabled: PropTypes.bool,
        hidden: PropTypes.bool,
        maxFileSize: PropTypes.number,
        invalidFileSizeMessage: PropTypes.string,
        invalidFileTypeMessage: PropTypes.string,
        style: PropTypes.object,
        className: PropTypes.string,
        chooseLabel: PropTypes.string,
        noFileLabel: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        uploadHandler: PropTypes.func
    };

    constructor(props){
        super(props);
        if(props.id){
            this.id = props.id;
        } else{
            this.id = _uniqueId("fileUpload-id-");
        }
        this.state = {
            errors:[]
        };
        this.inputRef = React.createRef();
    }

    async addItem (event) {
        if (!this.props.uploadHandler) {
            let tempFiles = [];
            // If file input is multiple, then keep previously selected files
            // and keep adding to them
            if (this.props.multiple && this.props.value) {
                if (this.props.value.constructor === Array) {
                    tempFiles = this.props.value;
                } else {
                    tempFiles.push(this.props.value);
                }
            }
            for(let i=0; i<event.target.files.length; i++) {
                event.persist();
                let file = event.target.files[i];
                let filetype = file.type || 'application/octet-stream';
                let filename = file.name || 'file';
                let filesize = file.size;
                let specificType;
                if (filename.lastIndexOf(".") > 0){
                    specificType = filename.substr(filename.lastIndexOf(".") + 1);
                }
/**
 * If you want to do very strong file type checking, then you can use file headers.
 * Either convert HEX values of specific file types and check if they exist in base64String of files
 * or convert base64String of files to HEX, and check if they match with given HEX values of file types
 */
                if ((this.props.maxFileSize && (filesize > this.props.maxFileSize)) || (filesize <= 0)) {
                    let temp = this.state.errors;
                    let message = "Maximum allowed upload size is " + this.props.maxFileSize + " bytes. (Size of " + filename + " is " + filesize + " bytes)";
                    if (this.props.invalidFileSizeMessage) {
                        message = this.props.invalidFileSizeMessage;
                    }
                    temp.push(message);
                    this.setState({errors: temp});
                } else {
                    // If string of file types are given in a array, checks whether file type matches with any of them.
                    // if there is no file extansion, then accept the file
                    if ((this.props.specificFileTypes.length > 0) && specificType && !this.props.specificFileTypes.includes(specificType)) {
                        let temp = this.state.errors;
                        let message = "You can only upload files with extension " + this.props.specificFileTypes + ". (File you upload has extension of " + specificType + ")";
                        if (this.props.invalidFileTypeMessage) {
                            message = this.props.invalidFileTypeMessage;
                        }
                        temp.push(message);
                        this.setState({errors: temp});
                    } else {
                        let reader = new FileReader();
                        await new Promise ((resolve) => {
                            reader.readAsDataURL(file);
                            reader.onloadend = (evt) => {
                                let dataAsDataUrl = evt.target.result;
                                let base64String = dataAsDataUrl.replace(/^data:.+(;base64)?,/,'');
                                let processedFile = {bytes:base64String, mimeType:filetype, fileName:filename, fileSize:filesize};
                                // Check if newly loaded file already exists in the list, if not add it
                                if (tempFiles.every(item => {return (item.bytes !== processedFile.bytes);})){
                                    tempFiles.push(processedFile);
                                }
                                resolve();
                            };
                        });
                    }
                }
            }
            if (tempFiles.length === 1) {
                this.props.onChange(tempFiles[0], event.target.files[0]);
            } else {
                if (tempFiles.length === 0) {
                    this.props.onChange(null, null);
                } else {
                    this.props.onChange(tempFiles, event.target.files);
                }
            }
        } else {
            this.props.uploadHandler(event);
        }
        // If user wants to select last selected file again,
        // he/she can do it since we clean the file input's value
        this.inputRef.current.value = "";
    };

    fileDelete(item) {
        if (this.props.value.constructor === Array) {
            let temp = this.props.value;
            let indexToDelete = temp.findIndex(elem => item.bytes === elem.bytes);
            temp.splice(indexToDelete, 1);
            if (temp.length === 0) {
                this.props.onChange(null);
            } else {
                this.props.onChange(temp);
            }
        } else {
            this.props.onChange(null);
        }
    }

    selectedFiles(){
        if(this.props.value) {
            let tempValue = [];
            if((this.props.value.constructor === Array) && (this.props.value.length > 0)) {
                tempValue = this.props.value;
            } else {
                tempValue.push(this.props.value);
            }
            let temp = [];
            tempValue.forEach((item, index) => {
                let preview;
                let fileURL = URL.createObjectURL(base64ToBlob(item.bytes, item.mimeType));
                if (item.mimeType.includes("image")) {
                    preview = <div className="imagePreviewDiv"><img className="imagePreview" src={fileURL} alt="preview" onClick={() => window.open(fileURL)}/></div>
                } else {
                    preview = <span style={{display: "unset", margin: "50px"}}/>
                }
                temp.push(<li key={index} className="selectedLI">
                    {preview}
                    <div className="labelDiv"><label className="selectedLabel" onClick={()=> downloadBlob(base64ToBlob(item.bytes, item.mimeType), item.fileName)}>{item.fileName}</label></div>
                    <div className="closeDiv" onClick={()=> this.fileDelete(item)} ><span style={{cursor: "pointer"}} >x</span></div>
                </li>);
            });
            return temp;
        } else {
            return <li className="noSelectionLabel">{this.props.noFileLabel}</li>
        }
    };

    errorMessages(){
        if (this.state.errors.length > 0) {
            let temp = [];
            for (let i=0; i<this.state.errors.length; i++) {
                temp.push(<li key={i}>{this.state.errors[i]}</li>);
            }
            return <ul style={{color: "#ff0000"}}>
                {temp}
            </ul>
        } else {
            return null;
        }
    }

    errorMessageCleaner(){
        if (this.state.errors.length > 0) {
            this.setState({errors: []});
        }
    }

    render() {

        let componentClassName = "FileUpload " + this.props.className;

        if (!this.props.hidden) {
            return (
                <div id={this.id} className={componentClassName} style={this.props.style} onClick={()=>this.errorMessageCleaner()}>
                    <input
                        type="file"
                        multiple={this.props.multiple}
                        accept={this.props.accept}
                        hidden={true}
                        onChange={event => this.addItem(event)}
                        ref={this.inputRef}
                    />
                    <ul className="selectedUL">
                        {this.selectedFiles()}
                    </ul>
                    <Button
                        disabled={this.props.disabled}
                        onClick={()=> this.inputRef.current.click()}
                        variant="primary"
                    >
                        {this.props.chooseLabel}
                    </Button>
                    {this.errorMessages()}
                </div>
            );
        } else {
            return null;
        }
    }
}
