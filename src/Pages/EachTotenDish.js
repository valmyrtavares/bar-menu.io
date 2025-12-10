import style from '../assets/styles/EachTotenDish.module.scss';
import { useCachedImage } from '../Hooks/useCachedImage';

const EachTotenDish = ({ item, index, preparedRequest }) => {
  const src = useCachedImage(item.id, item.image);

  return (
    <div
      onClick={item.lowAmountRawMaterial ? null : () => preparedRequest(item)}
      className={style.itemContainer}
      style={{ animationDelay: `${index * 0.1}s` }}
      key={item.id || index} // Evita recriação desnecessária
    >
      <div className={style.image}>
        <img src={src} alt="" />
      </div>
      <h3>
        {item.title}
        {item.lowAmountRawMaterial && (
          <span
            style={{
              display: 'block',
              fontSize: '0.8em',
              color: '#c00',
              marginTop: '4px',
            }}
          >
            INDISPONIVEL
          </span>
        )}
      </h3>
      <div className={style.text}>
        <p>{item.comment}</p>
      </div>
    </div>
  );
};
export default EachTotenDish;
