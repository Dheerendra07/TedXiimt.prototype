import React from 'react';
import { motion as Motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Handshake,
  Lightbulb,
  Mic2,
  Sparkles,
  Users,
} from 'lucide-react';
import Hero from '../components/Hero';
import SocialMedia from '../components/SocialMedia';
import Partners from '../components/Partners';
import Blog from '../components/Blog';
import FloatingCTA from '../components/FloatingCTA';
import './HomePage.css';

const pillars = [
  { number: '01', label: 'EDUCATION', title: <>LEARN TO <em>QUESTION.</em></>, description: 'A new perspective begins when a familiar answer is challenged.', Icon: BookOpen, className: 'ted-home-pillar--education' },
  { number: '02', label: 'ENTERTAINMENT', title: <>MAKE EVERY <em>MOMENT MATTER.</em></>, description: 'Stories and expression that make an idea stay with you.', Icon: Sparkles, className: '' },
  { number: '03', label: 'ENTREPRENEURSHIP', title: <>TURN IDEAS <em>INTO ACTION.</em></>, description: 'The curiosity to imagine something better—and the courage to begin.', Icon: Lightbulb, className: '' },
];

const discovery = [
  { index: '01', label: 'THE VOICES', title: 'Ideas have a voice.', description: 'Meet the speakers and explore the perspectives brought to the TEDxIIMT stage.', href: '/speakers', action: 'MEET THE SPEAKERS', Icon: Mic2 },
  { index: '02', label: 'THE PEOPLE', title: 'Made possible together.', description: 'Get to know the team building the experience behind every idea.', href: '/team', action: 'MEET THE TEAM', Icon: Users },
  { index: '03', label: 'THE ECOSYSTEM', title: 'Good ideas need allies.', description: 'Discover the partners who help create room for meaningful conversations.', href: '/partners', action: 'VIEW PARTNERS', Icon: Handshake },
];

const takeaways = [
  { index: '01 / PERSPECTIVE', title: 'See differently.', description: 'Encounter ideas that invite you to look beyond the familiar.' },
  { index: '02 / CONNECTION', title: 'Meet through ideas.', description: 'Find common ground with people who are curious about what comes next.' },
  { index: '03 / CURIOSITY', title: 'Keep asking.', description: 'Leave with new questions, fresh context and a wider point of view.' },
  { index: '04 / POSSIBILITY', title: 'Make it matter.', description: 'Carry an idea into your studies, work, community or next project.' },
];

const Reveal = ({ children, className = '', delay = 0, ...props }) => (
  <Motion.div
    {...props}
    className={className}
    initial={{ opacity: 0, y: 26 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.16 }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </Motion.div>
);

const HomePage = () => (
  <div className="ted-home min-h-screen bg-black text-white">
    <main id="main-content">
      {/* Preserve the established hero artwork, mosaic and pointer interactions. */}
      <Hero />

      <section className="ted-home-statement" aria-labelledby="home-statement-heading">
        <div className="ted-home-shell ted-home-statement-grid">
          <Reveal>
            <span className="ted-home-kicker">TEDxIIMT UNIVERSITY / IDEAS WORTH SPREADING</span>
            <h2 id="home-statement-heading" className="ted-home-statement-title">
              <span>IDEAS</span><span className="accent">DON'T</span><span>STAND STILL.</span>
            </h2>
          </Reveal>
          <Reveal className="ted-home-statement-aside" delay={0.12}>
            <p>A local stage for original thinking, unexpected perspectives and conversations that can move an idea beyond the room.</p>
            <div className="ted-home-statement-meta">IIMT UNIVERSITY · MEERUT</div>
          </Reveal>
        </div>
      </section>

      <section className="ted-home-pillars" aria-labelledby="home-pillars-heading">
        <div className="ted-home-shell">
          <Reveal className="ted-home-pillars-head">
            <div>
              <span className="ted-home-kicker">THE THEME / THREE LENSES</span>
              <h2 id="home-pillars-heading" className="ted-home-section-heading">A wider way to <em>see the world.</em></h2>
            </div>
            <p>Education, Entertainment and Entrepreneurship are more than categories. They are different ways to question, connect and create.</p>
          </Reveal>
          <div className="ted-home-pillar-grid">
            {pillars.map(({ number, label, title, description, Icon, className }, index) => (
              <Reveal key={number} data-number={number} className={'ted-home-pillar ' + className} delay={index * 0.1}>
                <div className="ted-home-pillar-top">
                  <span className="ted-home-pillar-label">{number} / {label}</span>
                  <span className="ted-home-pillar-symbol"><Icon aria-hidden="true" /></span>
                </div>
                <h3 data-number={number}>{title}</h3>
                <div className="ted-home-pillar-bottom">
                  <span>{description}</span><ArrowUpRight aria-hidden="true" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ted-home-origin" aria-labelledby="home-origin-heading">
        <div className="ted-home-shell ted-home-origin-grid">
          <Reveal className="ted-home-origin-mark">
            <div className="ted-home-origin-logo"><span className="ted">TED</span><span className="x">x</span></div>
            <div className="ted-home-origin-caption"><span>INDEPENDENTLY ORGANIZED</span><span>MEERUT / INDIA</span></div>
          </Reveal>
          <Reveal className="ted-home-origin-copy" delay={0.12}>
            <span className="ted-home-kicker">A GLOBAL IDEA / A LOCAL STAGE</span>
            <h2 id="home-origin-heading">What is <span>TEDx?</span></h2>
            <p>TEDx is a program of local, independently organized events that bring people together to share a TED-like experience. Each event is organized under a license from TED.</p>
            <p>At IIMT University in Meerut, TEDxIIMT creates a space for students, educators and curious minds to encounter ideas worth spreading.</p>
            <div className="ted-home-origin-note"><span>INDEPENDENTLY ORGANIZED</span><span>IDEAS WORTH SPREADING</span><span>IIMT UNIVERSITY</span></div>
            <a className="ted-home-link mt-8" href="/about">Discover the TEDx story <ArrowUpRight aria-hidden="true" /></a>
          </Reveal>
        </div>
      </section>

      <section className="ted-home-stage" aria-labelledby="home-stage-heading">
        <div className="ted-home-shell ted-home-stage-inner">
          <Reveal>
            <span className="ted-home-kicker">THE STAGE / THE NEXT PERSPECTIVE</span>
            <h2 id="home-stage-heading">A stage for ideas that <span>move people.</span></h2>
            <p>Every talk begins with a thought. Explore the voices behind the ideas—or take the first step towards sharing an idea of your own.</p>
          </Reveal>
          <Reveal className="ted-home-stage-actions" delay={0.15}>
            <a className="ted-home-link ted-home-link--red" href="/speakers">Explore speakers <ArrowUpRight aria-hidden="true" /></a>
            <a className="ted-home-link" href="/speaker-apply">Apply to speak <ArrowUpRight aria-hidden="true" /></a>
          </Reveal>
        </div>
      </section>

      <section className="ted-home-discover" aria-labelledby="home-discover-heading">
        <div className="ted-home-shell">
          <Reveal className="ted-home-discover-head">
            <div>
              <span className="ted-home-kicker">EXPLORE / TEDxIIMT UNIVERSITY</span>
              <h2 id="home-discover-heading" className="ted-home-section-heading">The people behind <em>the ideas.</em></h2>
            </div>
            <p>A great event is built by many voices, many hands and a community that believes in sharing what matters.</p>
          </Reveal>
          <div className="ted-home-discover-grid">
            {discovery.map(({ index, label, title, description, href, action, Icon }, cardIndex) => (
              <Reveal key={index} delay={cardIndex * 0.1}>
                <a className="ted-home-discover-card" data-index={index} href={href}>
                  <div className="ted-home-discover-top">
                    <span>{index} / {label}</span><span className="ted-home-discover-icon"><Icon aria-hidden="true" /></span>
                  </div>
                  <div><h3>{title}</h3><p>{description}</p></div>
                  <div className="ted-home-discover-bottom"><span>{action}</span><ArrowUpRight aria-hidden="true" /></div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="ted-home-reels"><SocialMedia /></div>

      <section className="ted-home-benefits" aria-labelledby="home-benefits-heading">
        <div className="ted-home-shell">
          <Reveal className="ted-home-benefits-head">
            <div>
              <span className="ted-home-kicker">BEYOND THE ROOM / THE EXPERIENCE</span>
              <h2 id="home-benefits-heading" className="ted-home-section-heading">Take home more than <em>a memory.</em></h2>
            </div>
            <p>The best part of an idea is what it makes possible next: a new question, a conversation, a connection or a first step.</p>
          </Reveal>
          <div className="ted-home-benefits-grid">
            {takeaways.map((item, index) => (
              <Reveal key={item.index} className="ted-home-benefit" delay={index * 0.08}>
                <span className="ted-home-benefit-index">{item.index}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="ted-home-dynamic"><Partners /><Blog /></div>

      <section className="ted-home-close" aria-labelledby="home-close-heading">
        <div className="ted-home-shell ted-home-close-inner">
          <Reveal>
            <span className="ted-home-kicker">YOUR IDEA / YOUR NEXT STEP</span>
            <h2 id="home-close-heading">Make room for <span>what's next.</span></h2>
            <p>Join the TEDxIIMT community, discover ideas worth spreading and be part of the next conversation.</p>
          </Reveal>
          <Reveal className="ted-home-close-actions" delay={0.15}>
            <a className="ted-home-link ted-home-link--red" href="/register">Be part of the experience <ArrowRight aria-hidden="true" /></a>
            <a className="ted-home-link" href="/speaker-apply">Share an idea <ArrowUpRight aria-hidden="true" /></a>
          </Reveal>
        </div>
      </section>
    </main>
    <FloatingCTA />
  </div>
);

export default HomePage;
