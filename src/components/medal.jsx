import React, { useEffect } from 'react';

const Medal = (props) => {

    const { countryId, onChangeValue, medal } = props;

    return (
        <a className={medal.deco} >
            <button onClick={ e => { onChangeValue (countryId, medal.medalType, -1); }} className='IncrMedalButton' >
                -
            </button>
            { medal.count }
            <button onClick={ e => { onChangeValue (countryId, medal.medalType, 1); }} className='IncrMedalButton' >
                +
            </button>
        </a>
    );
}

export default Medal
