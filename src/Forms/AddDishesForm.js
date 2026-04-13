import React from 'react';
import { fetchCategoriesItem } from '../api/Api.js';
import Input from '../component/Input.js';
import Title from '../component/title.js';
import { db, storage } from '../config-firebase/firebase.js';
import MenuButton from '../component/menuHamburguerButton.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
} from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import IncludeSideDishesForm from './IncludeSideDishesForm.js';
import PriceAndExpenseBuilder from '../component/Payment/PriceAndExpenseBuilder';
import '../assets/styles/form.css';
import style from '../assets/styles/AddDishesForm.module.scss';
import CustomizePriceForm from './CustomizePriceForm';
import RecipeDish from './recipeDishForm.js';
import useFormValidation from '../Hooks/useFormValidation.js';
import { GlobalContext } from '../GlobalContext.js';
import { tooltips } from '../constants/tooltips.js';
//import { cardClasses } from "@mui/material";

function AddDishesForm({
  dataObj,
  mainTitle,
  setModalEditDishes,
  closeModal,
  fetchDataCollection,
}) {

  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    title: '',
    category: '',
    comment: '',
    price: 0,
    costProfitMargin: {},
    image: '',
    recipe: {},
    costPriceObj: {},
    display: false,
    carrossel: false,
    sideDishesElementList: [],
    maxLimitSideDishes: 0,
    CustomizedPrice: {},
    costProfitMarginCustomized: {},
  });
  const [categories, setCategories] = React.useState([]);
  const [costByRecipe, setCostByRecipe] = React.useState(null);
  const [url, setUrl] = React.useState('');
  const [showPopupCostAndPrice, setShowPopupCostAndPrice] =
    React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [showPopupSideDishes, setShowPopupSideDisehs] = React.useState(false);
  const [showPopupCustomizePrice, setShowPopupCustomizePrice] =
    React.useState(false);
  const [newSideDishesList, setNewSideDishesList] = React.useState([]);
  const [maxLimitSideDishes, setMaxLimitSideDishes] = React.useState([]);
  const [customizedPriceObj, setCustomizedPriceObj] = React.useState({});
  const [costProfitMarginCustomized, setCostProfitMarginCustomized] =
    React.useState({});
  const [recipeModal, setRecipeModal] = React.useState(false);
  const [recipe, setRecipe] = React.useState(null);
  const { handleBlur } = useFormValidation();
  const { packageTier, hasRawMaterial } = React.useContext(GlobalContext);

  //FIRESTORE

  //Update the new side dishes that come from noNameDishesInDishes
  React.useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      sideDishesElementList: newSideDishesList,
      maxLimitSideDishes: maxLimitSideDishes,
      recipe: recipe,
    }));
  }, [newSideDishesList, maxLimitSideDishes]);

  React.useEffect(() => {
    if (recipe) {
      form.recipe = recipe;
    }
  }, [recipe]);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  //If is there a filled dataObj it will load the input fields
  React.useEffect(() => {
    if (dataObj) {
      setForm(dataObj);
      setNewSideDishesList(dataObj.sideDishesElementList);
      setMaxLimitSideDishes(dataObj.maxLimitSideDishes);
      setCustomizedPriceObj(dataObj.CustomizedPrice);
      setRecipe(dataObj.recipe ? dataObj.recipe : {});
      setCostProfitMarginCustomized(
        dataObj.costProfitMarginCustomized
          ? dataObj.costProfitMarginCustomized
          : {},
      );
    }
  }, [dataObj]);

  const fetchCategories = async () => {
    const categories = await fetchCategoriesItem('button');
    console.log('Fetched categories:', categories);
    categories.unshift('Selecione uma categoria'); // Add a first option
    setCategories(categories);
  };

  function handleChange({ target }) {
    const { id, value, type, checked } = target;
    if (id === 'price') {
      const formattedValue = value;
      console.log(formattedValue);
      setForm({
        ...form,
        [id]: formattedValue,
      });
    } else if (type === 'checkbox') {
      setForm({
        ...form,
        [id]: checked, // Use checked diretamente, que já é um booleano
      });
    } else {
      setForm({
        ...form,
        [id]: value,
      });
    }
  }

  const onfileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const path = `dishes/${file.name}`;
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress function (optional)
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error('Erro no upload:', error.code, error.message);
        },
        async () => {
          // Handle successful uploads
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUrl(downloadURL);
          form.image = downloadURL;
        },
      );
    }
  };

  function handleSubmit(event) {
    event.preventDefault();

    const cleanForm = (obj) => {
      const newObj = { ...obj };
      Object.keys(newObj).forEach((key) => {
        if (newObj[key] === undefined) {
          delete newObj[key];
        } else if (newObj[key] && typeof newObj[key] === 'object' && !Array.isArray(newObj[key])) {
          newObj[key] = cleanForm(newObj[key]);
        }
      });
      return newObj;
    };

    const cleanedForm = cleanForm(form);

    if (!dataObj) {
      addDoc(collection(db, 'item'), cleanedForm)
        .then((docRef) => {
          navigate('/');
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log('Dados completos', form);

      cleanedForm.recipe.Explanation = cleanedForm.recipe.Explanation
        ? cleanedForm.recipe.Explanation
        : 'Receita Vazia';
      setDoc(doc(db, 'item', dataObj.id), cleanedForm)
        .then(() => {
          if (fetchDataCollection) fetchDataCollection();
          navigate('/');
          console.log('Document successfully updated !');
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  const openModalSideDishes = () => {
    setShowPopupSideDisehs(true);
    if (dataObj) {
      console.log('Data obj', dataObj);
    }
  };

  const openRecipeModal = () => {
    setRecipeModal(true);
    console.log(recipeModal);
  };

  React.useEffect(() => {
    if (customizedPriceObj) {
      console.log('Customized Price oBJ   ', customizedPriceObj);
      setForm((prevForm) => ({
        ...prevForm,
        CustomizedPrice: customizedPriceObj,
        costProfitMarginCustomized: costProfitMarginCustomized,
      }));
    }
  }, [customizedPriceObj]);

  React.useEffect(() => {
    if (
      costProfitMarginCustomized &&
      costProfitMarginCustomized.firstPrice &&
      costProfitMarginCustomized.secondPrice
    ) {
      setCustomizedPriceObj({
        firstLabel: costProfitMarginCustomized.firstPrice?.label,
        firstPrice: costProfitMarginCustomized.firstPrice?.price,
        firstPrice: costProfitMarginCustomized.firstPrice?.price,
        secondLabel: costProfitMarginCustomized.secondPrice?.label,
        secondPrice: costProfitMarginCustomized.secondPrice?.price,
        thirdLabel: costProfitMarginCustomized.thirdPrice?.label,
        thirdPrice: costProfitMarginCustomized.thirdPrice?.price,
      });
      console.log('customizedPriceObj    ', customizedPriceObj);
    }
  }, [costProfitMarginCustomized]);

  const onPriceChange = (customizedPriceChanged) => {
    setCostProfitMarginCustomized(customizedPriceChanged);
    setShowPopupCustomizePrice(false);
  };

  const addPriceObj = (obj) => {
    obj.profit = obj.price - obj.cost;

    // Atualizando o estado de forma correta
    setForm((prevForm) => ({
      ...prevForm,
      costPriceObj: obj,
      price: obj.price,
    }));
    setShowPopupCostAndPrice(false);
  };

  React.useEffect(() => {
    if (form.costPriceObj) {
      console.log('form   ', form);
      console.log('costPriceObj   ', form.costPriceObj);
    }
    console.log('form', form);
  }, [form]);

  const handleSinglePriceUpdate = (totalCost) => {
    setForm((prevForm) => {
      // Pega o preço atual do formulário
      const price = parseFloat(prevForm.price) || 0;
      const cost = parseFloat(totalCost) || 0;
      let percentage = 0;
      if (price > 0 && cost > 0) {
        percentage = ((price - cost) / cost) * 100;
      }
      return {
        ...prevForm,
        costPriceObj: {
          ...prevForm.costPriceObj,
          price: price, // <--- ADICIONAR ESTA LINHA IMPORTANTE
          cost: cost,
          percentage: percentage.toFixed(2),
        },
      };
    });
  };
  const handleCustomPriceUpdate = (updatedCostsObj) => {
    setForm((prevForm) => {
      const calculatePct = (price, cost) => {
        const p = parseFloat(price) || 0;
        const c = parseFloat(cost) || 0;
        if (p > 0 && c > 0) return (((p - c) / c) * 100).toFixed(2);
        return 0;
      };

      const newCostProfit = { ...prevForm.costProfitMarginCustomized };
      let newCostPriceObj = { ...prevForm.costPriceObj };
      let newMainPrice = prevForm.price;

      ['firstPrice', 'secondPrice', 'thirdPrice'].forEach((key) => {
        if (updatedCostsObj[key]) {
          // Garante que existe a estrutura antes de alterar
          // Usa o objeto existente em prevForm OU cria se não existir (cenário raro se fluxo seguido)
          if (
            !newCostProfit[key] &&
            prevForm.CustomizedPrice &&
            prevForm.CustomizedPrice[key]
          ) {
            newCostProfit[key] = { ...prevForm.CustomizedPrice[key] };
          } else if (!newCostProfit[key]) {
            newCostProfit[key] = {};
          }

          const cost = updatedCostsObj[key].cost;
          // O preço deve vir de newCostProfit (que deve ter sido populado via CustomizePriceForm)
          // Se newCostProfit não tiver, tentamos pegar de CustomizedPrice que é o espelho original
          const price =
            newCostProfit[key].price ||
            (prevForm.CustomizedPrice && prevForm.CustomizedPrice[key]
              ? prevForm.CustomizedPrice[key].price
              : 0);

          newCostProfit[key].price = price; // Garante que preço está lá
          newCostProfit[key].cost = cost;
          newCostProfit[key].percentage = calculatePct(price, cost);

          // Lógica de sincronização com preço único se for o PRIMEIRO preço
          if (key === 'firstPrice' && price > 0) {
            newMainPrice = price;
            newCostPriceObj = {
              price: price,
              cost: cost,
              percentage: calculatePct(price, cost),
              // Se precisar de label: label: newCostProfit[key].label
            };
          }
        }
      });

      return {
        ...prevForm,
        price: newMainPrice,
        costPriceObj: newCostPriceObj,
        costProfitMarginCustomized: newCostProfit,
      };
    });
  };

  return (
    <div className={style.containerAddDishesForm}>
      {showPopupCostAndPrice && (
        <PriceAndExpenseBuilder
          setShowPopupCostAndPrice={setShowPopupCostAndPrice}
          addPriceObj={addPriceObj}
          objPriceCost={form.costPriceObj}
          costProfitMarginCustomized={form.costProfitMarginCustomized}
          recipe={form.recipe}
          id={form.id}
        />
      )}

      {showPopupSideDishes && (
        <div className={style.containerNewSideDishes}>
          <IncludeSideDishesForm
            setShowPopupSideDisehs={setShowPopupSideDisehs}
            setNewSideDishesList={setNewSideDishesList}
            newSideDishesList={newSideDishesList}
            setMaxLimitSideDishes={setMaxLimitSideDishes}
            maxLimitSideDishes={maxLimitSideDishes}
          />
        </div>
      )}

      <div className={style.customizePriceContainer}>
        {showPopupCustomizePrice && (
          <CustomizePriceForm
            setShowPopupCustomizePrice={setShowPopupCustomizePrice}
            onPriceChange={onPriceChange}
            customizedPriceObj={costProfitMarginCustomized}
          />
        )}
      </div>

      <div className={style.recipeModalContainer}>
        {recipeModal && (
          <RecipeDish
            setRecipeModal={setRecipeModal}
            setRecipe={setRecipe}
            recipe={recipe}
            customizedPriceObj={customizedPriceObj}
            costByRecipe={form.costPriceObj}
            costProfitMarginCustomized={form.costProfitMarginCustomized}
            onSingleCostUpdate={handleSinglePriceUpdate}
            onCustomCostUpdate={handleCustomPriceUpdate}
          />
        )}
      </div>

      <div className={style.formPageContent}>
        <div className={style.formHeader}>
          <div className={style.helpIconHeader}>
            <div className={style.helpIconContainer}>
              <a
                href="https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.hi6g5k67uo8k"
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir documentação"
              >
                <span>?</span>
              </a>
            </div>
          </div>
          <Link to="/admin/admin">
            <Title mainTitle={mainTitle ? mainTitle : 'Adicione um prato'} />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className={style.mainFormBody}>
          {/* Seção 1: Identificação */}
          <section className={style.formSection}>
            <div className={style.sectionTitle}>ℹ️ Informações Básicas</div>
            <div className={style.inputGroup}>
              <Input
                id="title"
                label="Título do Prato"
                placeholder="Ex: Picanha na Chapa"
                required
                value={form.title}
                type="text"
                onChange={handleChange}
                title={tooltips.addDishesForm.title}
              />
            </div>
            
            <div className={style.inputGroup}>
              <label className={style.label} title={tooltips.addDishesForm.category}>Categoria do Menu</label>
              <select
                id="category"
                required
                value={form.category}
                className={style.select}
                onChange={handleChange}
              >
                {categories &&
                  categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </div>

            <div className={style.inputGroup}>
              <Input
                id="comment"
                required
                label="Comentário / Descrição Curta"
                placeholder="Ex: Acompanha arroz e fritas"
                value={form.comment}
                type="text"
                onChange={handleChange}
                title={tooltips.addDishesForm.comment}
              />
            </div>
          </section>

          {/* Seção 2: Estratégia de Preço */}
          <section className={style.formSection}>
            <div className={style.sectionTitle}>💰 Precificação e Custos</div>
            {hasRawMaterial ? (
              <div className={style.pricingOptions}>
                <div className={style.priceBadge} onClick={() => setShowPopupCostAndPrice(true)}>
                   <span className={style.badgeLabel}>Preço Único</span>
                   <span className={style.badgeValue}>R$ {form.price}</span>
                   <span className={style.editHint}>Clique para editar</span>
                </div>
                
                <div className={style.priceBadge} onClick={() => setShowPopupCustomizePrice(true)}>
                   <span className={style.badgeLabel}>Preços Customizados</span>
                   <span className={style.badgeValue}>Vários Tamanhos</span>
                   <span className={style.editHint}>Clique para configurar</span>
                </div>
              </div>
            ) : (
              <div className={style.inputGroup}>
                <Input
                  id="price"
                  label="Preço de Venda (R$)"
                  required
                  value={form.price}
                  type="number"
                  onChange={handleChange}
                  title={tooltips.addDishesForm.price}
                />
              </div>
            )}
          </section>

          {/* Seção 3: Imagem e Visibilidade */}
          <section className={style.formSection}>
            <div className={style.sectionTitle}>📸 Mídia e Visibilidade</div>
            
            <div className={style.imageUploadContainer}>
              <div className={style.uploadHeader}>
                <label className={style.label}>Capa do Prato</label>
                <input type="file" id="fileInput" className={style.fileInput} onChange={onfileChange} />
                <label htmlFor="fileInput" className={style.uploadBtn}>
                  {progress > 0 && progress < 100 ? `Enviando ${progress.toFixed(0)}%` : 'Selecionar Imagem'}
                </label>
              </div>

              {progress > 0 && progress < 100 && (
                <div className={style.progressBarContainer}>
                   <div className={style.progressBar} style={{ width: `${progress}%` }} />
                </div>
              )}

              <div className={style.imagePreviewArea}>
                {url || form.image ? (
                  <div className={style.previewWrapper}>
                    <img className={style.previewImg} src={url || form.image} alt="Dish preview" />
                    <span className={style.previewHint}>Imagem Atual</span>
                  </div>
                ) : (
                  <div className={style.noImage}>Sem imagem carregada</div>
                )}
                
                <div className={style.inputGroupInline}>
                  <Input
                    id="image"
                    label="Ou cole o link da imagem"
                    value={form.image}
                    type="text"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className={style.visibilityToggle}>
              <div className={style.checkWrapper}>
                <input
                  className={style.checkbox}
                  id="carrossel"
                  type="checkbox"
                  checked={form.carrossel}
                  onChange={handleChange}
                />
                <label htmlFor="carrossel" title={tooltips.addDishesForm.carrossel}>
                  Destacar este item no Carrossel da Página Principal
                </label>
              </div>
            </div>
          </section>

          {/* Botão Salvar Principal */}
          <div className={style.formButtonSubmit}>
            <button type="submit">Salvar Alterações do Prato</button>
          </div>
        </form>

        {/* Barra de Ações Rápidas Inferior */}
        <div className={style.bottomActionBar}>
          <button className={style.actionBtn} type="button" onClick={openModalSideDishes} title={tooltips.addDishesForm.sideDishes}>
            🍱 Acompanhamentos
          </button>
          {hasRawMaterial && (
            <button className={style.actionBtn} type="button" onClick={openRecipeModal}>
              📖 Receita Detalhada
            </button>
          )}
        </div>

        {/* Inputs Escondidos */}
        <div className={style.hiddenFields}>
           <input type="hidden" value={form.sideDishesElementList} />
           <input type="hidden" value={form.maxLimitSideDishes} />
        </div>
      </div>
    </div>
  );
}
export default AddDishesForm;
