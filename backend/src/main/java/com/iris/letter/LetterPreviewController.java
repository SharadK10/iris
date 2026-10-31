package com.iris.letter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;

/**
 * Serves a minimal, crawler-facing HTML page for a letter link, with a personalized
 * Open Graph title ("A letter has arrived for {name}"). Everything else — image and
 * description — stays static, matching the SPA's index.html.
 *
 * <p>Only social/link-preview crawlers should reach this (the reverse proxy routes
 * /letter/* here by User-Agent); real browsers get the static SPA. Crawlers read
 * only the meta tags, so no app bundle is needed here.
 */
@RestController
public class LetterPreviewController {

    private static final String DESCRIPTION =
            "A quiet space to listen together — and to send a bouquet of songs, sealed as a letter.";

    private static final String TEMPLATE = """
            <!doctype html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <title>{{title}}</title>
                <meta name="description" content="{{desc}}" />
                <meta name="theme-color" content="#faf7f0" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Iris" />
                <meta property="og:title" content="{{title}}" />
                <meta property="og:description" content="{{desc}}" />
                <meta property="og:url" content="{{url}}" />
                <meta property="og:image" content="{{image}}" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Iris — a bouquet of songs, sealed and sent." />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="{{title}}" />
                <meta name="twitter:description" content="{{desc}}" />
                <meta name="twitter:image" content="{{image}}" />
              </head>
              <body>
                <p>A letter is waiting. <a href="{{url}}">Open it →</a></p>
              </body>
            </html>
            """;

    private final LetterService letters;
    private final String publicUrl;

    public LetterPreviewController(LetterService letters,
                                   @Value("${iris.public-url}") String publicUrl) {
        this.letters = letters;
        this.publicUrl = stripTrailingSlash(publicUrl);
    }

    @GetMapping(value = "/letter/{id}", produces = MediaType.TEXT_HTML_VALUE)
    public String preview(@PathVariable String id) {
        String name = recipientName(id);
        String title = name == null
                ? "A letter has arrived."
                : "A letter has arrived for " + name + ".";

        String safeTitle = HtmlUtils.htmlEscape(title);
        String letterUrl = HtmlUtils.htmlEscape(publicUrl + "/letter/" + id);
        String imageUrl = publicUrl + "/og-image.png";

        return TEMPLATE
                .replace("{{title}}", safeTitle)
                .replace("{{desc}}", HtmlUtils.htmlEscape(DESCRIPTION))
                .replace("{{url}}", letterUrl)
                .replace("{{image}}", imageUrl);
    }

    /** The recipient's name, or null if the letter is gone or was addressed to no one. */
    private String recipientName(String id) {
        try {
            String recipient = letters.get(id).getRecipient();
            return (recipient == null || recipient.isBlank()) ? null : recipient.trim();
        } catch (RuntimeException e) {
            return null; // Expired/unknown letter — fall back to a neutral preview.
        }
    }

    private static String stripTrailingSlash(String url) {
        return url != null && url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
