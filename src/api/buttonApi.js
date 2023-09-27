export async  function getBtnData(){    
    try{
        const response = await fetch('https://react-bar-67f33-default-rtdb.firebaseio.com/button.json');
        if(!response.ok){
            throw new Error('Something went wrong!');
        }
        const data = await response.json();
        let updatedArray = [];      
        for(const key in data){
            if(data.hasOwnProperty(key)){        
                updatedArray.push({...data[key], id:key})
            }
        }     
        return updatedArray;
    }
    catch(error){
        throw error
    }
}