import React from 'react';
import {fetchCategoriesItem} from './api/buttonApi';
import Input from './component/Input';

function FormItem(){

    const [form, setForm]= React.useState({
        title: "",
        category:"",
        comment:"",
        price:0,
        display:false
    })
    const [categories, setCategories] = React.useState([]);
   

    React.useEffect(() =>{
        fetchCategories()
    },[])

     const fetchCategories =  async () =>{
        const categories = await fetchCategoriesItem() 
        setCategories(categories);
       }
       function handleChange({target}){       
        const{id, value} = target;
        setForm({...form, [id]:value,[id]:value,[id]:value,[id]:value,[id]:value})
       }

       function handleSubmit(event){
        event.preventDefault();
        console.log(form)
       }

    return(
        <div>
            <form onSubmit={handleSubmit} className="form-position">
            <Input id="title" label="title" value={form.title} type="text" onChange={handleChange} />
           <select id="category" value={form.category} onChange={handleChange}>
            { categories &&   categories.map((category,index)=>(
                <option key={index} value={category}>{category}</option>
                )                
                )}                        
            </select>      
            <Input id="comment" label="Comentário" value={form.comment} type="text" onChange={handleChange} />
            <Input id="price" label="Preço" value={form.price} type="number" onChange={handleChange} />
            <Input id="image" label="image" value={form.image} type="text" onChange={handleChange} />
            <button>Enviar</button>
      </form>    
        </div>)
}
export default FormItem;
