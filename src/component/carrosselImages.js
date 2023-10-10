import React from "react";
import "./carrosselImages.css";

function CarrosselImages({ }) {

const [index, setIndex] = React.useState(0);
    const [images, setImages] = React.useState([
        "https://img.elo7.com.br/product/zoom/258B7CB/adesivo-parede-restaurante-prato-feito-comida-caseira-lenha-adesivo-restaurante-fritas-salada.jpg", 
        "https://img.cybercook.com.br/receitas/151/x-salada-3.jpeg", 
        "https://www.melhoresdestinos.com.br/wp-content/uploads/2020/09/comidas-tipicas-capa2019.jpg"
    ]);

    React.useEffect(()=>{
       const intervalId = setInterval(()=>{
        setIndex((prevIndex) => (prevIndex + 1)%images.length)
       },2000);

       console.log("Fui chamado")
        return () => clearInterval(intervalId);
    },[images])



    return(
        <>
        <div className="content-carrossel">
            <div className="carrossel">
                <img src={images[index]}/>
            </div>
        </div>
        </>
    )

}
export default CarrosselImages;
//