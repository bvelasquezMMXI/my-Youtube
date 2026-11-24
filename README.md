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
**Sidebar** subtab mirrors the current YouTube tab's guide, excluding footer
links. When the guide is collapsed, the full guide is fetched so every section
and its entries are listed without expanding the sidebar first. Sections and their entries get checkboxes, and entries are nested under
their section with directory guides. Child options are hidden while their
parent is unchecked. Subscriptions gets a single **Hide Subscriptions** child,
which blurs the subscribed channel names while keeping the rows in place.
Under **Player → Main**, **Add dislikes** restores dislike counts inside the
dislike button using the Return YouTube Dislike API. The button widens to fit
the count; counts are cached by the background service worker. **Remove
hashtags** strips hashtags from video titles and descriptions on watch pages,
cards, and Shorts, and hides hashtag links; turning it off restores the
original text. **Remove recommended videos** hides the watch page's right
column and expands the player, description, and comments to the full width.
**Home** and **Player** each have a **Colors** subtab with one **Custom colors**
checkbox and individual color rows for Text, Background, Header, Guide, and the
page's major elements: Cards, Search bar, Search bar text, Categories, Category
options, Next/back buttons, Create button, and Create button text on Home;
Recommended, Video details, Description, Comments, and the Subscribe button's
background and text for each state on Player. Home colors apply only on the
Home feed and Player colors only on watch pages. Each row starts at the page's
current, unmodified color, so enabling the checkbox changes nothing until a
value is edited.
**Themes** has **Default** and **Midnight Black** presets with their palettes
shown as swatches and an **Apply** button, plus **Save theme** and **Load theme**
buttons for storing and restoring the current color setup.

## Load unpacked

1. Open `helium://extensions` (or `chrome://extensions` in Chromium).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this folder.
4. Pin the extension and open its popup.

## Structure

```
manifest.json   Extension metadata, permissions, content scripts
background.js   Fetches and caches dislike counts
content.js      Applies layout, sidebar, radius, font, and dislike changes
content.css     Grid, intro, sidebar, radius, and dislike-count styling
popup.html      Popup markup
popup.css       Popup styling
popup.js        Settings storage and popup behavior
icons/          Action and extension icons (16/32/48/128)
```
