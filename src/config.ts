export const SITE = {
  website: "https://silvestreperret.com",
  author: "Silvestre Perret",
  profile: "https://silvestreperret.com/",
  desc: "I am Silvestre Perret, and you've found my corner of the web.",
  title: "Silvestre Perret",
  ogImage: "favicon.svg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/SilvestrePerret/SilvestrePerret.github.io/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "US/Eastern", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
