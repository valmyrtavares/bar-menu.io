import style from '../assets/styles/EachTotenDish.module.scss';

const EachTotenDish = ({ item, index, preparedRequest }) => {
  return (
    <div
      onClick={() => preparedRequest(item)}
      className={style.itemContainer}
      style={{ animationDelay: `${index * 0.1}s` }}
      key={item.id || index} // Evita recriação desnecessária
    >
      <div className={style.image} onClick={() => preparedRequest(item)}>
        <img src={item.image} alt="" />
      </div>
      <h3>{item.title}</h3>
      <div className={style.text}>
        <p>{item.comment}</p>
      </div>
    </div>
  );
};
export default EachTotenDish;
