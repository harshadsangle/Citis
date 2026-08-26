---
name: Certificate asset rendering
description: Reliable handling of raster logo assets used inside certificate previews.
---

Raster images referenced from inside the shared certificate SVG may render blank in the browser preview even when the asset URL is valid.

**Why:** The certificate is loaded as an image, and nested external image references inside that SVG are not reliably rendered by the preview browser.

**How to apply:** Keep the certificate SVG as the base artwork and layer provided raster logos or dynamic text directly in the React certificate renderer, preserving the artwork’s coordinate proportions.