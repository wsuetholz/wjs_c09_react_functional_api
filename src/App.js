import logo from './logo.svg';
import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css';
import Country from './components/country';
import Medal from "./components/medal";
import NewCountry from "./components/newcountry";

const App = () => {
    const [ countries, setCountries ] = useState([]);
    const [ medalList, setMedalList ] = useState([]);
    const apiEndpoint = "https://wjsolympicmedals.azurewebsites.net/api/countries"
    //const apiEndpoint = "https://localhost:44302/api/countries";

    const handleAddCountry = async (countryId, name, flag) => {
        let id = countryId;
        let flg = flag;
        if (id === '') {
            id = countries.length + 1;
            id = '' + id;
        }
        const { data: post } = await axios.post(apiEndpoint, { id: id, name: name, flag: flg, bronze: 0, gold: 0, silver: 0 });
        setCountries(countries.concat(post));
    }

    const handleDeleteCountry = async (countryId) => {
        const deletePath = apiEndpoint + '/' + countryId;
        await axios.delete(deletePath)
        setCountries(countries.filter(c => c.id !== countryId));
    }

    const handleAdjustCount = (countryId, medalType, adjustBy) => {
        const idx = countries.findIndex(c => c.id === countryId);
        if (idx !== -1) {
            const min = 0;
            const max = 999999;

            var result = countries[idx][medalType] + adjustBy;

            if (result < min)
                result = min;
            if (result > max)
                result = max;

            countries[idx][medalType] = result;
        }

        setCountries(countries);
    }

    const getTotalMedalCountByType = (medalType) => {
        let sum = countries.reduce((a, b) => a + b[medalType], 0);
        return sum;
    }

    const getTotalMedalCount = () => {
        let sum = countries.reduce((a, b) => a + (b.bronze + b.gold + b.silver), 0);
        return sum;
    }

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
    }, []);

    return (
        <React.Fragment>
            <div className="App">
                <header className="App-header">
                </header>
                { countries.map( country =>
                    <Country key={ country.id } country={ country } onChangeValue={ handleAdjustCount } onDelete={handleDeleteCountry}
                />)}
                <div>
                    <div>
                        Total Medal Count:
                        <span>
                            { getTotalMedalCount () }
                        </span>
                    </div>

                </div>
                <NewCountry onAddCountry={handleAddCountry} />
            </div>
        </React.Fragment>
        );
}

export default App;
