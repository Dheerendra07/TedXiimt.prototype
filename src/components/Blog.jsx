import React, { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Clock } from 'lucide-react';
import api from '../services/api';
import HomeSectionHeading from './HomeSectionHeading';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      try {
        const data = await api.get('/api/blog/posts/featured/');
        const list = Array.isArray(data) ? data : (data?.results || []);
        if (isMounted) setPosts(list.slice(0, 3));
      } catch (error) {
        console.warn('Featured blog fetch error:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPosts();
    return () => { isMounted = false; };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading || posts.length === 0) return null;

  return (
    <section className="home-section home-section--journal" aria-labelledby="home-journal-title">
      <div className="home-section__container">
        <HomeSectionHeading
          number="07"
          eyebrow="IDEAS IN PRINT"
          title="Stories worth"
          accent="staying with."
          description="Speaker spotlights, event stories and perspectives from the TEDxIIMT University community."
          id="home-journal-title"
        />

        <div className="home-journal-grid">
          {posts.map((post, index) => (
            <Motion.article
              key={post.id}
              className="home-journal-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
            >
              <a href={'/blog/' + post.slug} className="home-journal-card__link">
                <div className="home-journal-card__image">
                  <img
                    src={post.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
                    alt=""
                    loading="lazy"
                  />
                  <span>{post.category_name || 'Editorial'}</span>
                </div>

                <div className="home-journal-card__copy">
                  <div className="home-journal-card__meta">
                    <span>{formatDate(post.publish_date)}</span>
                    <span><Clock size={12} aria-hidden="true" /> {post.read_time || '4 min read'}</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="home-journal-card__read">
                    <span>Read story</span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </div>
                </div>
              </a>
            </Motion.article>
          ))}
        </div>

        <div className="home-journal__all">
          <a href="/blog" className="home-link">
            Visit the editorial archive
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Blog;
