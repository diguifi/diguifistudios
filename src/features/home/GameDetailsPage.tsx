import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NotFoundPage } from '../../app/NotFoundPage';
import { useSeo } from '../../shared/seo';
import { findGameByPagePath } from './catalog';
import { GameCover } from './GameCover';
import { normalizeMediaPath } from './media';

function buildTrailerEmbedUrl(trailerUrl: string) {
  if (!trailerUrl) {
    return '';
  }

  try {
    const url = new URL(trailerUrl);

    if (url.hostname.includes('youtu.be')) {
      const videoId = url.pathname.replace('/', '');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    if (url.hostname.includes('youtube.com')) {
      const videoId = url.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    return trailerUrl;
  } catch {
    return '';
  }
}

export function GameDetailsPage() {
  const { pathname } = useLocation();
  const game = useMemo(() => findGameByPagePath(pathname), [pathname]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [isZoomedImageOpen, setIsZoomedImageOpen] = useState(false);

  useEffect(() => {
    setCurrentPromoIndex(0);
    setIsZoomedImageOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  useEffect(() => {
    if (!isZoomedImageOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsZoomedImageOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomedImageOpen]);

  if (!game) {
    return <NotFoundPage />;
  }

  const trailerEmbedUrl = buildTrailerEmbedUrl(game.pageDetails.trailer);
  const promoImages = game.pageDetails.promoImgs.map(normalizeMediaPath);
  const currentPromoImage = promoImages[currentPromoIndex];
  const seoKeywords = game.pageDetails.keywords ?? game.tags;
  const seoDescription = game.pageDetails.detailedDescription.slice(0, 155);
  const schemaType = game.status === 'tool' ? 'SoftwareApplication' : 'VideoGame';

  useSeo({
    title: game.title,
    description: seoDescription,
    path: game.pageDetails.path,
    keywords: seoKeywords,
    image: normalizeMediaPath(game.img),
    type: 'article',
    schema: {
      '@context': 'https://schema.org',
      '@type': schemaType,
      name: game.title,
      description: game.pageDetails.detailedDescription,
      genre: game.tags.join(', '),
      applicationCategory: game.status === 'tool' ? 'GameDevelopmentApplication' : undefined,
      image: normalizeMediaPath(game.img),
      url: `https://diguifi.com${game.pageDetails.path}`,
      sameAs: game.itchUrl || undefined
    }
  });

  const goToPreviousPromo = () => {
    setCurrentPromoIndex((currentIndex) =>
      currentIndex === 0 ? promoImages.length - 1 : currentIndex - 1
    );
  };

  const goToNextPromo = () => {
    setCurrentPromoIndex((currentIndex) =>
      currentIndex === promoImages.length - 1 ? 0 : currentIndex + 1
    );
  };

  return (
    <div className="page-stack game-details-page">
      <section className="game-details-hero">
        <div className="game-details-copy">
          <Link className="eyebrow details-back-link" to="/">
            Back to catalog
          </Link>
          <p className="eyebrow">{game.platformLabel}</p>
          <h1>{game.title}</h1>
          <p className="game-details-tagline">{game.tagline}</p>
          <div className="tag-row">
            {game.tags.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
              </span>
            ))}
          </div>
          <div className="details-actions">
            {game.inStore ? (
              <Link className="primary-button" to="/store">
                Buy
              </Link>
            ) : null}
            {game.itchUrl ? (
              <a className="primary-button" href={game.itchUrl} target="_blank" rel="noreferrer">
                Open on itch.io
              </a>
            ) : null}
          </div>
        </div>

        <div className="game-details-media">
          {trailerEmbedUrl ? (
            <div className="details-trailer-frame">
              <iframe
                src={trailerEmbedUrl}
                title={`${game.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="details-cover-frame">
              <GameCover game={game} />
            </div>
          )}
        </div>
      </section>

      <section className="game-details-content">
        <div className="game-details-carousel-card">
          <div className="section-heading game-details-section-heading">
            <p className="eyebrow">Gallery</p>
            <h2>Promo images</h2>
          </div>

          {currentPromoImage ? (
            <>
              <div className="promo-carousel-stage">
                <button
                  type="button"
                  className="promo-carousel-image-frame"
                  onClick={() => setIsZoomedImageOpen(true)}
                  aria-label="Zoom promo image"
                >
                  <img
                    src={currentPromoImage}
                    alt={`${game.title} promo image ${currentPromoIndex + 1}`}
                  />
                </button>
                {promoImages.length > 1 ? (
                  <>
                    <button
                      type="button"
                      className="carousel-control carousel-control-prev"
                      onClick={goToPreviousPromo}
                      aria-label="Previous promo image"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="carousel-control carousel-control-next"
                      onClick={goToNextPromo}
                      aria-label="Next promo image"
                    >
                      ›
                    </button>
                  </>
                ) : null}
              </div>

              {promoImages.length > 1 ? (
                <div className="promo-carousel-thumbs" aria-label="Promo image selection">
                  {promoImages.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      className={`promo-thumb${index === currentPromoIndex ? ' is-active' : ''}`}
                      onClick={() => setCurrentPromoIndex(index)}
                      aria-label={`View promo image ${index + 1}`}
                    >
                      <img src={image} alt="" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="promo-carousel-empty">
              <p>More promotional images will be added here.</p>
            </div>
          )}
        </div>

        <div className="game-details-description-card">
          <div className="section-heading game-details-section-heading">
            <p className="eyebrow">About</p>
            <h2>Detailed description</h2>
          </div>
          <p>{game.pageDetails.detailedDescription}</p>
        </div>
      </section>

      {isZoomedImageOpen ? (
        <div
          className="image-lightbox-backdrop"
          onClick={() => setIsZoomedImageOpen(false)}
          role="presentation"
        >
          <div
            className="image-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${game.title} promo image zoom`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="image-lightbox-close"
              onClick={() => setIsZoomedImageOpen(false)}
              aria-label="Close zoomed image"
            >
              ×
            </button>
            <img
              src={currentPromoImage}
              alt={`${game.title} promo image ${currentPromoIndex + 1} zoomed`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
