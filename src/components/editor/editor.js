import React from 'react';
import Textarea from 'react-textarea-autosize';

// Style
import '../../style/editor/editor.scss';
import '../../style/editor/render.scss';

import Interpreter from './interpreter'
let interpreter = new Interpreter();

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.editor = React.createRef();
        this.state = {
            documentContent: this.props.documentContent,
            renderElements: [],
            renderElements: []
        };

        this.Editor_OnChange = this.Editor_OnChange.bind(this);
        this.Editor_OnKeyDown = this.Editor_OnKeyDown.bind(this);

        this.AddTagAt = this.AddTagAt.bind(this);
    }

    componentWillReceiveProps(props) {
        this.UpdateEditor(props.documentContent);
    }


    Editor_OnChange(event) {
        this.props.editContent(event.target.value);
    }

    Editor_OnKeyDown(event) {
        if (event.metaKey)
        {
            //Get selection range
            const start = event.target.selectionStart;
            const end = event.target.selectionEnd;
            
            //Save
            switch (event.key)
            {
                case 's':
                    event.preventDefault();
                    this.props.saveFile();
                    break;

                case 'i':
                    event.preventDefault();
                    this.AddTagAt(start, end, 'i')
                    break;
                case 'b':
                    event.preventDefault();
                    this.AddTagAt(start, end, 'b')
                    break;
                case 'h':
                    event.preventDefault();
                    this.AddTagAt(start, end, 'c')
                    break;
                case 'm':
                    event.preventDefault();
                    this.AddTagAt(start, end, 'm')
                    break;
                default:
                    break;
            }
        }
    }


    UpdateEditor(content) {
        //Temp the current selection start
        let coordinatesOld = [ this.editor.selectionStart, this.editor.selectionEnd ];

        let editorElements = [];

        const fullTagRegex = new RegExp(/^(^\\(\w{2,})(\{([^{}]+)\})*)/g);
        const renderElements = interpreter.ToElements(interpreter.Split(content));
        
        interpreter.Split(content, false).forEach(element => {
            let currentLine = [];

            //Tag span
            if (fullTagRegex.test(element))
            {
                let tag = element.match(fullTagRegex).toString();
                let tagName = Array.from(element.match(fullTagRegex))[0][2];

                currentLine.push(
                    <span className={ 'tag ' + tagName } key={ currentLine.length }>{ tag }</span>
                );

                element = element.substring(tag.length);
            }

            // Inline tags spans
            while (element.length > 0)
            {
                // If tag next
                if (element[0] === '#')
                {
                    // Get content
                    let content = '';
                    const tag = element[1];

                    //If no ending tag
                    if (element.indexOf('#', 2) === -1)
                    {
                        content = element;
                        element = '';
                    }
                    else
                    {
                        content = element.substring(0, element.indexOf('#', 2) + 1);
                        element = element.substring(element.indexOf('#', 2) + 1);
                    }

                    switch (tag)
                    {
                        case 'i':
                            currentLine.push(<span key={ currentLine.length } className="inline italic">{ content }</span>);
                            break;
                        case 'b':
                            currentLine.push(<span key={ currentLine.length } className="inline bold">{ content }</span>);
                            break;
                        case 'c':
                            currentLine.push(<span key={ currentLine.length } className="inline colored" >{ content }</span>);
                            break;
                        case 'm':
                            currentLine.push(<span key={ currentLine.length } className="inline maths" >{ content }</span>);
                            break;
                        default:
                            currentLine.push(<span key={ currentLine.length }>{ content }</span>);
                    }
                }
                else
                {
                    if (element.indexOf('#') !== -1)
                    {
                        currentLine.push(<span key={ currentLine.length }>{ element.substring(0, element.indexOf('#')) }</span>);
                        element = element.substring(element.indexOf('#'));
                    }
                    else
                    {
                        currentLine.push(<span key={ currentLine.length }>{ element }</span>);
                        element = '';
                    }
                }
            }
                    
            editorElements.push(
                <span className="line" key={ editorElements.length }>{ currentLine }</span>
            )
        });

        // Check if document has changed
        let hasChanged = this.state.documentContent !== content;

        this.setState({
            documentContent: content,
            editorElements: editorElements,
            renderElements: renderElements
        }, () => {
            if (hasChanged)
            {
                //Restore old coordinates
                this.editor.selectionStart = coordinatesOld[0];
                this.editor.selectionEnd = coordinatesOld[0];
            }
        });
    }

    AddTagAt(start, end, tag) {
        if (start === end)
            document.execCommand('insertText', false, '#' + tag + '  #');
        else
        {
            let selection = this.state.documentContent.substring(start, end);
            document.execCommand('insertText', false, '#' + tag + ' ' + selection + ' #');
        }
    }


    render() {
        return (
            <main>
                <div className="editor">
                    <Textarea
                        className="page-editor"
                        inputRef={ tag => (this.editor = tag) }
                        value={ this.state.documentContent }
                        placeholder="Hello world..."
                        onKeyDown={ this.Editor_OnKeyDown }
                        onChange={ this.Editor_OnChange }/>
                    <div className="page-editor overlay">
                        { this.state.editorElements }
                    </div>
                </div>

                <div className="render-container">
                    <div className="page-render">
                        { this.state.renderElements }
                    </div>
                </div>
            </main>
        );
    }
}

export default Main