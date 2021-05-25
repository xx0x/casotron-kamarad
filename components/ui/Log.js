import React from 'react';
import style from './Log.module.scss';

export default class Log extends React.Component {

    constructor() {
        super();
        this.state = { content: '' };
        this.append = this.append.bind(this);
        this.clear = this.clear.bind(this);
        this.logRef = React.createRef();
        this.scrollToEndTimeout = null;
    }

    append(content) {
        this.setState((prev) => ({ content: `${prev.content}${content}` }), () => {
            clearTimeout(this.scrollToEndTimeout);
            this.scrollToEndTimeout = setTimeout(() => {
                if (this.logRef.current) {
                    this.logRef.current.scrollTop = this.logRef.current.scrollHeight;
                }
            }, 100);
        });
    }

    clear() {
        this.setState({ content: '' });
    }

    render() {
        return (
            <pre className={style.container} ref={this.logRef}>
                {this.state.content}
            </pre>
        );
    }
}