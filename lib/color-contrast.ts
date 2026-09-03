/**
 * Texte lisible sur un fond de couleur arbitraire.
 *
 * Les catégories d'accès (JIKU-93) portent une couleur choisie par
 * l'organisateur. L'interface propose une palette sombre, mais l'API accepte
 * n'importe quel hexadécimal : une catégorie jaune clair avec du texte blanc
 * serait illisible à la porte, là où ça compte le plus.
 *
 * Luminance relative WCAG, seuil au point où le contraste avec le noir dépasse
 * celui avec le blanc.
 */
export function readableTextColor(backgroundHex: string): "#000000" | "#FFFFFF" {
  const hex = backgroundHex.replace("#", "");
  if (hex.length !== 6) return "#FFFFFF";

  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.179 ? "#000000" : "#FFFFFF";
}
