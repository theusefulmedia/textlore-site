# URLs to submit in Google Search Console and Bing Webmaster

Updated 22 October 2026. Property: https://textlore.app/

## 1. Submit the sitemap first (once)

- Google Search Console > Sitemaps > Add a new sitemap > `sitemap.xml` > Submit.
- Bing Webmaster Tools > Sitemaps > Submit sitemap > `https://textlore.app/sitemap.xml`.
- Bing shortcut: Bing Webmaster Tools > Import from Google Search Console, so the site and sitemap carry over.

## 2. Request indexing for these URLs

Google: Search Console > URL inspection > paste the URL > Request indexing. Google allows about 10 requests a day, so do the first 10 today and the rest tomorrow.
Bing: Bing Webmaster Tools > URL Submission > Submit URLs > paste all of them in one go (Bing allows several at once).

Day 1 (new pages, highest value first):

```
https://textlore.app/pricing/
https://textlore.app/compare/imazing-alternative/
https://textlore.app/compare/decipher-textmessage-alternative/
https://textlore.app/compare/imessage-exporter-alternative/
https://textlore.app/compare/textlore-vs-messages-search/
https://textlore.app/compare/textlore-vs-spotlight/
https://textlore.app/guides/best-app-to-find-promises-in-text-messages/
https://textlore.app/guides/best-app-to-find-recommendations-in-text-messages/
https://textlore.app/guides/best-imessage-app-for-lawyers/
https://textlore.app/guides/best-imessage-app-for-recruiters/
```

Day 2 (new pages, then changed hubs):

```
https://textlore.app/guides/best-imessage-app-for-students/
https://textlore.app/guides/best-imessage-app-for-journalists/
https://textlore.app/
https://textlore.app/compare/
https://textlore.app/guides/
```

Day 2 or 3 (existing pages that gained a link to the new pages):

```
https://textlore.app/compare/textlore-vs-imazing/
https://textlore.app/compare/textlore-vs-decipher-textmessage/
https://textlore.app/compare/textlore-vs-imessage-exporter/
```

## 3. Files crawlers read

```
https://textlore.app/sitemap.xml
https://textlore.app/robots.txt
https://textlore.app/llms.txt
```

robots.txt names and allows GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User and Google-Extended. Nothing to submit for these. Check it in Search Console > Settings > robots.txt after the deploy.

## 4. After the deploy

- Search Console > URL inspection on `https://textlore.app/pricing/` > Test live URL, and confirm the Product and Organization structured data show with no errors.
- Rich Results Test on one compare page and one guide: the FAQ and Article data should show.
- On 29 October 2026, the launch price ends. The home page switches to $39 by itself. The /pricing/ page lists both prices with dates, so no change is needed.
