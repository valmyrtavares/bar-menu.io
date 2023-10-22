const btnMenu = [
  {
    title: 'Bebidas',
    display: true,
    subBtns: [
      {
        title: 'Alcoólicas',
        display: true,
        subBtns: [
          {
            title: 'Drinks',
            display: true,
            subBtns: [],
            subItems: [
              {
                title: 'Manhattan',
                text: 'Essa é a bebida mais gostosa que existe',
                image:
                  'https://www.thecocktaildb.com/images/media/drink/hz7p4t1589575281.jpg',
                valor: 50,
              },
              {
                title: 'Caipirinha',
                text: 'Essa é a bebida mais gostosa que existe',
                image:
                  'https://www.thecocktaildb.com/images/media/drink/hz7p4t1589575281.jpg',
                valor: 50,
              },
            ],
          },
          { title: 'Vinhos', display: true, subBtns: [], subItems: [] },
          { title: 'Cervejas', display: true, subBtns: [], subItems: [] },
        ],
      },
    ],
    subItems: [],
  },
  { title: 'Pratos', display: true, subBtns: [], subItems: [] },
  { title: 'Lanches', display: true, subBtns: [], subItems: [] },
  { title: 'Sobremesas', display: true, subBtns: [], subItems: [] },
  { title: 'Porções', display: true, subBtns: [], subItems: [] },
  { title: 'Entradas', display: true, subBtns: [], subItems: [] },
];

export default btnMenu;
