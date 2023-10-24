export async function getBtnData(collectionName) {
  try {
    const response = await fetch(
      `https://react-bar-67f33-default-rtdb.firebaseio.com/${collectionName}.json`
    );
    if (!response.ok) {
      throw new Error('Something went wrong!');
    }
    const data = await response.json();
    let updatedArray = [];
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        updatedArray.push({ ...data[key], id: key });
      }
    }
    return updatedArray;
  } catch (error) {
    throw error;
  }
}

export async function fetchCategories(item) {
  const categories = await getBtnData(item);

  return categories.map((item) => item.parent);
}

export async function fetchCategoriesItem(collectionName) {
  const parents = await fetchCategories(collectionName); // All parents used
  const categories = await getBtnData(collectionName); //Whole objects array from firevase

  let usedCategories = new Set(categories.map((item) => item.category)); //Changing categories in object and  to set to remove duplicates
  const usedParentsItems = parents.filter((item) => !usedCategories.has(item)); //Filtering parents that are not in usedCategories

  return usedParentsItems;
}
