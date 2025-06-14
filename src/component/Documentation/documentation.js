import React from 'react';
import style from '../../assets/styles/Documentation.module.scss';

const Documentation = () => {
  return (
    <div className={style.documentationContainer}>
      <div className={style.sidebar}>
        <ul className={style.menuList}>
          <li>
            <a href="#introduction" className={style.menuItem}>
              Introdução
            </a>
          </li>
          <li>
            <a href="#usage" className={style.menuItem}>
              Como Usar
            </a>
          </li>
        </ul>
      </div>
      <div className={style.content}>
        <section id="introduction" className={style.section}>
          <h2>Introdução</h2>
          <p>
            Bem-vindo à documentação do Bar Menu. Aqui você encontrará
            informações para utilizar e customizar o aplicativo.
          </p>
        </section>
        <section id="usage" className={style.section}>
          <h2>Como Usar</h2>
          <p>
            Para começar, navegue pelo menu à esquerda e selecione o tópico
            desejado para visualizar o conteúdo correspondente.
          </p>
        </section>
      </div>
    </div>
  );
};
export default Documentation;
