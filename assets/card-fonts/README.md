# Card fonts

Static instances of the display and text faces drawn into card images
(`components/modules/open-invitation/card-fonts.ts`). All are released under the
SIL Open Font License 1.1 and were exported from Google Fonts:

| File | Face | Instance |
|---|---|---|
| `cormorant-garamond-600.ttf` | Cormorant Garamond | weight 600 |
| `archivo-condensed-800.ttf` | Archivo | width 62.5, weight 800 |
| `bricolage-grotesque-800.ttf` | Bricolage Grotesque | weight 800 |
| `inter-500.ttf`, `inter-700.ttf` | Inter | weights 500 and 700 |

The page itself loads the same faces through `next/font` (`lib/card-display-fonts.ts`).
