/**
 * Calcula zoom e offset para ajustar artboard na tela (zoom-to-fit)
 * Retorna valores recomendados baseado no tamanho da viewport e artboard
 */
export function calculateZoomToFit(
  artboardWidth: number,
  artboardHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  padding: number = 0.85
) {
  const zoom = Math.min(viewportWidth / artboardWidth, viewportHeight / artboardHeight) * padding
  const clamped = Math.min(3, Math.max(0.25, Math.round(zoom * 100) / 100))
  const scaledW = artboardWidth * clamped
  const scaledH = artboardHeight * clamped
  const offsetX = (viewportWidth - scaledW) / 2
  const offsetY = (viewportHeight - scaledH) / 2

  return {
    zoom: clamped,
    offsetX: Math.round(offsetX),
    offsetY: Math.round(offsetY),
  }
}
