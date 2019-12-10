import React from 'react';
import InlineMaths, { BlockMath, InlineMath } from 'react-katex';

function InterpretContent(string) {
    let elements = [];

    while (string.length > 0)
    {
        // If tag next
        if (string[0] === '#')
        {
            // Get content
            let content = '';
            const tag = string[1];

            //If no ending tag
            if (string.indexOf('#', 2) === -1)
            {
                content = string;
                string = '';
            }
            else
            {
                content = string.substring(2, string.indexOf('#', 2));
                string = string.substring(string.indexOf('#', 2) + 1);
            }

            switch (tag)
            {
                case 'i':
                    elements.push(<i key={ elements.length }>{ content }</i>);
                    break;
                case 'b':
                    elements.push(<b key={ elements.length }>{ content }</b>);
                    break;
                case 'c':
                    elements.push(<span className="colored" key={ elements.length }>{ content }</span>);
                    break;
                case 'm':
                    elements.push(<InlineMath key={ elements.length }>{ content }</InlineMath>);
                    break;
                default:
                    elements.push(<span key={ elements.length }>{ content }</span>);
            }
        }
        else
        {
            if (string.indexOf('#') !== -1)
            {
                elements.push(<span key={ elements.length }>{ string.substring(0, string.indexOf('#')) }</span>);
                string = string.substring(string.indexOf('#'));
            }
            else
            {
                elements.push(<span key={ elements.length }>{ string }</span>);
                string = '';
            }
        }
    }

    return elements;
}


class ParagraphEditor extends React.Component {
    render() {
        const content = InterpretContent(this.props.content);

        return (
            <p className={ this.props.type }>{ content }</p>
        );
    }
}

class TitleEditor extends React.Component {
    render() {
        const content = InterpretContent(this.props.content);
        let className = 'title';

        switch (this.props.type)
        {
            case 1:
                className += ' sub';
                break;
            default:
                break;
        }

        return (
            <div className={ className }>{ content }</div>
        );
    }
}

class SectionEditor extends React.Component {
    render() {
        const content = InterpretContent(this.props.content);
        let className = 'section';
        let index = this.props.index;

        switch (this.props.type)
        {
            case 1:
                className += ' sub';
                index = String.fromCharCode(((index - 1) % 26) + 65).toUpperCase();
                break;
            case 2:
                className += ' subsub';
                index = String.fromCharCode(((index - 1) % 26) + 65).toLowerCase();
                break;
            default:
                break;
        }

        return (
            <div className={ className }>
                <span className="index" style={{ display: (this.props.index === 0) ? 'none' : 'inline-block' }}>
                    { index }.
                </span>
                <span className="name">{ content }</span>
            </div>
        );
    }
}

class PropertyEditor extends React.Component {
    render() {
        const content = InterpretContent(this.props.content);
        let className = 'property';

        switch (this.props.type)
        {
            default:
                className += ' remark';
                break;
            case 1:
                className += ' definition';
                break;
            case 2:
                className += ' theorem';
                break;
        }

        if (this.props.isImportant)
            className += ' important';

        return (
            <div className={ className }>
                <span className="name">{ this.props.property }</span>
                <span className="value">{ content }</span>
            </div>
        );
    }
}

class ListEditor extends React.Component {
    render() {
        const content = InterpretContent(this.props.content);
        let className = 'list';

        switch (this.props.type)
        {
            case 0:
                className += ' dash';
                break;
            case 1:
                className += ' bullet';
                break;
            case 2:
                className += ' hashtag';
                break;
            case 3:
                className += ' letter';
                break;
            default:
                className = 'list dash';
                break;
        }

        return (
            <p className={ className }>{ content }</p>
        );
    }
}

export {
    TitleEditor,
    ParagraphEditor,
    SectionEditor,
    PropertyEditor,
    ListEditor
}