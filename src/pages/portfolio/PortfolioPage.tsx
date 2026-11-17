import { SceneCanvas } from '@/components/canvas/SceneCanvas';
import { BottomTelemetryHUD } from '@/components/hud/BottomTelemetryHUD';
import { LoadingOverlay } from '@/components/hud/LoadingOverlay';
import { ReactiveCursor } from '@/components/hud/ReactiveCursor';
import { TopNavHUD } from '@/components/hud/TopNavHUD';
import { DetailDialog25D } from '@/components/modals/DetailDialog25D';
import { CameraRig } from '@/pages/portfolio/controls/CameraRig';
import { PortfolioLights } from '@/pages/portfolio/lights/PortfolioLights';
import { PortfolioPostProcessing } from '@/pages/portfolio/postprocessing/PortfolioPostProcessing';
import { PortfolioStaging } from '@/pages/portfolio/staging/PortfolioStaging';
import { StationsWorld } from '@/pages/portfolio/world/StationsWorld';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export function PortfolioPage() {
  const locale = usePortfolioStore((s) => s.locale);

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-[#090d16] select-none">
      <TopNavHUD />

      <main
        className="h-full w-full"
        aria-label={
          locale === 'es'
            ? 'Escenario 3D interactivo del portafolio de Junior Cantor'
            : 'Interactive 3D portfolio stage for Junior Cantor'
        }
      >
        <SceneCanvas>
          <PortfolioStaging />
          <PortfolioLights />
          <CameraRig />
          <StationsWorld />
          <PortfolioPostProcessing />
        </SceneCanvas>
      </main>

      <BottomTelemetryHUD />
      <ReactiveCursor />
      <DetailDialog25D />
      <LoadingOverlay />
    </div>
  );
}
