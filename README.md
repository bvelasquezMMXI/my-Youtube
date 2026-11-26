# YouTube Customizer

Manifest V3 extension for customizing YouTube's UI.

Current feature: the Home grid uses the selected number of videos per row
(1-8, 3 px gutters), persisted in `chrome.storage.sync`. On the Home feed, the
two native 3-card intro rows and their Shorts sections are skipped so the grid
starts at the first working row. The skip is always on and does not depend on
the selected count. Every Shorts shelf section on Home is removed, and the
whole section is purged so it leaves no gap. Card titles, channel names, and
view counts scale with each cell width so they stay inside the card. Main also
has a **UI corner radii** slider (0-30 px) that rounds media, avatars, buttons,
and containers on Home and video pages, including thumbnails and profile
pictures. Card titles and channel/view metadata keep their native corners;
video progress bars and autoplay controls are excluded. A **Remove "Ask Youtube"
ui element** toggle hides the Ask YouTube entry point, including the Ask
section and button in video descriptions, and replaces the search placeholder
with "Search", and **Hover highlights** toggles YouTube's hover
overlay on video cards, including the highlight around recommended videos on
watch pages. A **Font** selector offers ten choices; **Original**
restores YouTube's unmodified fonts, while the others apply to all text. The
**Upload** button beside it accepts woff2/woff/ttf/otf files, stores the font
locally, injects it with `@font-face`, and appends it to the font list. The
**Sidebar** subtab lists every guide section and entry with a checkbox, and
entries are nested under their section with directory lines. Everything is
checked by default; unchecking hides that section or entry. Subscriptions uses
a single checkbox that hides the whole subscription list.
Under **Player → Main**, **Add dislikes** restores dislike counts inside the
dislike button using the Return YouTube Dislike API. The button widens to fit
the count; counts are cached by the background service worker. **Remove
hashtags** strips hashtags from video titles and descriptions on watch pages,
cards, and Shorts, and hides hashtag links; turning it off restores the
original text. **Remove recommended videos** hides the watch page's right
column and expands the player, description, and comments to the full width.
Under **Themes → Home**, a nested list of color fields covers the home page's
search bar (surface and text), search button (surface and decal), Ask YouTube
button (surface and text, hidden while that element is removed), microphone
(surface and decal), filter bar (bar, options, and option text), and video
cards (card, title, stats/channel line, length badge, and badge text), the page
background (including the frosted band behind the search and filter bars), and
the sidebar. The sidebar expands into text, section title, icon, selected item,
and divider colors. A colored filter bar is inset 12 px from both sides
(`background-clip: content-box`) so it clears the sidebar and the page edge.
Filter options also expose selected and selected-text colors for the active
chip.
Every row has a color rectangle plus an editable
hex field; both start at the color YouTube currently uses, update the page
while they are edited, and the ↺ button restores the native color. The search
placeholder is derived automatically, 15% darker than the chosen search text
color. Above the
bottom **Reset all colors** button, a background image picker replaces the page
background color with a stored picture (with Remove to delete it). **Reset all
colors** clears every color override at once. Picks persist in
`chrome.storage.sync` as `homeColors`; the background image lives in
`chrome.storage.local` as `homeBackgroundImage`. When the Video color is set,
every home card is pinned to the tallest card's height minus 50 px so the
filled rectangles line up; text, thumbnails, and controls keep their natural
sizes. Cards whose content is taller than the trimmed height (ads with call to
action buttons) get extra bottom spacing so nothing overlaps the next row.

## Structure

```
manifest.json   Extension metadata, permissions, content scripts
background.js   Fetches and caches dislike counts
content.js      Applies layout, radius, color, font, and dislike changes
content.css     Grid, intro, radius, and dislike-count styling
popup.html      Popup markup
popup.css       Popup styling
popup.js        Settings storage and popup behavior
icons/          Action and extension icons (16/32/48/128)
```
