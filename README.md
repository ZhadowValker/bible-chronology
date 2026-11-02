# Chronicles — Bible Chronology

A static Bible chronology explorer with 556 events across 28 periods, from Creation to the Eternal State. Search, filter by period, sort, switch between card and list views, use dark mode, and open each reference in Telugu (BSI), KJV, ESV or NIV. Each period also links to the matching panel of Adams' Synchronological Chart.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page markup; loads everything below |
| `data-1.js` … `data-30.js` | Event data, appended to `window.CHRONICLES_DATA` (fields: `#`, `Period`, `Part`, `Part-Title`, `Event`, `Reference`, `Source`) |
| `app.js` | Search, filters, rendering, source popup, theme |
| `adams.js` | Period → Adams panel links and the chart zoom pane |
| `styles-1.css` … `styles-3.css` | Styles |
| `chart/` | Where the optional chart scan goes (see `chart/README.md`) |

## Publish with GitHub Pages

1. Open **Settings → Pages** in the repository.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the `main` branch and `/ (root)`, then save.

No build step or package installation is needed. The `.nojekyll` file is already included.

## Adams' chart

- Choosing a period shows a link to the matching panel on [adamschart.org](https://www.adamschart.org/panels/).
- The **Chart** button opens a zoom pane. It needs a scan saved as `chart/adams.jpg`. Without it the pane shows a link to adamschart.org instead. See `chart/README.md` for the licence and credit line (CC BY-NC-SA 3.0, non-commercial).

## Technical notes

- Plain HTML, CSS and JavaScript. No external fonts, libraries, trackers or CDNs.
- Telugu source links come from the `Source` field of each event and load from `sajeevavahini.com`. The KJV, ESV and NIV links are built from the reference and open on BibleHub and Bible.com.
- Entries #385–389 are historical periods with no Bible chapter, so they have no source links.
- Allow popups for the site, or the first source opens in a new tab instead.
