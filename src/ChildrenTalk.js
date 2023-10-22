import React from 'react';


const ChildrenTalks = (props) =>{

const handleClick = () =>{
    props.lux()
}

    return(
        <>
        <h1>{props.text}</h1>
        <button onClick={handleClick}>{props.title}</button>
        </>
    )
}

export default ChildrenTalks;