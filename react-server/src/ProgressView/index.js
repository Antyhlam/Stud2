import React from "react";
import {Progress, Table} from "antd";
import './index.css';

const columns = [
    {
        title: 'Link',
        dataIndex: 'link',
        key: 'link',
    },
    {
        title: 'Size',
        dataIndex: 'size',
        key: 'size',
    },
    {
        title: 'Threads',
        dataIndex: 'threads',
        key: 'threads',
    },
    {
        title: 'Progress',
        dataIndex: 'progress',
        key: 'progress',
        render: (text) => <Progress percent={text}/>,
        width: 250,
    },
];

class ProgressView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {progress: []};
    }

    componentDidMount() {
        this.props.socket.on('progress', res => {
            this.setState({progress: res})
        });
        this.props.socket.on('file', res => {
            console.log({res});
            const res64 = res.data.reduce((result, byte) => result + String.fromCharCode(byte), '');
            const el = window.document.createElement('a');
            el.href = 'data:' + res.content + ';base64,' + window.btoa(res64);
            el.download = res.filename;
            document.body.appendChild(el);
            el.click();
            document.body.removeChild(el);
        });
    }

    componentWillUnmount() {
        this.props.socket.off('progress');
        this.props.socket.off('file');
    }

    render() {
        const {progress} = this.state;
        if (!progress.length)
            return null;
        return (<Table className={'ProgressTable'} columns={columns} dataSource={progress} pagination={false}/>);
    }
}

export default ProgressView;