import React from 'react';
import Toolbar from './toolbar';
import Main from '../editor/editor';
import Loader from './popups/loader';

import { CLIENT_ID, API_KEY } from '../api/api';

import { isUndefined } from 'util';


// Timer
let saveTimer;

class App extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            // User
            isSignedIn: false,
            userName: '',
            userEmail: '',

            // Document
            documentName: 'New document',
            documentContent: '',
            documentIndex: '',

            wordCount: 0,
            characterCount: 0,
            characterWOSpacesCount: 0,

            // State
            isFileOpened: false,
            isEdited: false,
            isLoading: false,

            // Style
            isDarkMode: false
        };

        // User
        this.InitAPI = this.InitAPI.bind(this);
        this.UpdateSigninStatus = this.UpdateSigninStatus.bind(this);

        // File
        this.NewFile = this.NewFile.bind(this);
        this.OpenFile = this.OpenFile.bind(this);
        this.UploadFile = this.UploadFile.bind(this);
        this.SaveFile = this.SaveFile.bind(this);
        this.RemoveFile = this.RemoveFile.bind(this);
        this.RenameFile = this.RenameFile.bind(this);
        this.EditContent = this.EditContent.bind(this);
        this.Counting = this.Counting.bind(this);
    }

    componentDidMount() {
        //Initialize the Google Drive API
        try {
            window.gapi.load('client:auth2', this.InitAPI);
        }
        catch {
            this.setState({ isSignedIn: false });
        }

        //Initialize the save timer
        /*this.timer = setInterval(() => {
            if (this.state.isSignedIn && this.state.isFileOpened)
                this.SaveFile();
        }, 30000);*/
    }


    // User
    InitAPI() {
        window.gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: [ 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest' ],
            scope: 'https://www.googleapis.com/auth/drive'
        }).then(() => {
            // Listen for sign-in state changes.
            window.gapi.auth2.getAuthInstance().isSignedIn.listen(this.UpdateSigninStatus);

            // Handle the initial sign-in state.
            this.UpdateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
        }, (error) => {
            console.log(error);
        });
    }

    UpdateSigninStatus(isSignedIn) {
        if (isSignedIn)
        {
            const profile = window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
    
            this.setState({
                isSignedIn: isSignedIn,
                userName: profile.getName(),
                userEmail: profile.getEmail()
            });
        }
        else
            this.setState({
                isSignedIn: isSignedIn,
                userName: "",
                userEmail: ""
            });
    }

    IsConnected() {
        return window.gapi.auth2.getAuthInstance().isSignedIn.get();
    }

    // File
    NewFile() {
        if (this.state.isEdited)
            if (!window.confirm('You have unsaved work open. Are you sure you want to create a new file? (Every unsaved changes will be lost)'))
                return;

        this.setState({
            documentName: 'New document',
            documentContent: '',
            documentIndex: '',

            wordCount: 0,
            characterCount: 0,
            characterWOSpacesCount: 0,

            isEdited: false,
            isFileOpened: false
        });
    }

    OpenFile(index) {
        if (this.IsConnected())
        {
            if (this.state.isEdited)
                if (!window.confirm('You have unsaved work open. Are you sure you want to open a file? (Every unsaved changes will be lost)'))
                    return;
            
            //Show loading popup
            this.setState({
                isLoading: true
            });

            window.gapi.client.request({
                path: '/drive/v3/files/' + index,
                method: 'GET',
                params: {
                    fields: 'name'
                }
            }).then((resp) => {
                const name = resp.result.name.substring(0, resp.result.name.lastIndexOf('.'));

                window.gapi.client.request({
                    path: '/drive/v3/files/' + index,
                    method: 'GET',
                    params: {
                        alt: 'media'
                    }
                }).then((resp) => {
                    this.Counting(resp.body);
                    this.setState({
                        documentContent: resp.body,
                        documentName: name,
                        documentIndex: index,
    
                        isFileOpened: true,
                        isEdited: false,
                        isLoading: false
                    });
                });
            });
        }
    }

    UploadFile(name, content, openFileAfterUpload = true, checkBeforeUpload = true) {
        if (this.IsConnected())
        {
            this.setState({
                isLoading: true
            });

            if (checkBeforeUpload && this.state.isEdited)
                if (window.confirm('A file is still open in the editor. Do you want to save the document before uploading? (Warning: cancelling will lose all of your changes)'))
                    this.SaveFile(false);
            
            window.gapi.client.request({
                path: '/drive/v3/files/',
                method: 'POST',
                body: {
                    name: name + '.classdoc'
                }
            }).then((resp) => {
                window.gapi.client.request({
                    path: '/upload/drive/v3/files/' + resp.result.id,
                    method: 'PATCH',
                    params: {
                        uploadType: 'media'
                    },
                    body: content
                }).then((resp) => {
                    if (openFileAfterUpload)
                    {
                        this.setState({
                            isEdited: false
                        });
    
                        this.OpenFile(resp.result.id)
                    }
                    else
                    {
                        this.setState({
                            isLoading: false
                        });
                    }
                });
            });
        }
    }

    SaveFile(isUpload = true) {
        if (this.IsConnected())
            if (this.state.isFileOpened)
            {
                //Clear saveTimer
                clearTimeout(saveTimer);

                window.gapi.client.request({
                    path: '/upload/drive/v3/files/' + this.state.documentIndex,
                    method: 'PATCH',
                    params: {
                        uploadType: 'media'
                    },
                    body: this.state.documentContent
                }).then(() => {
                    this.setState({
                        isEdited: false
                    });
                });
            }
            else
            {
                this.UploadFile(this.state.documentName, this.state.documentContent, isUpload, false);
            }
        else
            window.gapi.auth2.getAuthInstance().signIn();
    }

    RemoveFile(index) {
        if (this.IsConnected())
        {
            if (!window.confirm('Are you sure you want to delete this file ? You can still recover it in your Google Drive trash.'))
                return;
                
            //If no index but doc opened, delete currently open doc
            if (isUndefined(index))
                if (this.state.documentIndex !== '')
                    index = this.state.documentIndex;
                //Else return because nothing to delete
                else
                    return;

            window.gapi.client.request({
                path: '/drive/v3/files/' + index,
                method: 'DELETE'
            }).then(() => {
                alert('The file has been moved to your Google Drive trash.')
            });

            this.NewFile();
        }
    }

    RenameFile(newName) {
        if (this.IsConnected() && this.state.isFileOpened)
        {
            window.gapi.client.request({
                path: '/drive/v3/files/' + this.state.documentIndex,
                method: 'PATCH',
                body: {
                    name: newName + '.classdoc'
                }
            }).then(() => {
                this.setState({
                    documentName: newName
                });
            });
        }
        else
            this.setState({
                documentName: newName
            });
    }

    EditContent(newContent) {
        //Count characters and words
        this.Counting(newContent);

        //Reset save timer if isFileOpened
        if (this.state.isFileOpened)
        {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                //Save file and reset the isEdited state
                this.SaveFile(false);
                this.setState({ isEdited: false });
            }, 5000);
        }

        this.setState({
            documentContent: newContent,

            isEdited: true
        });
    }

    Counting(content) {
        const textWOTags = content.replace(/^\\\w+/gm, '').replace(/{|}/gm, '');
        const textWords = textWOTags.match(/\S+/g);
        const textWONewlines = textWOTags.replace(/\r?\n|\r/g, '');
        const textWOSpaces = textWONewlines.replace(/\s/g, '');

        const wordCount = textWords === null ? 0 : textWords.length;
        const characterCount = textWONewlines.length;
        const characterWOSpacesCount = textWOSpaces.length;

        console.log(textWOTags);

        this.setState({
            wordCount: wordCount,
            characterCount: characterCount,
            characterWOSpacesCount: characterWOSpacesCount
        });
    }


    render() {
        return (
            <div className={ 'app' +
                (this.state.isDarkMode ? ' dark' : ' light')
            }>
                <Toolbar
                    isSignedIn={ this.state.isSignedIn }
                    userName={ this.state.userName }
                    userEmail={ this.state.userEmail }

                    documentName={ this.state.documentName }
                    wordCount={ this.state.wordCount }
                    characterCount={ this.state.characterCount }
                    characterWOSpacesCount={ this.state.characterWOSpacesCount }

                    isEdited={ this.state.isEdited }
                    isFileOpened={ this.state.isFileOpened }

                    newFile={ this.NewFile }
                    openFile={ this.OpenFile }
                    saveFile={ this.SaveFile }
                    uploadFile={ this.UploadFile }
                    renameFile={ this.RenameFile }
                    removeFile={ this.RemoveFile }
                    
                    isDarkMode={ this.state.isDarkMode }
                    switchDarkMode={ () => {
                        this.setState({ isDarkMode: !this.state.isDarkMode });
                     } }/>
                <Main
                    documentContent={ this.state.documentContent }

                    editContent= { this.EditContent }
                    saveFile={ this.SaveFile }/>
                
                <Loader visible={ this.state.isLoading }/>
            </div>
        );
    }
}

export default App;