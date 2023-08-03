import React , {useState} from  'react'
import  './btn.css'

const Btn = ({item}) => {
    return (
        <div>
            <button className="colorful">{item.title} times</button>          
        </div>
    )
}
export default Btn;