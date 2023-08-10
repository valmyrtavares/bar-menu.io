import React , {useState} from  'react'
import  './btn.css'

const Btn = ({item}) => {
    const [display, setDisplay] = useState(false); 

    const hasChildItems = () => {
        setDisplay(!display);
      };

    return (
        <div>
            <button onClick={hasChildItems} className="colorful">{item.title} times</button>
           {display && (<p>{JSON.stringify(item, null, 2)}</p>)}                 
        </div>
    )
}
export default Btn;