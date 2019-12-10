import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

import 'katex/dist/katex.min.css';

class MathsEditor extends React.Component {
    render() {
        let classes = 'maths';
        
        //Check if maths are important
        if (this.props.isImportant)
            classes += ' important';

        return (
            <div className={ classes }>
                <BlockMath>{ this.props.content }</BlockMath>
            </div>
        );
    }
}

export default MathsEditor