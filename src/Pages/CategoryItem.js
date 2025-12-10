import { useCachedImage } from '../Hooks/useCachedImage';
import style from '../assets/styles/CategoryItem.module.scss';

function CategoryItem({ item, chooseCategory }) {
  const src = useCachedImage(item.id, item.image);

  return (
    <div
      className={style.categoryItem}
      onClick={() => chooseCategory(item.parent, item.title)}
    >
      <h3>{item.title}</h3>
      <img src={src} alt={item.title} />
    </div>
  );
}

export default CategoryItem;
