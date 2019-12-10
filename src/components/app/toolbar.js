import React from 'react';
import UserHeader from '../app/user';
import { FilePickerPopup, FileUploaderPopup } from './popups/popups';

// Icons
import { ReactComponent as SVG_App } from '../../icons/notebook.svg';
import { ReactComponent as SVG_Open } from '../../icons/cloud-computing-open.svg';
import { ReactComponent as SVG_Save } from '../../icons/diskette.svg';
import { ReactComponent as SVG_Upload } from '../../icons/cloud-computing-upload.svg';
import { ReactComponent as SVG_Add } from '../../icons/add.svg';
import { ReactComponent as SVG_Bin } from '../../icons/garbage.svg';
import { ReactComponent as SVG_Print } from '../../icons/print.svg';

// Style
import '../../style/app/toolbar.scss';

class Toolbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            documentName: this.props.documentName,

            isUserSignedIn: false,
            isEdited: false,

            editTitle: false,
            
            showMenu: false,
            showOpenPopup: false,
            showUploadPopup: false
        };

        this.Title_OnClick = this.Title_OnClick.bind(this);
        this.Title_OnChange = this.Title_OnChange.bind(this);
        this.Title_OnKeyDown = this.Title_OnKeyDown.bind(this);
        this.Title_OnBlur = this.Title_OnBlur.bind(this);
    }
    

    componentWillReceiveProps(props) {
        this.setState({
            documentName: props.documentName,
            isEdited: props.isEdited
        });
    }

    // Event
    Title_OnClick() {
        if (this.state.editTitle === false)
            this.setState({ editTitle: true });
    }

    Title_OnChange(event) {
        event.preventDefault();
        this.setState({ documentName: event.target.value });
    }

    Title_OnKeyDown(event) {
        if (event.key === 'Enter')
            event.currentTarget.blur();
    }
 
    Title_OnBlur(event) {
        event.preventDefault();

        const newTitle = this.state.documentName.trim() === '' ?
            'New document' :
            this.state.documentName.trim();
        this.props.renameFile(newTitle);
    }


    render() {
        let buttonClass = ' ';

        if (this.props.isSignedIn)
            buttonClass = ' loggedIn '
        
        if (this.props.isFileOpened)
            buttonClass += ' openFile '
        
        return (
            <nav>
                <div className="header">
                    <div className="icon">
                        <SVG_App/>
                    </div>

                    <div className="texts">
                        <input  className="title"
                                maxLength="100"
                                onClick={ this.Title_OnClick }
                                onChange={ this.Title_OnChange }
                                onKeyDown={ this.Title_OnKeyDown }
                                onBlur={ this.Title_OnBlur }
                                value={ this.state.documentName }
                                readOnly={ this.state.editTitle === true ? "" : "readOnly" }
                                tabIndex="-1"/>
                        <div className={ this.state.isEdited === true ? 'sub edited' : 'sub' }>
                            { this.state.isEdited === true ? 'Edited' : 'Saved' }
                        </div>
                    </div>
                    
                    <UserHeader
                        isSignedIn={ this.props.isSignedIn }
                        userName={ this.props.userName }
                        userEmail={ this.props.userEmail }/>
                </div>
                
                <div className="panel">
                    <div className="column">
                        <div className="title">File</div>

                        <button
                            className={ 'button' + buttonClass + 'new' }
                            onClick={ () => {
                                this.props.newFile();
                            } }>
                                <div className="icon">
                                    <SVG_Add/>
                                </div>
                                <div className="name">New</div>
                        </button>
                        <button
                            className={ 'button' + buttonClass + 'open' }
                            onClick={ () => {
                                if (this.props.isSignedIn)
                                    this.setState({
                                        showOpenPopup: true
                                    });
                            } }>
                                <div className="icon">
                                    <SVG_Open/>
                                </div>
                                <div className="name">Open...</div>
                        </button>
                        <button
                            className={ 'button' + buttonClass + 'save' }
                            onClick={ () => {
                                if (this.props.isSignedIn)
                                    this.props.saveFile();
                            } }>
                                <div className="icon">
                                    <SVG_Save/>
                                </div>
                                <div className="name">Save</div>
                        </button>
                        
                        <div className="separator"></div>
                        
                        <button
                            className={ 'button' + buttonClass + 'upload' }
                            onClick={ () => {
                                 if (this.props.isSignedIn)
                                    this.setState({
                                        showUploadPopup: true
                                    });
                            } }>
                                <div className="icon">
                                    <SVG_Upload/>
                                </div>
                                <div className="name">Import...</div>
                        </button>
                        <button
                            className={ 'button' + buttonClass + 'remove' }
                            onClick={ () => {
                                if (this.props.isSignedIn && this.props.isFileOpened)
                                {
                                    this.props.removeFile();
                                }
                            } }>
                            <div className="icon">
                                <SVG_Bin/>
                            </div>
                            <div className="name">
                                Delete
                            </div>
                        </button>

                        <div className="separator"></div>

                        <button
                            className={ 'button' + buttonClass + 'print' }
                            onClick={ () => {
                                window.print();
                            } }>
                                <div className="icon">
                                    <SVG_Print/>
                                </div>
                                <div className="name">Print</div>
                        </button>
                    </div>

                    <div className="column">
                        <div className="title">Document</div>

                        <div className="number">
                            <div className="value">{ this.props.wordCount }</div>

                            <div className="texts">
                                <div className="name">Word count</div>
                            </div>
                        </div>
                        <div className="number">
                            <div className="value">{ this.props.characterCount }</div>

                            <div className="texts">
                                <div className="name">Character count</div>
                                <div className="description">(with spaces)</div>
                            </div>
                        </div>
                        <div className="number">
                            <div
                                className="value"
                                >{ this.props.characterWOSpacesCount }</div>

                            <div className="texts">
                                <div className="name">Character count</div>
                                <div className="description">(without spaces)</div>
                            </div>
                        </div>
                    </div>

                    <div className="column">
                        <div className="title">Application</div>

                        <div className="switch">
                            <div
                                className={ 'toggle' + (this.props.isDarkMode ? ' enabled' : '') }
                                onClick={ this.props.switchDarkMode }>
                                    <div className="handle"></div>
                            </div>

                            <div className="texts">
                                <div className="name">Dark mode</div>
                                <div className="description">Embrace the Dark Side.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="popups">
                    <FilePickerPopup
                        header="Open a file"
                        question="Choose a file from Google Drive."
                        visible={ this.state.showOpenPopup }
                        closePopup={ () => {
                            this.setState({ showOpenPopup: false });
                        } }
                        openFile={ this.props.openFile }/>

                    <FileUploaderPopup
                        header="Upload a file"
                        question="Upload a file to Google Drive."
                        visible={ this.state.showUploadPopup }
                        closePopup={ () => {
                            this.setState({ showUploadPopup: false });
                        } }
                        uploadFile={ this.props.uploadFile }/>
                </div>
            </nav>
        );
    }
}

export default Toolbar;