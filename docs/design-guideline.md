# Design & Branding Guidelines

## Attribution

![attribution](https://developer-assets.spotifycdn.com/images/guidelines/design/attribution.svg)

### When does this apply?

Content available through Spotify is owned by many different rights holders. If you use any Spotify metadata (including artist, album and track names, album artwork, and audio playback) it must always be accompanied by the Spotify brand.

### Attribute with the Spotify logo

To comply with our licensing agreements, you must always attribute content from Spotify with the logo. In partner integrations, you should always use our full logo (icon + wordmark). We do allow using only our icon if it's featured as an app icon on the app screen of a device.

### Spotify full logo and icon

- The full logo is the combination of a wordmark with our icon.
- Our icon is a shorter version of our logo. Only use it if you do not have enough room for the full logo.

![full-logo-framed](https://developer-assets.spotifycdn.com/images/guidelines/design/full-logo-framed.svg)
Full logo

![icon-framed](https://developer-assets.spotifycdn.com/images/guidelines/design/icon-framed.svg)
Icon

Full logo and icon use must comply with our [Logo & Color Guidelines](https://developer.spotify.com/documentation/design#using-our-logo).

---

## Using our content

![using-our-content](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content.svg)

![using-our-content-example1](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content-example1.svg)

YES

The artwork must be kept in its original form, and its corners rounded according to the guidelines below.

![using-our-content-example2](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content-example2.svg)

NO

Don’t crop the artwork in any way.

![using-our-content-example3](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content-example3.svg)

NO

Don’t overlay images or text on top of the artwork. Don’t cover the artwork with playback controls.

![using-our-content-example4](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content-example4.svg)

NO

Don’t place your brand or logo on top of album artwork.

### When does this apply?

If you're using artwork and/or metadata provided by Spotify.

### Follow these guidelines:

#### For album and podcast artwork

- You may only use the artwork provided by Spotify.
- Artwork must be kept in its original form. Don't animate or distort it in any way. This includes applying overlays and blurring.
- Artwork corners must be rounded to create optical blending with nearby UI elements. Small & medium devices should use a 4px corner radius, whereas large devices should use a 8px corner radius.
- If screen real estate is limited, it's OK to not include any album artwork.
- Track, artist, playlist, and album titles must always be presented with the metadata provided by Spotify.
- The metadata must always be legible.
- You may truncate metadata if space is limited. The user should always be able to view the entire metadata.
- Don't manipulate any content or metadata.

#### For podcasts

For podcasts, two sets of metadata need to be supported:

- Title of episode
- Podcast name

We recommend using two lines in your layout for the title of the episode, since podcast episodes often have longer titles than music. The third line is then used for the podcast name.

#### For audiobooks

For audiobooks, two sets of metadata need to be supported and one is suggested.

- Title of book
- Name of Author
- Chapter if sharing

#### Considerations

Your layout should be able to accommodate these character counts:

- Playlist/album name: 25 characters
- Artist name: 18 characters
- Track name: 23 characters

---

## Browsing Spotify content

![browsing-spotify-content](https://developer-assets.spotifycdn.com/images/guidelines/design/browsing-spotify-content.svg)

### When does this apply?

If your app links to a user's Spotify account and there's a dedicated space to display Spotify content. Platforms that aggregate content from multiple audio providers must give Spotify fair treatment - anything made available to all other partners must be available to Spotify.

### Follow these guidelines:

### Content provided by Spotify

- Spotify will provide rows - or shelves - of recommended content.
- Spotify provides metadata and decides what metadata should be shown to the user, such as headlines and naming of unique contexts and groups of contexts, for all relevant surfaces.
- Spotify should determine and populate your content categories. We've optimised our APIs to cover several use cases and serve the most relevant content to each user.

### How to display provided content

- Don't manipulate any content or metadata.
- Spotify content should never be seated next to content from similar services.
- Dedicate the full row (shelf) in the view to Spotify content.
- Never show more than 20 items in a content set. At the end of each content set, a link to the Spotify app should allow listeners to keep exploring the category.
- Use Spotify's logo or icon to attribute content.

![browsing-spotify-content-examples](https://developer-assets.spotifycdn.com/images/guidelines/design/browsing-spotify-content-examples.svg)

YES

The full row (shelf) in the view should be dedicated to Spotify content.

![browsing-spotify-content-examples-2](https://developer-assets.spotifycdn.com/images/guidelines/design/browsing-spotify-content-examples-2.svg)

NO

Spotify content should never be seated next to content from similar services.

---

## Linking to Spotify

![linking-to-spotify](https://developer-assets.spotifycdn.com/images/guidelines/design/linking-to-spotify.svg)

### When does this apply?

On a platform where Spotify already exists. If you have built an integration on a platform where the Spotify client exists (mobile and desktop integrations), always link to the Spotify app. The Spotify app is the default playback mechanism. For full access to Spotify functionality, users should be directed to the Spotify application installed on the partner platform. If the app is not installed, the user should be directed to the app store so that they can install Spotify.

If you use any Spotify metadata (including artist, album and track names, album artwork and audio playback) it must always link back to the Spotify Service.

### How to link to Spotify

- If the Spotify app is not installed then the link should say, GET SPOTIFY FREE
- If the Spotify app is installed then use any of the following text strings: OPEN SPOTIFY, PLAY ON SPOTIFY or LISTEN ON SPOTIFY

The link to Spotify must follow [Spotify's attribution requirements](https://developer.spotify.com/documentation/design#attribution) and be accessible in your companion app.

---

## Playing views

![playing-views](https://developer-assets.spotifycdn.com/images/guidelines/design/playing-views.svg)

### When does this apply?

When you're showing any playing views in your app.

### Follow these guidelines:

- Follow [Spotify's attribution requirements](https://developer.spotify.com/documentation/design#attribution), you must always attribute content from Spotify with either the Spotify logo or icon.
- Follow the artwork and metadata requirements.
- Always link to the Spotify app (when the Spotify client is available on platform).

It is recommended that no play controls other than play/pause are provided in your app.

### Why?

Disabling and enabling play controls in response to restricted actions for Spotify Free may result in a confusing experience for the user. For example, the user may not understand why the skip back option has been disabled. Rather than explaining these restrictions to the user or creating a frustrating UX, we recommended you don't provide play controls.

If you choose to show play controls in your app, the following requirements need to be followed:

### Handling Spotify Free restricted actions in your companion app

- Use the restrictions returned in PlaybackRestrictions to correctly set the playback state in the companion app and to respond to the user when they try to perform a restricted action.
- Play controls must either have a disabled state to indicate that they are restricted or they should not be displayed at all.
- Make clear that the track progress bar is for information only - there should be no indication that the user can seek.

### Upgrade information in Spotify Free

When the user tries to perform a restricted action you may display this messaging.

Spotify Premium lets you play any track, podcast episode or audiobook, ad-free and with better audio quality. Go to spotify.com/premium to try it for free.

### Handling playback actions for podcasts in your companion app

- Podcasts need to have the option to seek 15 seconds forward or backwards.
- Audiobook samples also need to have the option to seek 15 seconds forward or backwards.
- You can parse the track URI in order to differentiate between podcast episodes and regular tracks.

In all playback views where content from Spotify is playing (fullscreen views, widgets, bars, skipped song notifications) make sure to follow these guidelines:

![playback-views-dont](https://developer-assets.spotifycdn.com/images/guidelines/design/playback-views-dont.svg)

DON'T

- Crop artwork
- Overlay images or text on top of artwork
- Place the logo over artwork

![playback-views-do](https://developer-assets.spotifycdn.com/images/guidelines/design/playback-views-do.svg)

DO

- Extract artwork color for background ([Android Palette](https://developer.android.com/reference/android/support/v7/graphics/Palette)). If not possible, use Spotify color #191414.

### Liking a song

The Like feature should signal back to Spotify and the liked content must not be saved by the partner. When the user taps the + icon, they are liking a song or episode. The icon should change to its active state and show a message saying "Added to Liked Songs" or "New Episodes". If the user taps the + icon again to unlike the song, show a message saying "Removed from Liked Songs" or "Removed from New Episodes". The like action is always represented with the + icon and can be downloaded here:

#### Download Like icon

[.svg](https://developer.spotify.com/images/guidelines/design/like-icon-svg.zip)[.png](https://developer.spotify.com/images/guidelines/design/like-icon-png.zip)

![States for the Like icon](https://developer-assets.spotifycdn.com/images/guidelines/design/liking.svg)

States for the Like icon

---

## Showing entities

![Graphic of Spotify tracks being displayed on a mobile phone](https://developer-assets.spotifycdn.com/images/guidelines/design/showing-entities.svg)

### When does this apply?

In Spotify Free, for on-demand playback and shuffle play.

### Follow these guidelines

For Spotify Free, you have to support two types of layouts for tracklists when showing a playlist/album entity:

For on-demand playback, the user will be able to see and play all tracks in the playlist/album.

For shuffle play the user will only be able to see a content summary of the playlist/album and then start shuffle playback. The user can't pick a particular song to play, it will start playback in shuffle.

### Displaying explicit content

Using the [Web API](https://developer.spotify.com/documentation/web-api), your app can determine whether or not a track or a podcast episode is marked as containing explicit content. Consider using this information in your app to help users discover the content that is appropriate for them.

Apps that serve users in South Korea should follow local regulations governing explicit content. When displaying a tracklist or a piece of content to a user in South Korea, your app must display an explicit content badge next to the title of any explicit track or podcast episode. See the [Web API reference documentation for more information about the `explicit` field.](https://developer.spotify.com/documentation/web-api/reference/get-track)

| ![19badge-light](https://developer.spotify.com/images/guidelines/design/19badge-light.png) | Sample explicit content badge for a white background |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| ![19badge-dark](https://developer.spotify.com/images/guidelines/design/19badge-dark.png)   | Sample explicit content badge for a dark background  |

---

## Using our logo

![using-our-logo](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-logo.svg)

We are very proud of our logo. Follow these guidelines to ensure it always looks its best.

Our full logo is the combination of our logo icon and the wordmark.

[Download Full Logo](https://developer.spotify.com/images/guidelines/design/2024-spotify-full-logo.zip) [Download Icon](https://developer.spotify.com/images/guidelines/design/2024-spotify-logo-icon.zip)

![logo](https://developer-assets.spotifycdn.com/images/guidelines/design/logo.svg)

### Using the icon

Our icon is a shorter version of our logo. Use the icon on its own only if you do not have enough room for the full logo or in cases when the Spotify brand has already been established. While the icon can exist without the wordmark, the wordmark should never exist without the icon.

![icon1](https://developer-assets.spotifycdn.com/images/guidelines/design/icon1.svg)
![icon2](https://developer-assets.spotifycdn.com/images/guidelines/design/icon2.svg)
![icon3](https://developer-assets.spotifycdn.com/images/guidelines/design/icon3.svg)
![icon4](https://developer-assets.spotifycdn.com/images/guidelines/design/icon4.svg)

### Using the logo

The Spotify green logo, pictured top left, is our primary logo colorway, and it should only be used with black, white, and non-duotoned photography.

### Which color logo to use

The Spotify green logo should only be used on a black or white background, for any other background you should use a monochrome logo.

The black logo should be used on light colored backgrounds. The white logo should be used on dark colored backgrounds.

### Legibility

Our logo should always be legible and impactful. Always apply the logo and the icon's exclusion zone to isolate the logo from competing visual elements such as a busy area of an image, low contrast areas where legibility is compromised, or on top of text or supporting graphics. The exclusion zone is equal to half the height of the icon (marked as × in the diagram).

![legibility](https://developer-assets.spotifycdn.com/images/guidelines/design/legibility.svg)

### Minimum size

Establishing a minimum size ensures that the impact and legibility of the logo aren't compromised.

The Spotify logo should never be smaller than 70px in digital or 20mm in print.

The Spotify icon should never be smaller than 21px in digital or 6mm in print.

### Logo misuse

It's important that the appearance of the logo remains consistent. The logo should not be misinterpreted, modified, or added to. Its orientation, color, and composition should remain as indicated in this document — there are no exceptions.

![logo-misuse1](https://developer-assets.spotifycdn.com/images/guidelines/design/logo-misuse1.svg)

NO

Don't rotate the logo

![logo-misuse2](https://developer-assets.spotifycdn.com/images/guidelines/design/logo-misuse2.svg)

NO

Don't fill the lines of the logo

![logo-misuse3](https://developer-assets.spotifycdn.com/images/guidelines/design/logo-misuse3.svg)

NO

Don't stretch or alter the shape of the logo

![logo-misuse4](https://developer-assets.spotifycdn.com/images/guidelines/design/logo-misuse4.svg)

NO

Don't use the logo in a sentence or as a letter

![logo-misuse5](https://developer-assets.spotifycdn.com/images/guidelines/design/logo-misuse5.svg)

NO

Don't use the logo to make new objects or shapes

![logo-misuse6](https://developer-assets.spotifycdn.com/images/guidelines/design/logo-misuse6.svg)

NO

Don't place the logo in a busy area, or in low-contrast areas where legibility is compromised

---

## Using our colors

While embracing a much more colorful language in our brand communications, Spotify Green is our resting color, used whenever Spotify's voice needs to be recognizable.

![colors](https://developer-assets.spotifycdn.com/images/guidelines/design/colors.svg)

![using-colors1](https://developer-assets.spotifycdn.com/images/guidelines/design/using-colors1.svg)

YES

Do get creative with surprising color combinations

![using-colors2](https://developer-assets.spotifycdn.com/images/guidelines/design/using-colors2.svg)

YES

Do choose colors with high contrast to ensure accessibility

![using-colors3](https://developer-assets.spotifycdn.com/images/guidelines/design/using-colors3.svg)

NO

Don't introduce new colors outside our brand palette

![using-colors4](https://developer-assets.spotifycdn.com/images/guidelines/design/using-colors4.svg)

NO

Don't use over-saturated colors for CMYK printing

---

## Logo and naming restrictions

### Naming your application

If you are registering your application with us (on the [Dashboard page](https://developer.spotify.com/dashboard)) you will need to enter the name of your app. This name will be used in communications to your app's users when you seek authorization to access their data. We have a few pointers to consider when naming your app:

The app name should not include 'Spotify' or be similar to 'Spotify' in sound or spelling. It shouldn't imply endorsement by Spotify, but suggesting to users that it is 'for Spotify' is acceptable.

### Your application's logo

Your logo should not include, or look similar to the Spotify logo or any of its brand elements (e.g. Spotify Green, the circle, and the waves). Don't incorporate Spotify's trademarks, in whole or in part, in the name of your company, product, application, service, or website.

### Don't pair brands

Don't use the Spotify brand together with any other brand or in any co-branded communications. Pairing of brands is not permitted under our Developer Terms.

---

## Fonts

![fonts](https://developer-assets.spotifycdn.com/images/guidelines/design/fonts.svg)

### What font to use?

We recommend you to use the default sans-serif font for the platform you are working on. Try commonly available defaults in this order:

- Default sans-serif for the platform
- Helvetica Neue
- Helvetica
- Arial
