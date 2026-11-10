import React, { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import api from '../services/api';
import HomeSectionHeading from './HomeSectionHeading';

const Partners = () => {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPartners = async () => {
      try {
        const data = await api.get('/api/editions/sponsor-tiers/');
        const list = Array.isArray(data) ? data : (data?.results || []);
        const populatedTiers = list.filter((tier) => (
          Array.isArray(tier.sponsors) && tier.sponsors.length > 0
        ));
        if (isMounted) setTiers(populatedTiers);
      } catch (error) {
        console.warn('Partners fetch error:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPartners();
    return () => { isMounted = false; };
  }, []);

  if (loading || tiers.length === 0) return null;

  return (
    <section className="home-section home-section--partners" aria-labelledby="home-partners-title">
      <div className="home-section__container">
        <HomeSectionHeading
          number="07"
          eyebrow="THE PEOPLE WHO MAKE IT POSSIBLE"
          title="Made possible"
          accent="together."
          description="We are grateful to the organizations and people whose support helps create a platform for ideas, conversation and community."
          id="home-partners-title"
        />

        <div className="home-partners__tiers">
          {tiers.map((tier, tierIndex) => (
            <Motion.div
              key={tier.id || tier.name}
              className="home-partners__tier"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: tierIndex * 0.08 }}
            >
              <div className="home-partners__tier-heading">
                <span>{String(tierIndex + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{tier.name}</h3>
                  {tier.benefits_description && <p>{tier.benefits_description}</p>}
                </div>
              </div>

              <div className="home-partners__logos">
                {tier.sponsors.map((partner) => {
                  const isExternal = typeof partner.website === 'string'
                    && /^https?:\/\//i.test(partner.website);
                  const content = (
                    <>
                      {partner.logo_url ? (
                        <img src={partner.logo_url} alt={partner.name} loading="lazy" />
                      ) : (
                        <span className="home-partners__wordmark">{partner.name}</span>
                      )}
                      <span className="home-partners__name">
                        {partner.name}
                        {isExternal && <ArrowUpRight size={13} aria-hidden="true" />}
                      </span>
                    </>
                  );

                  return isExternal ? (
                    <a
                      key={partner.id || partner.name}
                      className="home-partners__partner"
                      href={partner.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={partner.id || partner.name} className="home-partners__partner">
                      {content}
                    </div>
                  );
                })}
              </div>
            </Motion.div>
          ))}
        </div>

        <div className="home-section__bottom-note">
          <span>SHARED PURPOSE · SHARED IMPACT</span>
          <span>PARTNERS & SPONSORS</span>
        </div>
      </div>
    </section>
  );
};

export default Partners;
