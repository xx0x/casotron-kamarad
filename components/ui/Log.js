import deepEqual from 'deep-equal';
import React from 'react';
import parseLogContents from '../../utils/parseLogContents';
import FlashDialog from '../FlashDialog';
import style from './Log.module.scss';

export default class Log extends React.Component {

    constructor() {
        super();
        this.state = { content: '', parsedLog: {} };
        this.append = this.append.bind(this);
        this.clear = this.clear.bind(this);
        this.logRef = React.createRef();
        this.scrollToEndTimeout = null;
        this.parseContents = this.parseContents.bind(this);
    }

    append(content) {
        this.setState((prev) => ({ content: `${prev.content}${content}` }), () => {
            clearTimeout(this.scrollToEndTimeout);
            this.parseContents();
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

    parseContents() {
        const parsedLog = parseLogContents(this.state.content);
        if (!deepEqual(parsedLog, this.state.parsedLog)) {
            this.setState({ parsedLog });
        }
    }

    render() {
        return (
            <>
                <FlashDialog parsedLog={this.state.parsedLog} />
                <pre className={style.container} ref={this.logRef}>
                    {this.state.content}
                </pre>
            </>
        );
    }
}