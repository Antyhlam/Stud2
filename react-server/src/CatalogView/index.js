import React from "react";
import {Button, List, message} from "antd";
import './index.css';

class CatalogView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {links: null};

        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        this.props.socket.on('badCatalog', res => {
            message.open({
                type: 'error',
                content: res,
            });
        });
        this.props.socket.on('catalogView', res => {
            this.setState({links: res})
        });
    }

    componentWillUnmount() {
        this.props.socket.off('badCatalog');
        this.props.socket.off('catalogView');
    }

    handleClick(event) {
        event.preventDefault();
        this.props.socket.emit('download', event.target.textContent);
        this.setState({links: null})
    }

    renderItem(item) {
        return <List.Item className={'ListItem'}>
            <Button type="link" onClick={this.handleClick}>{item}</Button>
        </List.Item>;
    }

    render() {
        const {links} = this.state;
        return (
            <>
                {links && <List
                    className={'ListItem'}
                    size="large"
                    header={<div>Доступные ссылки</div>}
                    dataSource={links}
                    renderItem={(item) => this.renderItem(item)}
                />}
            </>
        );
    }
}

export default CatalogView;