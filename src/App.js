import logo from './logo.svg';
import React, { useState, useEffect } from "react";
import './App.css';
import Country from './components/country';
import Medal from "./components/medal";
import NewCountry from "./components/newcountry";

const App = () => {
    const [ countries, setCountries ] = useState([]);
    const [ medalList, setMedalList ] = useState([]);

    const handleAddCountry = (countryId, name, flag) => {
        let id = countryId;
        let flg = flag;
        if (id === '')
            id = countries.length + 1;
        const newCountries = [...countries].concat({id: id, name: name, flag: flg, bronze: 0, gold: 0, silver: 0 });
        setCountries(newCountries);
    }

    const handleDeleteCountry = (countryId) => {
        const newCountries = [...countries].filter(c => c.id !== countryId);
        setCountries(newCountries);
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
         let newCountries = [
             {
                 id: 'as',
                 name: 'Australia',
                 flag: 'http://worldometers.info/img/flags/as-flag.gif',
                 bronze: 0,
                 gold: 0,
                 silver: 0
             },
             {
                 id: 'nr',
                 name: 'Nauru',
                 flag: 'http://worldometers.info/img/flags/nr-flag.gif',
                 bronze: 0,
                 gold: 0,
                 silver: 0
             },
             {
                 id: 'nz',
                 name: 'New Zealand',
                 flag: 'http://worldometers.info/img/flags/nz-flag.gif',
                 bronze: 0,
                 gold: 0,
                 silver: 0
             }

         ];
         setCountries(newCountries);
         let newMedalList = [
             { id: 1, deco: 'MedalCountBronze', medalType: 'bronze' },
             { id: 2, deco: 'MedalCountSilver', medalType: 'silver' },
             { id: 3, deco: 'MedalCountGold', medalType: 'gold' }
         ];
         setMedalList(newMedalList);
    }, []);

    return (
        <React.Fragment>
            <div className="App">
                <header className="App-header">
                </header>
                { countries.map( country =>
                    <Country key={ country.id } country={ country } onChangeValue={ handleAdjustCount }
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
