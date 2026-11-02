# Adams' chart scan

The zoom pane loads `chart/adams.jpg`. The scan is not bundled in this repo.

1. Download the 1881 "Adams Synchronological Chart or Map of History" from the David Rumsey Map Collection (davidrumsey.com).
2. Save the full composite image as `chart/adams.jpg`.

**Licence:** David Rumsey images are CC BY-NC-SA 3.0. Use is non-commercial, the credit line must stay visible
("David Rumsey Map Collection, David Rumsey Map Center, Stanford Libraries"), and derivatives must be shared under the same licence.
For commercial use contact carto@davidrumsey.com. Check the terms on the specific image page before publishing.

**Size:** a single very large JPEG can be heavy in the browser. If it feels slow, downscale it (about 12,000 px wide is plenty)
or switch the pane to a tiled viewer such as OpenSeadragon.

**Panel jumps** (buttons 1–10) assume the ten panels are equal-width slices of the full chart. Adjust `toPanel()` in `adams.js` if the scan differs.
