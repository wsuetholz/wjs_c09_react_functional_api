import React, { useEffect } from 'react';

const IncrDecrButtons = (props) => {

    const { countryId, onChangeValue, medal } = props;

    return (
        <a className="IncrMedalButtons" >
            <button onClick={ e => { onChangeValue (countryId, medal.medalType, -1); }} className='IncrMedalButton' >
                -
            </button>
            <button onClick={ e => { onChangeValue (countryId, medal.medalType, 1); }} className='IncrMedalButton' >
                +
            </button>
        </a>
    );
}

export default IncrDecrButtons
