import React from 'react';
import { ReactComponent as SVG_Notebook } from '../../../icons/notebook.svg';

// Style
import '../../../style/app/popups/file.scss';

class File extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            index: this.props.index,
        };

        this.File_OnClick = this.File_OnClick.bind(this);
    }

    File_OnClick(event) {
        this.props.onClick(this.state.index, this.props.title);
    }

    render() {
        const modified = this.props.modified.substring(0, 10).split('-').reverse().join('/');

        return (
            <div className="file" onClick={ this.File_OnClick }>
                <SVG_Notebook />

                <div className="texts">
                    <div className="title">{ this.props.title }</div>
                    <div className="lastDate">{ "Modified on " + modified }</div>
                </div>
            </div>
        );
    }
}

export default File