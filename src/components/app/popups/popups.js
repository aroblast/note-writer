import React from 'react';
import File from './file';
import Loader from './loader';

import { isUndefined } from 'util';

// Icons
import { ReactComponent as SVG_Close } from '../../../icons/cross.svg';
import { ReactComponent as SVG_File } from '../../../icons/notebook.svg';

// Style
import '../../../style/app/popups/popups.scss';

class FilePickerPopup extends React.Component {
    constructor(props) {
        super(props);

        this.FileItem_OnClick = this.FileItem_OnClick.bind(this);

        this.state = {
            files: [],
            isLoading: false
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.visible !== this.props.visible)
        {
            if (nextProps.visible)
                this.GetFiles();

            return true;
        }
        else if (nextState.files !== this.state.files)
            return true;
        else
            return false;
    }

    FileItem_OnClick(index, name) {
        this.props.openFile(index);
        this.props.closePopup();
    }


    GetFiles() {
        if (window.gapi.auth2.getAuthInstance().isSignedIn)
        {
            //Reset files to be able to compare them in shouldComponentUpdate()
            this.setState({
                files: [],
                isLoading: true
            });

            let filesList = [];

            window.gapi.client.drive.files.list({
                'pageSize': 30,
                'fields': "nextPageToken, files(id, name, size, modifiedTime)",
                'q': "fileExtension = 'classdoc' and trashed = false"
            }).then((response) => {
                const files = response.result.files;

                if (files && files.length > 0)
                {
                    files.forEach(file => {
                        filesList.push(<File
                            key={ filesList.length }
                            index={ file.id }
                            title={ file.name.substring(0, file.name.indexOf('.')) }
                            modified={ file.modifiedTime }
                            onClick={ this.FileItem_OnClick }
                        />);
                    });
                }

                this.setState({
                    files: filesList,
                    isLoading: false
                });
            });
        }
    }
    

    render() {
        return (
            <div className={ 'file-picker popup' + (this.props.visible ? '' : ' hidden') }>
                <div className="header">
                    <SVG_Close className="close" onClick={ this.props.closePopup }/>
                    
                    <div className="texts">
                        <div className="title">{ this.props.header }</div>
                        <div className="question">{ this.props.question }</div>
                    </div>
                </div>

                <div className="content left">
                    { this.state.files }
                </div>

                <Loader visible={ this.state.isLoading }/>
            </div>
        );
    }
}

class FileUploaderPopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            documentName: '',
            documentContent: '',

            inputValue: ''
        };

        this.FilePicker_OnChange = this.FilePicker_OnChange.bind(this);
    }

    componentWillReceiveProps(props) {
        this.setState({
            documentName: '',
            documentContent: '',

            inputValue: ''
        });
    }

    FilePicker_OnChange(event) {
        const filePath = event.target.value;

        if (filePath.substring(filePath.lastIndexOf('.')) === '.classdoc')
        {
            const name = filePath.substring(
                filePath.lastIndexOf('\\') + 1,
                filePath.lastIndexOf('.'));
            
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                let content = fileReader.result;

                //Replace undefined by '' if content empty
                if (isUndefined(content))
                    content = '';

                this.props.uploadFile(name, content);
                this.props.closePopup();
            };
            
            fileReader.readAsText(event.target.files[0]);
        }
    }


    render() {
        return (
            <div className={ 'file-picker popup' + (this.props.visible ? '' : ' hidden') }>
                <div className="header">
                    <SVG_Close className="close" onClick={ this.props.closePopup }/>
                    
                    <div className="texts">
                        <div className="title">{ this.props.header }</div>
                        <div className="question">{ this.props.question }</div>
                    </div>
                </div>

                <div className="content">
                    <div className="file-icon">
                        <SVG_File/>
                        <div className="sub">Import a file to your Google Drive to open it with ClassWriter.</div>
                    </div>
                    <label htmlFor="file-input">Upload</label>
                    <input
                        id="file-input"
                        type="file"
                        accept=".classdoc"
                        value={ this.state.inputValue }
                        onChange={ this.FilePicker_OnChange }/>
                </div>
            </div>
        );
    }
}

export { FilePickerPopup, FileUploaderPopup }