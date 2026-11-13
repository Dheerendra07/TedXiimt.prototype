import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Compass, Lightbulb, MessagesSquare, MoveUpRight } from 'lucide-react';

const principles = [
  {
    number: '01',
    title: 'Curiosity',
    copy: 'The courage to look at an everyday question from an entirely different angle.',
    Icon: Lightbulb,
  },
  {
    number: '02',
    title: 'Perspective',
    copy: 'The chance to hear a lived experience that makes the world feel a little wider.',
    Icon: Compass,
  },
  {
    number: '03',
    title: 'Conversation',
    copy: 'A good idea does not end with applause. It gives people something worth discussing.',
    Icon: MessagesSquare,
  },
  {
    number: '04',
    title: 'Possibility',
    copy: 'A new thought can be the first step towards a different way of doing things.',
    Icon: MoveUpRight,
  },
];

const ValueProposition = () => (
  <section className="tedx-values">
    <div className="tedx-values__intro">
      <div className="tedx-section-kicker"><span>WHY IDEAS MATTER</span><i /> THE TEDx SPIRIT</div>
      <h2>Not just something<br />to <em>watch.</em></h2>
      <p>
        The best part of an idea is what it starts: a question, a conversation, a new point of view.
        That is the spirit we bring to the TEDxIIMT stage.
      </p>
      <a href="/about" className="tedx-text-link">More about TEDxIIMT <MoveUpRight size={17} aria-hidden="true" /></a>
    </div>
    <div className="tedx-values__list">
      {principles.map(({ number, title, copy, Icon }, index) => (
        <Motion.article
          key={number}
          className="tedx-values__item"
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: .5, delay: index * .07 }}
        >
          <span className="tedx-values__number">{number}</span>
          <div><h3>{title}</h3><p>{copy}</p></div>
          {React.createElement(Icon, { size: 24, strokeWidth: 1.25, 'aria-hidden': true })}
        </Motion.article>
      ))}
    </div>
  </section>
);

export default ValueProposition;
