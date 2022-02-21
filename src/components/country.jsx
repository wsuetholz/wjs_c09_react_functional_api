import React, { useEffect } from 'react';
import Medal from './medal';
import IncrDecrButtons from './incrdecrbuttons';

const Country = (props) => {
    const { onChangeValue, country } = props;
    const medalList = [
        { id: 1, deco: 'MedalCountBronze', count: country.bronze, medalType: 'bronze' },
        { id: 2, deco: 'MedalCountSilver', count: country.silver, medalType: 'silver' },
        { id: 3, deco: 'MedalCountGold', count: country.gold, medalType: 'gold' }
    ];

    return (
        < div className="Country" >
            <div>
                Country:
                <a className='CountryName' >
                    { country.name }
                </a>
                <img src={country.flag} className="CountryFlag" alt="Flag" />
            </div>
            <div>
                Medals:
                { medalList.map( medal =>
                    <Medal key={ medal.id } countryId={ country.id } medal={ medal } onChangeValue={ onChangeValue }
                    />)}
            </div>
            <div>
                { medalList.map( medal =>
                    <IncrDecrButtons key={ medal.id } countryId={ country.id } medal={ medal } onChangeValue={ onChangeValue }
                    />)}
            </div>
            <div>
                <a>
                    Total Medals Earned: { country.bronze + country.gold + country.silver }
                </a>
            </div>
            <hr />
        </div>
    );
}

export default Country
