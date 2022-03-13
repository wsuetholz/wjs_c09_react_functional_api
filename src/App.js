import logo from './logo.svg';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { HubConnectionBuilder } from '@microsoft/signalr';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import './App.css';
import Login from './components/Login';
import Country from './components/country';
import Medal from "./components/medal";
import NewCountry from "./components/newcountry";

const App = () => {
    const [ countries, setCountries ] = useState([]);
    const [ medalList, setMedalList ] = useState([]);
    const [ connection, setConnection] = useState(null);
    const apiEndpoint = "https://wjsolympicmedals.azurewebsites.net/jwt/api/countries"
    //const apiEndpoint = "https://wjsolympicmedals.azurewebsites.net/api/countries"
    //const apiEndpoint = "https://localhost:44302/api/countries";
    const hubEndpoint = "https://wjsolympicmedals.azurewebsites.net/medalsHub";
    //const hubEndpoint = "https://localhost:44302/medalsHub";
    const usersEndpoint = "https://wjsolympicmedals.azurewebsites.net/api/users/login";
    //const usersEndpoint = "https://localhost:5001/api/users/login";

    const handleAddCountry = async (countryId, name, flag) => {
        let id = countryId;
        let flg = flag;
        if (id === '') {
            id = countries.length + 1;
            id = '' + id;
        }

        let addOk = false;
        try {
            const { data: post } = await axios.post(apiEndpoint, { id: id, name: name, flag: flg, bronze: 0, gold: 0, silver: 0 }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            let addOk = true;
        } catch (ex) {
            if (ex.response && (ex.response.status === 401 || ex.response.status === 403)) {
                alert("You are not authorized to complete this request");
            } else if (ex.response) {
                console.log(ex.response);
            } else {
                console.log("Request failed");
            }
        }
        if (addOk) {
            setCountries(countries.concat(post));
        }
    }

    const handleDeleteCountry = async (countryId) => {
        const deletePath = apiEndpoint + '/' + countryId;
        let deleteOk = false;
        try {
            await axios.delete(deletePath, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            let deleteOk = true;
        } catch (ex) {
            if (ex.response && ex.response.status === 404) {
                console.log("The record does not exist -- it may already have been deleted");
                let deleteOk = true;
            } else if (ex.response && (ex.response.status === 401 || ex.response.status === 403)) {
                alert('You are not authorized to complete this request');
                window.location.reload(false);
            } else if (ex.response) {
                console.log(ex.response);
            } else {
                console.log('Request Failed');
            }
        }
        if (deleteOk) {
            setCountries(countries.filter(c => c.id !== countryId));
        }
    }

    const handleIncrement = (countryId, medalType) => handleAdjustCount (countryId, medalType, 1);

    const handleDecrement = (countryId, medalType) => handleAdjustCount (countryId, medalType, -1);

    const handleAdjustCount = (countryId, medalType, adjustBy) => {
        const idx = countries.findIndex(c => c.id === countryId);
        let updateOk = false;
        if (idx !== -1) {
            const min = 0;
            const max = 999999;

            var result = countries[idx][medalType] + adjustBy;

            if (result < min)
                result = min;
            if (result > max)
                result = max;

            countries[idx][medalType] = result;

            const jsonPatch = [{ op: "replace", path: medalType, value: countries[idx][medalType]}];
            console.log(`json patch for id: ${countryId}: ${JSON.stringify(jsonPatch)}`);
            try {
                await axios.patch('${apiEndpoint}/${countryId}', jsonPatch, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                let updateOk = true;
            } catch (ex) {
                if (ex.response && ex.response.status === 404) {
                    console.log("The record does not exist -- it may have been deleted!")
                } else if (ex.response && (ex.response.status === 401 || ex.response.status === 403)) {
                    alert('You are not authorized to complete this request');
                    window.location.reload(false);
                } else if (ex.response) {
                    console.log(ex.response);
                } else {
                    console.log('Request Failed');
                }
            }
        }

        if (updateOk) {
            setCountries(countries);
        }
    }

    const getTotalMedalCountByType = (medalType) => {
        let sum = countries.reduce((a, b) => a + b[medalType], 0);
        return sum;
    }

    const getTotalMedalCount = () => {
        let sum = countries.reduce((a, b) => a + (b.bronze + b.gold + b.silver), 0);
        return sum;
    }

    const handleLogin = async (username, password) => {
        console.log(`login: ${username}`);
        try {
            const resp = await axios.post(usersEndpoint, { username: username, password: password });
            const encodedJwt = resp.data.token;
            localStorage.setItem('token', encodedJwt);
            setUser(getUser(encodedJwt));
        } catch (ex) {
            if (ex.response && (ex.response.status === 401 || ex.response.status === 400 )) {
                alert("Login failed");
            } else if (ex.response) {
                console.log(ex.response);
            } else {
                console.log("Request failed");
            }
        }
    }

    const handleLogout = (e) => {
        e.preventDefault();
        console.log('logout');
        localStorage.removeItem('token');
        setUser({
            name: null,
            canPost: false,
            canPatch: false,
            canDelete: false
        });
        return false;
    }

    const getUser = (encodedJwt) => {
        // return unencoded user / permissions
        const decodedJwt = jwtDecode(encodedJwt);
        return {
            name: decodedJwt['username'],
            canPost: decodedJwt['roles'].indexOf('medals-post') === -1 ? false : true,
            canPatch: decodedJwt['roles'].indexOf('medals-patch') === -1 ? false : true,
            canDelete: decodedJwt['roles'].indexOf('medals-delete') === -1 ? false : true,
        };
    }

    const [ user, setUser ] = useState(
        {
            name: null,
            canPost: false,
            canPatch: false,
            canDelete: false
        }
    );

    const latestCountries = useRef(null);
    latestCountries.current = countries;

    useEffect(() => {
         async function fetchData() {
             const {data: fetchedCountries} = await axios.get(apiEndpoint);
             setCountries(fetchedCountries);
         }
         let newMedalList = [
             { id: 1, deco: 'MedalCountBronze', medalType: 'bronze' },
             { id: 2, deco: 'MedalCountSilver', medalType: 'silver' },
             { id: 3, deco: 'MedalCountGold', medalType: 'gold' }
         ];
         setMedalList(newMedalList);
         fetchData();

         const encodedJwt = localStorage.getItem("token");
         // check for existing token
         if (encodedJwt) {
            setUser(getUser(encodedJwt));
         }

         //signalR
         const newConnection = new HubConnectionBuilder()
            .withUrl(hubEndpoint)
            .withAutomaticReconnect()
            .build();
         setConnection(newConnection);
    }, []);

    // componentDidUpdate (changes to connection)
    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('Connected!')

                    connection.on('ReceiveAddMessage', country => {
                        console.log(`Add: ${country.name}`);
                        let mutableCountries = [...latestCountries.current];
                        mutableCountries = mutableCountries.concat(country);

                        setCountries(mutableCountries);
                    });

                    connection.on('ReceiveDeleteMessage', id => {
                        console.log(`Delete id: ${id}`);
                        let mutableCountries = [...latestCountries.current];
                        mutableCountries = mutableCountries.filter(c => c.id !== id);

                        setCountries(mutableCountries);
                    });

                    connection.on('ReceivePatchMessage', country => {
                        console.log(`Patch: ${country.name}`);
                        let mutableCountries = [...latestCountries.current];
                        const idx = mutableCountries.findIndex(c => c.id === country.id);
                        mutableCountries[idx] = country;

                        setCountries(mutableCountries);
                    });
                })
                .catch(e => console.log('Connection failed: ', e));
        }
        // useEffect is dependent on changes connection
    }, [connection]);

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    {user.name ?
                        <span className='logout'><a href="/" onClick={handleLogout} className='logoutLink'>Logout</a> [{user.name}]</span>
                        :
                        <Link to="/login" className='loginLink'>Login</Link>
                    }
                </header>
                { countries.map( country =>
                    <Country key={ country.id } country={ country } onChangeValue={ handleAdjustCount } onDelete={handleDeleteCountry} canDelete={user.canDelete} canPatch={user.canPatch}
                />)}
                <div>
                    <div>
                        Total Medal Count:
                        <span>
                            { getTotalMedalCount () }
                        </span>
                    </div>

                </div>
                { user.canPost && <NewCountry onAddCountry={handleAddCountry} /> }
                <Route exact path="/login">
                    <Login onLogin={handleLogin} />
                </Route>
            </div>

        </Router>
        );
}

export default App;
