import React from 'react';
import style from './Header.module.scss';

function Header(props) {
    return (
        <div className={style.container}>
            <div className={style.title}>
                Časotron Kamarád
            </div>
            <div className={style.contents}>
                {props.children}
            </div>
        </div>
    );
}

export default Header;