import React from "react";
import { getBtnData } from "../../api/Api";
import "../../assets/styles/requestManagementModule.css";
import Input from "../../component/Input.js";
import { cardClasses } from "@mui/material";

const RequestManagementModule = () => {
  const [requestList, setRequestList] = React.useState(null);
  const [request, setRequest] = React.useState("");
  const [originalRequestList, setOriginalRequestList] = React.useState([]);
  const [form, setForm] = React.useState({
    startDate: "",
    endDate: "",
  });



  React.useEffect(() => {
    const fetchRequest = async () => {
      // 1. Faz a chamada para obter os dados da API (lista de pedidos).
      const data = await getBtnData("request");
  
      // 2. Cria um novo array que vai conter todos os itens de 'request' de todos os pedidos.
      const allRequests = data.reduce((accumulator, currentOrder) => {
        // 3. Para cada pedido (currentOrder), mapeamos o array 'request' que contém os itens do pedido.
        const requestsWithDate = currentOrder.request.map(item => {
          // 4. Para cada item no array 'request', adicionamos o campo 'dateTime' ao item.
          return {
            ...item, // Mantenha todas as propriedades do item original.
            dateTime: currentOrder.dateTime // Adicione a data do pedido (que está no objeto principal) ao item.
          };
        });
  
        // 5. Agora, concatenamos os itens processados no acumulador (accumulator) que contém todos os itens de 'request'.
        return [...accumulator, ...requestsWithDate];
      }, []); // 6. O valor inicial do acumulador é um array vazio ([]).
  
      // 7. Após processar todos os pedidos, atualizamos o estado 'requestList' com o novo array que contém todos os itens de 'request'.
      setRequestList(allRequests);
  
      // 8. Mantemos também a lista original para outros usos, se necessário.
      setOriginalRequestList(allRequests);
  
     
    };
  
    // 9. Chama a função para buscar os dados e processá-los assim que o componente montar.
    fetchRequest();
  }, []);
  

  React.useEffect(() => {
    const filterdDate = ()=>{     
      if(form.startDate && form.endDate){
        const startDate = new Date(form.startDate);
        const endDate = new Date(form.endDate);     
        if (startDate > endDate) {
          alert("Data de início não pode ser maior que a data de fim.")
        }  else {
          // 6. Filtra a lista de pedidos para incluir apenas os itens cuja data está entre 'startDate' e 'endDate'.
        //if(requestList.length>0 && requestList[0].repetitions){ requestList = originalRequestList}
      
          const filteredRequests = originalRequestList.filter(item => {
            // 7. Extrai a data do campo 'dateTime' do item e a transforma em um objeto Date.
            const itemDate = new Date(item.dateTime?.split(" - ")[0].split("/").reverse().join("-"));
            // 8. Retorna true se 'itemDate' estiver dentro do intervalo entre 'startDate' e 'endDate'.
            return itemDate >= startDate && itemDate <= endDate;
          });
          console.log("filteredRequests   ",  filteredRequests)         
          const statsList = calculateProductsStats(filteredRequests);        
          console.log("statsList   ",  statsList)         
                  
          // 9. Atualiza o estado com os pedidos filtrados, mostrando apenas os que estão dentro do período selecionado.
          setRequestList(statsList);
        }
      }
    }
    filterdDate()
  }, [form, originalRequestList]);

  const calculateProductsStats = (filteredRequests) => {
    const productMap = {};
    
  
    filteredRequests.forEach(item => {
      const { name, finalPrice } = item;
  
      // Garantir que finalPrice é um número
      const price = Number(finalPrice) || 0; // Se for inválido, tratamos como 0
  
      if (productMap[name]) {
        productMap[name].repetitions += 1;
        productMap[name].totalSum += price;
      } else {
        // Se o produto não existe no mapa, adiciona uma nova entrada
        productMap[name] = {
          name: name,
          repetitions: 1,
          totalSum: price
        };
      }
    });
  
    // Retorna a lista de produtos com as estatísticas
    return Object.values(productMap);
  };
  

  const handleChange = ({target}) => {
    const { id, value} = target;   
    setForm({
      ...form,
      [id]: value,
    });   
  };

  return (
    <div  className="management-requests">
      
           
        <div className="container-date">
          <div>
            <Input
              id="startDate"
              required
              label="Data Inicial"
              value={form.startDate} 
              type="date"
              onChange={handleChange}
            
            />
          </div>
          <div>
            <Input
              id="endDate"
              required
              label="Data Final"
              value={form.endDate}
              type="date"
              onChange={handleChange}
            
              />
          </div>
      </div>
      <table>
  <thead>
    <tr>
      <th>Nome</th>
      <th>quantidade</th>
      <th>valor total</th>
    </tr>
  </thead>
  <tbody>
    {requestList && requestList.length > 0 && requestList[0].repetitions ? (
      requestList.map((item, index) => (
        <tr key={index}>
          <td>{item.name}</td>
          <td>{item.repetitions}</td>
          <td>{item.totalSum}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="3" className="empty-message">Selecione alguma data válida</td>
      </tr>
    )}
  </tbody>
</table>

        
    </div>
  );
};
export default RequestManagementModule;
