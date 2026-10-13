import '@assets/styles/home.css';
import { HeroCarousel } from '@modules/public/components/home/HeroCarousel.jsx';
import { IndustryMarquee } from '@modules/public/components/home/IndustryMarquee.jsx';
import { ProductStory } from '@modules/public/components/home/ProductStory.jsx';
import { PosDemo } from '@modules/public/components/home/PosDemo.jsx';
import { AccessModel, FeatureBento, FinalCta, TrustBand } from '@modules/public/components/home/HomeSections.jsx';

export function LandingScreen() {
  return (
    <main id="public-content">
      <HeroCarousel />
      <IndustryMarquee />
      <ProductStory />
      <PosDemo />
      <FeatureBento />
      <AccessModel />
      <TrustBand />
      <FinalCta />
    </main>
  );
}
