import React from "react";
import {Button, Input} from "antd";
import './index.css';

class CatalogInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.socket.emit('catalog', this.state.value);
  }

  render() {
    return (
      <div>
        <Input
            className={'TextInput'}
            value={this.state.value}
            placeholder={'Введите название каталога'}
            onChange={this.handleChange}
        />
        <Button onClick={this.handleSubmit}>Запросить</Button>
      </div>
    );
  }
}

export default CatalogInput;