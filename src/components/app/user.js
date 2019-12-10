import React from 'react';

// Style
import '../../style/app/user.scss';

// Icons
import { ReactComponent as SVG_Login } from '../../icons/login.svg';
import { ReactComponent as SVG_Logout } from '../../icons/logout.svg';

class UserHeader extends React.Component {
    constructor(props) {
        super(props);

        this.LogButton_OnClick = this.LogButton_OnClick.bind(this);
    }

    LogButton_OnClick() {
        if (!this.props.isSignedIn)
            window.gapi.auth2.getAuthInstance().signIn();
        else
            window.gapi.auth2.getAuthInstance().signOut();
    }

    render() {
        let buttonIcon = <SVG_Login/>;
        let buttonClass = "";

        if (this.props.isSignedIn)
        {
            buttonIcon = <SVG_Logout/>;
            buttonClass += "loggedIn";
        }

        return (
            <div className="user">
                <div className="username">
                    <div className="name">{ this.props.userName }</div>
                    <div className="email">{ this.props.userEmail }</div>
                </div>
                <button className={ "button " + buttonClass } onClick={ this.LogButton_OnClick }>{ buttonIcon }</button>
            </div>
        );
    }
}

export default UserHeader