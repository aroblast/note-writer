import React from 'react';

// Style
import '../../../style/app/popups/loader.scss';

// Icons
import LoaderGif from '../../../icons/gifs/loader.gif';

class Loader extends React.Component {
	render() {
		return (
			<div className={ 'background' + (this.props.visible ? '' : ' hidden') }>
				<img src={ LoaderGif } alt="Loading"/>
			</div>
		);
	}
}

export default Loader;