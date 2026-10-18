import { createElement, useEffect, useState } from 'react';

const assetRoot = `${import.meta.env.BASE_URL}assets/engineering-hero/v1/`;
const adapterPath = `${assetRoot}integration/vanilla/khan-grid-hero.js`;
const stylesheetPath = `${assetRoot}integration/vanilla/host.css`;

let adapterRegistration: Promise<void> | undefined;

function ensureHostStylesheet() {
  const href = new URL(stylesheetPath, document.baseURI).href;
  if (
    Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).some(
      (link) => link.href === href,
    )
  )
    return;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = href;
  stylesheet.dataset.engineeringHeroHostStyle = 'true';
  document.head.append(stylesheet);
}

function loadAdapter(): Promise<void> {
  if (customElements.get('khan-grid-hero')) return Promise.resolve();
  if (adapterRegistration) return adapterRegistration;

  const script = document.createElement('script');
  script.type = 'module';
  script.src = new URL(adapterPath, document.baseURI).href;
  script.dataset.engineeringHeroAdapter = 'true';

  adapterRegistration = new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
    };
    const onLoad = () => {
      cleanup();
      if (customElements.get('khan-grid-hero')) {
        resolve();
        return;
      }
      customElements.whenDefined('khan-grid-hero').then(() => resolve(), reject);
    };
    const onError = () => {
      cleanup();
      reject(new Error('The engineering film adapter could not be loaded'));
    };
    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);
    document.head.append(script);
  }).catch((error: unknown) => {
    adapterRegistration = undefined;
    script.remove();
    throw error;
  });

  return adapterRegistration;
}

export function EngineeringHero() {
  const [adapterReady, setAdapterReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    ensureHostStylesheet();
    void loadAdapter().then(
      () => {
        if (mounted) setAdapterReady(true);
      },
      () => {
        // Keep the lightweight poster and summary available if the adapter cannot load.
      },
    );
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section
      className="engineering-hero"
      data-testid="engineering-hero"
      aria-label="Engineering film"
    >
      <div
        className="engineering-hero-frame"
        style={
          adapterReady
            ? undefined
            : { aspectRatio: '16 / 9', position: 'relative', overflow: 'hidden' }
        }
      >
        {adapterReady ? (
          createElement('khan-grid-hero', {
            site: 'khanlab',
            mode: 'video',
            'video-src': `${assetRoot}hero-1080p60.mp4`,
            'poster-src': `${assetRoot}poster.png`,
            'hide-cta': '',
            style: { display: 'block', width: '100%' },
          })
        ) : (
          <img
            className="engineering-hero-fallback"
            src={`${assetRoot}poster.png`}
            alt="A frame from an illustrative electro-thermal, evidence, workspace, and hybrid-energy engineering animation."
            width={1920}
            height={1080}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
      </div>
      <p className="engineering-hero-summary">
        A 15-second conceptual engineering animation. It is illustrative only; it is not live
        telemetry, a validated facility simulation, or a certified design result.
      </p>
    </section>
  );
}
