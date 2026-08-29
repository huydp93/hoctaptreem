/**
 * Shows a friendly "please rotate your device" overlay on touch devices
 * when in portrait mode. Desktop/PC (no touch, or wide viewport) is
 * never affected. Pure DOM logic — independent from Phaser.
 */
export function setupOrientationGuard(): void {
  const overlay = document.getElementById('rotate-overlay');
  if (!overlay) return;

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const evaluate = () => {
    if (!isTouchDevice) {
      overlay.style.display = 'none';
      return;
    }
    const isPortrait = window.innerHeight > window.innerWidth;
    overlay.style.display = isPortrait ? 'flex' : 'none';
  };

  evaluate();
  window.addEventListener('resize', evaluate);
  window.addEventListener('orientationchange', evaluate);
}
