import React from 'react';
import { FAQ } from '../data/faq';

const Faq = () => (
  <section className="section" id="faq" aria-labelledby="faq-title">
    <div className="container split split--faq">
      <div className="split__text">
        <h2 id="faq-title" className="section__title">
          Cloud inversion questions
        </h2>
        <p className="section__lead">Quick answers on what causes a sea of cloud and how to see one.</p>
      </div>
      <div className="faq">
        {FAQ.map((f, i) => (
          <details key={f.q} className="faq__item" open={i === 0}>
            <summary>
              <h3>{f.q}</h3>
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default Faq;
