import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import CatalogView from "./CatalogView";
import CatalogInput from "./CatalogInput";
import io from "socket.io-client";
import ProgressView from "./ProgressView";

const socket = io('localhost:3001');
function App() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [catalogs, setCatalogs] = useState([]);

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
        });
        socket.on('disconnect', () => {
            setIsConnected(false);
        });
        socket.on('catalogs', data => {
            setCatalogs(data);
        });
    }, []);

    return (
        <div className="App">
            <header>
                <img src={logo} className="App-logo" alt="logo"/>
                <p>Connected: {'' + isConnected}</p>
            </header>
            <div>
                <h3>Каталоги</h3>
                <ul className="List">
                    {catalogs.map((catalog) =>
                        <li key={catalog}>{catalog}</li>
                    )}
                </ul>
            </div>
            <CatalogInput socket={socket}/>
            <CatalogView socket={socket}/>
            <ProgressView socket={socket}/>
        </div>
    );
}

export default App;
