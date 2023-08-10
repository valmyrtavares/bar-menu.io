import React , {useState} from  'react'
import  './btn.css'

const Btn = ({item, toggleDisplay}) => {
    const [display, setDisplay] = useState(item.display)

    function changeStatus() {
        setDisplay(!display);       
        toggleDisplay();
      }
    return (
        <div>
            <button className="colorful" onClick={changeStatus}>{item.title}  <p>{`${item.display}`}</p></button>          
        </div>
    )
}
export default Btn;