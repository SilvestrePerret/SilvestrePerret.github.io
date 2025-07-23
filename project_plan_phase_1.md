# Personal website - Phase 1 Project Plan

## Overview
Phase 1 is the static version, contains few pages: /, /support, /terms (MIT Licence) /privacy.

## Story Status Legend
- ⏳ **Pending** - Not started
- 🔄 **In Progress** - Currently being worked on  
- ✅ **Completed** - Implemented and verified
- 🧪 **Testing** - Implementation complete, awaiting verification

---

## Phase 1.0: Static Version

### Story 1.0.1: Implement index.html
**Status:** ✅ **Completed**

**As a user, I want the root page to present who is the owner of the site and what he does**

**Acceptance Criteria:**
- Create a static `index.html` page.
- The page should include:
  - A header with the title "Silvestre Perret - Personal Website"
  - a navbar with links to /projects, /support, /terms, and /privacy
  - A brief introduction about the owner.
  - A list of skills and technologies used.
  - a link to linkedin page
- The page should be styled using basic CSS for readability.

### Story 1.0.2: Implement support.html
**Status:** ✅ **Completed**

**As a user, I want the support page to provide a way to contact the owner of the project I am using.**

**Acceptance Criteria:**
- Create a static `support.html` page.
- The page should include:
  - A header with the title "Support - Silvestre Perret"
  - A navbar with links to /projects, /support, /terms, and /privacy
  - A brief description of the support options available.
  - a mailto link for contacting the owner.
- The page should be styled using basic CSS for readability.
- The page should be style similar to the index.html page for consistency.

### Story 1.0.3: Implement terms.html
**Status:** ✅ **Completed**

**As a user, I want the terms page to provide the terms of use for the project.**

**Acceptance Criteria:**
- Create a static `terms.html` page.
- The page should include:
  - A header with the title "Terms of Use - Silvestre Perret"
  - A navbar with links to /projects, /support, /terms, and /privacy
  - The terms of use text, which should be in compliance with the MIT License.
- The page should be styled using basic CSS for readability.
- The page should be style similar to the index.html page for consistency.

### Story 1.0.4: Implement privacy.html
**Status:** ✅ **Completed**

**As a user, I want the privacy page to provide the privacy policy for the project.**

**Acceptance Criteria:**
- Create a static `privacy.html` page.
- The page should include:
  - A header with the title "Privacy Policy - Silvestre Perret"
  - A navbar with links to /projects, /support, /terms, and /privacy
  - The privacy policy text, which should be in compliance with the MIT License.
- The page should be styled using basic CSS for readability.
- The page should be style similar to the index.html page for consistency.



### Story 1.0.5: Store css in a separate file
**Status:** ✅ **Completed**

**As a user, I want the CSS to be stored in a separate file for better maintainability.**

**Acceptance Criteria:**
- Create a `styles.css` file.
- Move all CSS styles from `index.html`, `support.html`, `terms.html`, and `privacy.html` to the `styles.css` file.
- Ensure all HTML files link to the `styles.css` file correctly.
- The styles should remain consistent across all pages.

### Story 1.0.6: Use bulma.css for better styling
**Status:** ✅ **Completed**

**As a user, I want the website to use Bulma CSS framework for better styling and responsiveness.**

**Acceptance Criteria:**
- Integrate Bulma CSS framework into the project.
- Replace existing CSS styles in `styles.css` with Bulma classes where applicable.
- Ensure all pages (`index.html`, `support.html`, `terms.html`, and `privacy.html`) are styled using Bulma.
- The website should remain responsive and visually appealing on different devices.

### Story 1.0.7: Add some gradient to the hero backgrounds
**Status:** ✅ **Completed**

**As a user, I want the hero sections of the pages to have a gradient background for better aesthetics.**

**Acceptance Criteria:**
- Identify the hero sections in `index.html`, `support.html`, `terms.html`, and `privacy.html`.
- Apply a gradient background to the hero sections using CSS.
- Ensure the gradient backgrounds are visually appealing and consistent across all pages.