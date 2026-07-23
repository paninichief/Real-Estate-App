# DealFactor Website Requirements Specification

**Document name:** `WEBSITE_SPEC.md`  
**Working product name:** DealFactor  
**Working tagline:** Every factor behind every deal.  
**Document status:** Implementation-ready requirements derived from the confirmed website discovery interview  
**Primary launch market:** Detroit advanced analysis, with nationwide basic property coverage  
**Primary platform:** Public responsive website, desktop-first  

---

## Document Conventions

This specification separates interview decisions from implementation guidance as follows:

- **Confirmed requirement:** A product, design, workflow, data, or technical decision explicitly established in the interview. These requirements are mandatory unless the product owner changes them.
- **Recommendation:** An implementation detail added to make the confirmed requirement buildable, testable, secure, or maintainable. Recommendations must not be treated as new product scope without approval.
- **External dependency / TBD:** A decision, credential, licensed data source, formula, assumption, policy, or asset that must be supplied or approved outside this document.

Normative terms:

- **Must / shall:** Required for the stated release.
- **Should:** Strongly recommended unless there is a documented reason not to implement it.
- **May:** Optional or conditional behavior.

Unless a subsection is explicitly labeled **Recommendation** or **External dependency / TBD**, its contents are confirmed requirements.

---

# 1. Website Overview and Purpose

## 1.1 Product definition

DealFactor is a public real-estate discovery and analysis website designed primarily for residential real-estate investors. It also provides a complete but less prominent experience for home buyers who plan to occupy the property they purchase.

The website must help users:

1. Find residential investment properties through natural-language AI search.
2. Determine whether a property is genuinely a good investment.
3. Find and analyze Section 8 investment opportunities.
4. Compare multiple properties, financing structures, and investment strategies.
5. Understand property information combined from multiple approved sources.
6. Evaluate affordability, condition, neighborhood fit, resale potential, and ownership risks when buying a home to occupy.

## 1.2 Product principles

DealFactor must prioritize truthful, transparent analysis over optimistic sales language. Every analysis must distinguish among:

- Verified or confirmed facts.
- Data reported by a source.
- Description-extracted claims.
- Estimates.
- Benchmarks.
- Assumptions.
- User-entered values.
- Unverified claims.
- Low-confidence information.
- Missing or unavailable information.

The system must never invent missing property facts. It may continue an analysis using conservative assumptions when appropriate, but those assumptions and their effects must be visible.

## 1.3 Launch positioning

DealFactor is free at launch. The launch does not include subscriptions, payment processing, paywalls, or upgrade pressure.

The product is successful at launch when it accurately combines property data, calculates returns reliably, explains uncertainty, helps users identify deals worth investigating, provides practical Section 8 analysis, supports both beginners and experienced investors, and works reliably for the initial user base.

Large traffic, subscriptions, and revenue are not launch success requirements.

## 1.4 Geographic coverage

### Nationwide launch coverage

Nationwide coverage must include, where supported by available and licensed data:

- Basic property search.
- Address lookup.
- Property facts.
- Property photos.
- Standard calculators.
- Baseline analysis.

### Detroit launch coverage

Detroit is the first fully supported market for:

- Advanced investor analysis.
- Section 8 analysis.
- Local market assumptions.
- Local renovation and operating-cost assumptions.
- Advanced confidence and market research.

Outside Detroit, DealFactor may provide analysis based on available information, but it must clearly display when local data is limited and when confidence is lower.

### Expansion architecture

The platform must support future activation by:

- State.
- Region.
- Metro area.
- County.
- City.
- ZIP code.

Smaller states may be activated statewide. Larger states, including California, Texas, and Florida, may be activated in stages. Core platform architecture must support nationwide advanced analysis without rebuilding the primary interface or analysis system.

## 1.5 Supported property types

Launch support is limited to residential properties containing one to four units:

- Single-family houses.
- Condominiums.
- Townhouses.
- Duplexes.
- Triplexes.
- Fourplexes.

Not supported at launch:

- Properties with five or more units.
- Commercial real estate.
- Vacant land.

These property categories may receive specialized analysis systems later.

---

# 2. Target Audience

## 2.1 Primary audience

The website must be designed first for:

- Beginner investors searching for a first rental property.
- Experienced individual real-estate investors.
- Section 8 investors.
- Small landlords and residential investors.

The interface must be understandable to beginners while exposing the calculations, comparable sales, risks, assumptions, confidence information, and scenario controls expected by experienced investors.

## 2.2 Secondary audience

The secondary audience is home buyers who intend to live in the property they purchase.

The Home Buyer experience must be complete at launch but less prominent and less specialized than the investor experience.

## 2.3 Audience needs

### Beginner investors need

- Plain-language explanations.
- Beginner-friendly recommendations.
- Visible risks and missing data.
- Automatic assumptions that work without setup.
- Optional rather than required advanced controls.

### Experienced investors need

- Editable assumptions.
- Financial formulas and line items.
- Comparable-sale controls.
- Multiple scenarios.
- Category-specific scores.
- Data-source transparency.
- Risk and confidence details.

### Section 8 investors need

- Current, HUD benchmark, and open-market rent scenarios.
- Housing-authority payment standards when available.
- Approval, inspection, lease-up, HAP, and abatement risk information.
- Clearly labeled confirmed versus hypothetical Section 8 analysis.

### Home buyers need

- Monthly and upfront ownership costs.
- Affordability analysis.
- Condition and move-in readiness.
- Neighborhood, school, safety, commute, walkability, and amenity evaluation.
- Resale and ownership-risk analysis.
- Negotiation guidance presented as an estimate, not legal advice or a guarantee.

---

# 3. Main Visitor Goals

Visitors must be able to complete the following goals:

1. Search for an investment property using natural language and optional filters.
2. Search for a home to occupy using natural language and optional filters.
3. Analyze a specific property by entering only an address.
4. Open a property in quick view, then continue to a full analysis.
5. Understand whether a property matches an investment goal.
6. Evaluate a property under Section 8 assumptions.
7. Compare one or more properties and scenarios.
8. Edit assumptions and see every connected result recalculate.
9. Ask property-specific AI questions without mixing data from another property.
10. Save properties, folders, stages, notes, tasks, scenarios, and chats.
11. Enter a deal manually when source data is unavailable.
12. Upload a document and review extracted values before analysis.
13. See where each important property fact came from.
14. Report incorrect data or analysis.
15. Share a private view-only analysis or download a standard report.
16. Use most analysis features as a guest and preserve work by creating an account.
17. Manage account information, privacy preferences, data export, and deletion.

---

# 4. Visitor Types and Staff Roles

## 4.1 Public visitor types

### Guest visitor

A guest may:

- Search properties.
- Use Deal Analyzer.
- View property analysis.
- Temporarily edit assumptions.
- Use property-specific AI assistants.
- Submit issue reports.

Guest analysis remains available only while the browser tab is open. A refresh may preserve the active tab session, but closing the tab removes it. The website must warn a guest before leaving when unsaved work would be lost.

When a guest attempts to save a property, scenario, chat, comparison, or other persistent item, the website must prompt for sign-in or account creation. After successful authentication, the active property and analysis must transfer into the account without restarting the workflow.

### Signed-in user

A signed-in user receives guest capabilities plus:

- My Deals.
- Folders and stages.
- Notes and tasks.
- Named scenarios.
- Saved property-specific chats.
- In-app notifications.
- Manual property refreshes, subject to the daily limit.
- Private sharing links.
- Standard downloadable reports.
- Saved private destinations.
- Optional saved profile preferences and financial ranges.
- Account data export and deletion.

### Investor user

An investor user is not a separate permission role. It is a usage context that prioritizes investor search, financial analysis, Section 8 analysis, risk, return, scenarios, and deal comparison.

### Home Buyer user

A Home Buyer user is not a separate permission role. It is a usage context that prioritizes affordability, monthly ownership cost, condition, neighborhood fit, commute, schools, resale potential, and ownership risk.

### Shared-link viewer

A shared-link viewer may view the published analysis in read-only mode. A shared viewer must not:

- Edit assumptions.
- Save changes to the owner’s analysis.
- See private notes or tasks by default.
- See uploaded documents unless the owner deliberately included them.
- See account identity or other private information beyond content intentionally shared.

## 4.2 Administrator and prepared staff roles

Only the owner has administrative access initially, but permissions must be designed to support these roles later:

- **Full administrator:** Complete access to users, configuration, markets, data sources, content, support, security, analytics, backups, and logs.
- **Market-data manager:** Market activation, market assumptions, source coverage, sample analyses, and market status management.
- **Support:** Support requests, issue reports, user assistance, and permitted account troubleshooting.
- **Content editor:** Landing content, About, FAQs, help articles, notices, disclaimers, labels, announcements, and supported-market messaging.

Financial formulas, scoring logic, API settings, authentication/security configuration, and other sensitive settings must remain inaccessible to ordinary content editors.

---

# 5. Complete Visitor Journeys

## 5.1 Investor discovery journey

1. Visitor lands on Home.
2. The investor AI search is the most prominent control.
3. Visitor enters a natural-language request or selects an investor strategy.
4. The system applies the written search, strategy, filters, profile preferences, and ranking rules in the required priority order.
5. If the request is too broad, the AI may ask one or two optional follow-up questions.
6. A visible **Skip and Search Now** option is always available.
7. Results open in split view on desktop and property-card view on mobile.
8. Visitor may switch among grid, list, map, and split views.
9. Visitor opens a property quick-view panel.
10. Visitor reviews key facts, recommendation reasons, quick numbers, score, risk, and AI summary.
11. Visitor chooses **View Full Analysis**.
12. The property opens in Investor Analysis context only.
13. Visitor reviews summary, detailed sections, assumptions, sources, confidence, and risks.
14. Visitor may edit assumptions, ask AI questions, open Section 8 analysis, save the property, report an issue, or compare the property.

## 5.2 Section 8 discovery and analysis journey

1. Visitor searches with Section 8 strategy or selects **Analyze as Section 8** on an eligible investor/general property page.
2. The system identifies the property’s Section 8 status using the required status labels.
3. If current involvement is not confirmed, the system labels the analysis hypothetical and does not imply approval, inspection, voucher tenant, HUD rent, or HAP contract guarantees.
4. A concise Section 8 summary panel displays status, rent scenarios, returns, scores, risks, and opportunities.
5. Visitor selects **View Full Section 8 Analysis**.
6. The full analysis compares current confirmed rent when available, HUD benchmark rent, estimated open-market rent, local payment standard when available, and rent-reasonableness range.
7. Every amount is labeled Confirmed, Estimated, Benchmark, Unverified, or Not available.
8. Visitor reviews financial calculations, approval and inspection risk, tenant demand, leasing outlook, payment-interruption risk, HAP abatement risk, resale, appreciation, and process guidance.
9. Visitor edits assumptions or asks the AI to test another scenario.
10. Structured calculations recalculate through application code.
11. Signed-in users may save the scenario and property.

## 5.3 Home Buyer search journey

1. Visitor selects **Find a Home to Buy** or opens Home Buyers.
2. Natural-language AI search is the primary control.
3. Visitor adds traditional filters when desired.
4. The AI asks a brief optional follow-up only when the request is too broad.
5. Results rank by Best Overall Match unless the visitor selects another sort.
6. Visitor opens a quick view.
7. Visitor selects **View Full Analysis**.
8. The property opens in Home Buyer Analysis context only.
9. Visitor reviews affordability, condition, neighborhood, schools, safety, commute, walkability, amenities, resale, ownership risk, monthly cost, upfront cost, pricing, and negotiation analysis.
10. Visitor may skip affordability inputs or provide optional income, debt, down payment, preferred payment, credit-score range, and lender quote.
11. Visitor may use **Ask About This Home**, edit assumptions, save a named scenario, save the property, share the analysis, or report an issue.

## 5.4 Analyze a specific property journey

1. Visitor selects **Analyze a Specific Property** on Home or opens Deal Analyzer.
2. On Home, the address input expands inline.
3. The visitor enters only an address and selects Search.
4. The system attempts to retrieve the property through the replaceable property-data layer.
5. If retrieved, the user is taken to Deal Analyzer or the general property page.
6. In general context, a concise summary of both Investor and Home Buyer perspectives is shown, with access to each full analysis.
7. If the property is off market, off-market status is prominent, fair value is estimated when possible, and no full purchase recommendation is presented as though the property is actively for sale.
8. The visitor may add off-market transaction details manually.
9. If the property cannot be retrieved, the user is offered manual entry.

## 5.5 Multi-property comparison journey

1. Visitor opens Deal Analyzer in multi-property mode.
2. Visitor adds properties found through DealFactor, address searches, off-market entries, outside deals, or document uploads.
3. The system generates an immediate AI comparison brief.
4. The comparison identifies strongest overall, best cash flow, lowest risk, best Section 8 option, best appreciation, best beginner option, each property’s main weakness, and missing or uncertain information.
5. Visitor selects or describes a comparison goal.
6. The table shows applicable metrics and category-specific rankings.
7. Visitor may ask the comparison AI questions or recalculate all properties under shared assumptions.
8. Signed-in users may save comparison-related scenarios or save the properties to My Deals.

## 5.6 Manual entry and document upload journey

1. Visitor opens manual deal entry because a property cannot be retrieved or because the deal is outside public listings.
2. Visitor enters the minimum fields: address, purchase price, rent, bedrooms, bathrooms, and square footage.
3. Visitor may select **Add More Details** for financing, expenses, occupancy, condition, renovation, Section 8, units, taxes, insurance, HOA, and utilities.
4. Alternatively, visitor uploads a PDF, image, screenshot, or spreadsheet.
5. Before upload, the site warns the user to remove unnecessary personal information.
6. The system attempts to identify and redact specified sensitive information, while explaining that redaction assistance is not guaranteed.
7. AI extraction prefills fields.
8. Uncertain values are labeled **Needs review**.
9. The user must review and confirm extracted values before analysis.
10. The user chooses whether to save the source document to the deal or delete it.
11. Confirmed extracted data may remain after the source file is deleted.

## 5.7 Guest-to-account journey

1. Guest performs a search or analysis.
2. Guest selects a persistence action, such as Save to My Deals or Save Scenario.
3. The site explains that an account is needed to save.
4. Guest signs in with email/password or Google, or creates an account.
5. Email verification is not required.
6. The active property, analysis, assumptions, and eligible temporary data transfer to the account.
7. The visitor returns to the same workflow with no forced restart.

## 5.8 My Deals management journey

1. Signed-in user selects a heart or **Save to My Deals**.
2. Saving occurs immediately.
3. Folder selection is optional.
4. User opens My Deals and reviews saved property facts, metrics, scores, scenarios, saved date, updates, and changes.
5. User may create folders, change progress stages, add notes, and manage a collapsible task checklist.
6. User may configure notifications globally or per property.
7. User may reopen the latest analysis or trigger a manual refresh when available.

## 5.9 Private sharing journey

1. Signed-in user selects Share from an analysis.
2. User generates a private view-only link.
3. User may set a password and expiration date.
4. User confirms whether normally excluded content, especially uploaded documents, should be included.
5. Private notes and tasks remain excluded by default.
6. Shared viewers receive a generic DealFactor social preview that does not expose property or user details.
7. The owner may disable the link at any time.

## 5.10 Issue-reporting and support journey

1. Visitor selects **Report an Issue** from an analysis or opens Contact Us.
2. For an analysis issue, the visitor enters a brief explanation.
3. The system attaches the property, analysis version, assumptions, data sources, date, and relevant system information.
4. Guest reports are labeled **Guest User** in the admin dashboard and may include an optional email.
5. Signed-in users may receive in-app report updates.
6. For general support, the visitor selects a request type and submits the contact form.
7. Help AI may prefill a contact summary when it cannot resolve the issue.

## 5.11 Administrator market-expansion journey

1. Administrator selects a state, region, county, city, or ZIP code.
2. The system retrieves connected property data.
3. The system researches local assumptions and source coverage.
4. It generates suggested assumptions and a configurable number of sample analyses; the default is 10.
5. The dashboard displays values, ranges, sources, reliability, dates, geographic relevance, and confidence.
6. The administrator approves, edits, requests more research, limits, or rejects findings.
7. The administrator approves final assumptions rather than every individual source.
8. The administrator sets market status and publishes the market after recent reauthentication.

---

# 6. Complete Sitemap

## 6.1 Confirmed page hierarchy

### Public and guest-accessible

- Home
- Investor Search
- Home Buyers
- Deal Analyzer
  - One-property mode
  - Multi-property mode
  - Manual deal entry
  - Document upload
- Property quick view
- Full property page
  - General combined summary
  - Investor Analysis
  - Home Buyer Analysis
  - Section 8 Analysis, when applicable
  - Ask About This Deal
  - Ask About This Home
  - View Data Sources panel
  - Report an Issue
- Help
  - Help AI
  - FAQs
  - Help articles
- About Us
- Contact Us
- Sign In
- Create Account
- Shared private analysis viewer
- Legal pages
  - Privacy Policy
  - Terms of Use
  - Cookie Policy
  - Investment and Financial Disclaimer
  - AI Disclaimer
  - Property-Data Disclaimer
  - Fair Housing Notice
  - Accessibility Statement

### Authenticated user area

- Profile
  - Preferences
  - Optional financial ranges
  - Personal destinations
  - Appearance preference
  - Notification settings
  - Download My Data
  - Delete Account
- My Deals
  - Saved properties
  - Folders
  - Progress stages
  - Notes
  - Tasks/checklists
  - Saved scenarios
  - Saved chats
  - Notification history
  - Shared links
  - Reports

### Administrator area

- Admin overview
- Users
- Issue reports
- Support requests
- Data-source status
- API configuration
- AI monitoring
- Market coverage
- Market expansion
- Market assumptions
- Content management
- Legal/disclaimer content
- Usage analytics
- Notification configuration
- Refresh limits
- Backup and restore
- Activity logs
- Security and recovery settings

## 6.2 Recommendation: URL structure

The following slugs are recommended to produce predictable routing without changing the confirmed page scope:

```text
/
/investor-search
/home-buyers
/deal-analyzer
/deal-analyzer/compare
/deal-analyzer/manual
/property/[propertyId]
/property/[propertyId]/investor
/property/[propertyId]/home-buyer
/property/[propertyId]/section-8
/my-deals
/my-deals/folders/[folderId]
/profile
/help
/about
/contact
/sign-in
/create-account
/share/[shareToken]
/legal/privacy
/legal/terms
/legal/cookies
/legal/investment-disclaimer
/legal/ai-disclaimer
/legal/property-data-disclaimer
/legal/fair-housing
/legal/accessibility
/admin/*
```

Private authenticated and shared-token routes must be excluded from search-engine indexing regardless of future public indexing settings.

---

# 7. Header, Navigation, and Footer Structure

## 7.1 Desktop header

The sticky desktop header must remain accessible while the user scrolls.

### Left side

1. Clickable DealFactor logo linking to Home.
2. Home.
3. Investor Search.
4. Home Buyers.
5. Deal Analyzer.
6. My Deals.

### Right side

1. Help.
2. About Us.
3. Contact Us.
4. Notification bell.
5. Authentication control showing one of:
   - Sign In.
   - Create Account.
   - Profile.

For guests, My Deals may remain visible but must prompt authentication when opened or when a persistence action is attempted.

## 7.2 Mobile header and navigation

Mobile must include:

- Logo.
- Menu control.
- Search access.
- Profile access.
- Simplified navigation.

An optional bottom navigation may include:

- Home.
- Investor Search.
- Deal Analyzer.
- My Deals.

Desktop remains the main development priority.

## 7.3 Tablet navigation

- Larger tablets use a simplified desktop layout.
- Smaller tablets use the mobile layout.

## 7.4 Footer

The footer must provide at minimum:

- DealFactor name/logo.
- Brief product positioning.
- Investor Search.
- Home Buyers.
- Deal Analyzer.
- Help.
- About Us.
- Contact Us.
- Every required legal-page link.
- Copyright notice.
- Supported-market or coverage notice where appropriate.
- Short disclaimer that estimates and AI analysis are informational and not guarantees.

### Recommendation

Use grouped footer columns titled Product, Company, Help, and Legal. Keep the disclaimer visible but concise, with links to the full legal pages.

---

# 8. Page-by-Page Requirements

## 8.1 Home / Landing Page

### Purpose

Communicate that DealFactor serves investors and home buyers while prioritizing investor AI search.

### Required components

1. Large natural-language investor search box as the dominant element.
2. Permanent prompt: **What kind of real-estate deal are you looking for?**
3. Rotating search examples, including examples equivalent to:
   - Find Section 8 properties in Detroit with positive cash flow.
   - Find beginner-friendly rental properties under $150,000.
   - Find a four-unit property with at least 50% occupancy.
   - Find tenant-occupied homes with strong cash-on-cash returns.
4. Prominent audience buttons directly below search:
   - Explore Investor Properties.
   - Find a Home to Buy.
5. Noticeable but secondary **Analyze a Specific Property** action.
6. When selected, the property action expands an address field inline.
7. Address submission requires only the address.
8. Submission routes to Deal Analyzer or the general property page.
9. Supporting content covering:
   - How DealFactor works.
   - Investor-analysis benefits.
   - Section 8 capabilities.
   - Home Buyer tools.
   - Data transparency.
   - Trust and disclaimer content.
   - Calls to action.
   - Contact and About links.

## 8.2 Investor Search Page

### Purpose

Allow natural-language and structured discovery of residential investment properties.

### Required components

- Primary natural-language AI search.
- Strategy quick selections.
- Optional broad-search follow-ups.
- Skip and Search Now.
- Default and advanced filters.
- Grid, list, map, and split result views.
- Split view as desktop default.
- Property cards as mobile default.
- Manual sorting.
- Property quick-view panel.

Search, ranking, filtering, and card details are specified in Section 12.

## 8.3 Home Buyers Search Page

### Purpose

Allow a user to find a home to occupy based on natural-language needs and traditional home-search criteria.

### Required components

- Primary natural-language AI search.
- Brief optional follow-ups only when needed.
- Visible Skip option.
- Traditional filters below the AI search.
- Best Overall Match default sort.
- Property results and quick view.
- Home Buyer-specific ranking and analysis context.

## 8.4 Property Quick-View Panel

Every property shown anywhere on DealFactor must be clickable.

The quick-view panel must be large enough to provide meaningful evaluation without opening the full page. It must include:

- Photos.
- Price.
- Address.
- Listing/off-market status.
- Bedrooms.
- Bathrooms.
- Square footage.
- Key financial numbers.
- Main score for the current context.
- Short AI summary.
- Save to My Deals.
- Compact **Ask About This Deal** or **Ask About This Home** action.
- **View Full Analysis**.

The panel must preserve the context from which it was opened.

## 8.5 Full Property Page: General Context

When opened from Deal Analyzer, address search, My Deals, a shared link, or another general area, the page must:

- Show a concise summary of both Investor and Home Buyer perspectives.
- Provide access to both complete analyses.
- Show full photo gallery.
- Show complete property facts.
- Show listing and price history.
- Show source links.
- Show comparable sales.
- Show financial calculations.
- Show detailed AI analysis.
- Allow editable assumptions.
- Show saved scenarios.
- Show environmental risks.
- Show Section 8 tools when applicable.
- Provide the applicable property-specific AI assistant.
- Provide View Data Sources.

For active listings, both analyses may be available in general contexts.

For off-market properties, the page must:

- Display off-market status prominently.
- Show all available property information.
- Show estimated fair-market value when possible.
- Avoid presenting a full purchase recommendation as though the property is currently offered for sale.
- Allow manual off-market deal inputs.

## 8.6 Full Investor Analysis Page

### Top summary

The top of the page must be concise but information rich and include:

- Overall investor score.
- Likely score range.
- Recommendation.
- Asking price.
- Estimated fair value.
- Price difference.
- Monthly cash flow.
- Annual cash flow.
- Cap rate.
- Cash-on-cash return.
- Total cash required.
- Expected rent.
- Risk level.
- Appreciation potential.
- Leasing outlook.
- Resale outlook.
- Section 8 status and suitability.
- Main strengths.
- Main risks.
- Missing or low-confidence information.

### Detailed sections

Desktop uses expandable sections with side navigation. Mobile uses expandable sections and a section selector.

Required sections:

1. Financial Performance.
2. Pricing and Comparable Sales.
3. Risk Analysis.
4. Neighborhood and Market.
5. Rental and Leasing Outlook.
6. Appreciation and Resale.
7. Property Condition.
8. Renovation Analysis.
9. Future Strategies.
10. Section 8.
11. Environmental Risk.
12. Data Sources.
13. Assumptions.

### Category scores

Show all applicable category scores even when the user chose one primary goal:

- Cash flow.
- Risk.
- Section 8 suitability.
- Appreciation.
- Flip potential.
- Beginner suitability.
- Balanced deal quality.

Use Not applicable, Insufficient data, or Low confidence rather than forcing an irrelevant or unsupported score.

## 8.7 Full Home Buyer Analysis Page

The page must include:

- Overall Home Buyer score.
- Affordability score.
- Condition and move-in-readiness score.
- Neighborhood score.
- School score.
- Safety score.
- Commute score.
- Walkability score.
- Amenities score.
- Resale score.
- Ownership-risk score.
- Monthly-cost analysis.
- Upfront-cost analysis.
- Mortgage assumptions and comparisons.
- Affordability tools with visible Skip option.
- Pricing analysis.
- Comparable sales.
- Negotiation analysis.
- Ask About This Home.
- Editable assumptions.
- Named Home Buyer scenarios for signed-in users.

## 8.8 Full Section 8 Analysis Page

The Section 8 entry action first opens a concise summary panel containing:

- Status.
- Rent scenarios.
- Cash flow.
- Cap rate.
- Cash-on-cash return.
- Balanced Section 8 score.
- Personalized Section 8 fit score.
- Main risks.
- Main opportunities.
- View Full Section 8 Analysis.

The complete analysis must include:

- Rent comparison.
- Financial calculations.
- Approval risk.
- Property condition and supported inspection concerns.
- Missing documentation.
- Housing-authority considerations.
- Tenant demand and leasing outlook.
- Payment-interruption and HAP abatement risk.
- Resale and appreciation.
- Educational inspection guidance.
- Collapsed Approval and Lease-Up Process.
- Tenant/payment history only when reliable and non-identifying data is available.
- Scores, reasoning, assumptions, confidence, and likely ranges.
- Comparable-deal geography and similarity.

## 8.9 Deal Analyzer

### One-property mode

Must support:

- Properties found through DealFactor.
- Address-searched properties.
- Off-market properties.
- Manually entered outside deals.
- Uploaded listing or investment documents.

Output includes:

- Property facts table.
- Financial analysis.
- Investor and Home Buyer perspectives when appropriate.
- Scores.
- Risks.
- Comparable sales.
- Follow-up AI assistant.
- Editable assumptions.
- Saved scenarios.

### Multi-property mode

Must include:

- Structured comparison workspace.
- Automatic comparison brief.
- Goal controls.
- Metric table.
- Category-specific rankings.
- Comparison AI assistant.

## 8.10 My Deals

Each saved property may display:

- Photo.
- Address.
- Price.
- Status.
- Overall score.
- Cash flow.
- Cap rate.
- Cash-on-cash return.
- Section 8 suitability.
- Saved scenarios.
- Date saved.
- Last update.
- Price or status changes.

The page must support:

- User-created folders.
- Optional folder assignment during save.
- Progress stages: Saved, Researching, Contacted, Under Contract, Purchased, Rejected.
- Private notes.
- Collapsible task/checklist interface.
- Add, edit, complete, and delete task behavior.
- Full in-app notification history.
- Access to share links and reports.

## 8.11 Profile and Account Settings

Must include:

- Optional profile preferences.
- Optional financial ranges.
- Saved private destinations.
- Global notification settings.
- Appearance setting: Light, Dark, System.
- Download My Data.
- Delete Account.
- Sign-out.

Profile setup must be optional and skippable.

## 8.12 Help

The Help experience must include:

- Permanent Help link in the top navigation.
- General Help AI.
- Small unobtrusive help-chat button in the bottom corner of every page.
- FAQs.
- Help articles.

Help AI may explain the product, calculations, terminology, accounts, saved features, navigation, and how to begin a search. It must not provide property-specific analysis.

## 8.13 Contact Us

The page must use one simple form with the required request-type dropdown described in Section 11.

Public email addresses may be shown only for:

- Business.
- Partnerships.
- Media.

Technical and account support must use the form.

## 8.14 About Us

The initial page presents DealFactor as a company and product. Founder name, photo, and story are deferred.

It must explain:

- Mission.
- Why DealFactor was created.
- Investor and Home Buyer value.
- Section 8 focus.
- Data approach.
- AI-analysis approach.
- Source transparency.
- Confidence levels.
- Missing-data policies.
- AI limitations.
- Commitment to honest analysis.

Tone must be approachable rather than overly corporate.

## 8.15 Authentication Pages

Create Account and Sign In must support:

- Email and password.
- Google sign-in.
- Immediate account use without email verification.
- Return to the interrupted workflow after successful authentication.

## 8.16 Shared Analysis Viewer

Must:

- Be view only.
- Enforce optional password and expiration.
- Exclude private notes/tasks by default.
- Exclude uploaded documents unless explicitly included.
- Use generic social-preview metadata.
- Not expose the property address, image, scores, financial results, or user identity in the social preview.

## 8.17 Legal Pages

Each required legal document must have its own accessible page and be linked from the footer, account creation, and relevant contextual notices.

## 8.18 Administrator Dashboard

The admin interface must provide the modules in Section 15 and enforce the role and security rules in Sections 4, 15, and 22.

---

# 9. Content Requirements for Every Page

## 9.1 Global content requirements

Every page must use plain, approachable language and avoid implying guarantees. Content must use consistent status vocabulary for confirmed, estimated, benchmark, unverified, unavailable, insufficient-data, and low-confidence information.

All financial estimates, scores, and AI recommendations must include concise contextual notices with access to the full disclaimer.

## 9.2 Content matrix

| Page or surface | Required content |
|---|---|
| Home | Product value proposition, investor-first AI search, investor and home-buyer entry points, specific-property analysis, how it works, Section 8 capability, transparency, trust/disclaimer content, CTAs, About and Contact links |
| Investor Search | Search prompt, strategy choices, optional follow-ups, filters, ranking explanation where needed, result count, view controls, sort controls, property cards, recommendation reasons, quick numbers, confidence/coverage notice |
| Home Buyers | Search prompt, optional follow-ups, filters, sort controls, property cards, match reasoning, monthly-payment context, coverage/confidence notice |
| Quick View | Photos, core facts, current-context score, financial highlights, brief AI summary, save action, assistant action, full-analysis action |
| General Property | Full facts, gallery, history, sources, comps, investor and buyer summaries, editable assumptions, risks, environmental information, Section 8 entry when applicable, off-market wording when applicable |
| Investor Analysis | Required summary metrics, strengths, risks, missing information, detailed sections, category scores, source/confidence explanation, assumptions, contextual disclaimer |
| Home Buyer Analysis | Buyer scores, monthly/upfront costs, mortgage assumptions, affordability, pricing, negotiation, neighborhood and ownership risks, contextual disclaimer |
| Section 8 Analysis | Status labels, rent scenarios, payment standard, reasonableness, calculations, risks, process guidance, scores, confidence, non-guarantee language |
| Deal Analyzer | Mode selection, property-input methods, one-property output, comparison brief, goals, table, rankings, assumptions, assistant, save/export actions |
| My Deals | Saved-deal cards/table, folders, stages, notes, tasks, scenarios, alerts, change history, last update, empty-state guidance |
| Profile | Preferences, optional financial-range labels, privacy explanations, destinations, notification settings, theme, export, deletion |
| Help | Product guidance, terminology, calculations, FAQs, help articles, contact escalation |
| Contact | Form, request-type explanations, public business/partnership/media contact details, response expectation if approved later |
| About | Mission, origin rationale, audiences, Section 8 focus, data transparency, confidence and AI-limitations policy, honest-analysis commitment |
| Shared Viewer | Shared-by context without exposing unnecessary identity, analysis content, expiration/password handling, read-only notice, disclaimer |
| Authentication | Benefits of account, sign-in methods, no forced profile setup, terms/disclaimer acceptance, privacy links |
| Legal | Complete reviewed legal text and revision/effective date |
| Admin | Current statuses, actionable work queues, source/AI/system health, audit information, role-appropriate controls |

## 9.3 Dynamic content rules

- Search examples, announcements, supported-market notices, FAQs, help articles, reusable labels, and landing-page copy must be editable through the CMS without code.
- Property values must show last-updated date and time.
- Local-market limitations must be visible outside fully supported markets.
- Active and off-market properties must use different recommendation language.
- Missing fields must not be silently omitted when the absence materially affects the analysis.
- Private personal destinations must not appear in shared reports unless deliberately included.

---

# 10. Feature-by-Feature Requirements

## 10.1 Property-data aggregation

The production website will connect through an authorized and replaceable property-data layer to approved sources, including:

- Realtor.com.
- Zillow.
- Redfin.
- HUD and HUD User.
- Local housing-authority data when available.
- Geoapify.
- Additional reputable public or licensed datasets when needed.

Sample data may be used during development.

The interface and analysis tools must not depend directly on one provider’s response shape. API keys must remain on the secure backend and must never appear in browser code.

### Data licensing gate

Before public launch, every property-data integration must be reviewed to confirm permission to:

- Retrieve data.
- Display data publicly.
- Store or cache data.
- Combine data with other sources.
- Use data in AI-generated analysis.
- Display listing photos and agent information.
- Link to original listings.

## 10.2 Conflicting source values

When sources disagree:

1. If two of the three primary sources report the same value, use that majority value.
2. If all available sources conflict, priority is Realtor.com, then Zillow, then Redfin.
3. If Realtor.com is unavailable and Zillow conflicts with Redfin, use Zillow.
4. Preserve every source value internally.
5. Expose the full history through View Data Sources.
6. Explain the selected value and selection rule.

Missing or uncertain fields must use one of the approved labels:

- Not available.
- Insufficient data.
- Unverified listing claim.
- Low confidence.

## 10.3 Property refresh

Automatic refresh schedule:

- Active listings: twice per day.
- Off-market properties: once per week.

Every property must display:

- Last-updated date and time.
- Next scheduled automatic update.

Signed-in users receive three manual refreshes per day at launch. The administrator can change the limit.

The interface must show:

- Remaining manual refreshes.
- Whether refresh is running.
- Next scheduled update.

A refresh must update property facts before recalculating scores, scenarios, and AI analysis.

If one provider is unavailable but another relevant provider supplies the needed information, continue without a user-facing outage warning. Show a warning only when the requested information cannot be retrieved from any relevant source. Recent stored data may be used, but its age must appear in View Data Sources.

## 10.4 Natural-language search

Investor and Home Buyer search must translate user requests into structured criteria without removing the user’s written intent.

The current written search is the strongest ranking factor. Optional AI follow-ups must be brief, must not exceed one or two questions for broad investor searches, and must always include a visible skip action.

The system must not require a profile before search.

## 10.5 Strategy quick selections

Investor strategies:

- Section 8.
- Long-term rental.
- Tenant-occupied.
- Multifamily.
- Fix-and-flip.
- Appreciation.
- Lower risk.
- Beginner-friendly.

Selecting a strategy must:

1. Immediately apply a quick filter.
2. Preserve the ability to add natural-language details.
3. Provide access to a specialized strategy view when applicable.

## 10.6 Search-result property cards

Default investor card content:

- Main photo.
- Price.
- Address.
- Bedrooms.
- Bathrooms.
- Square footage.
- Property type.
- Save to My Deals heart.
- Two or three short recommendation reasons.

Examples of valid recommendation reasons:

- Strong projected cash flow.
- Matches your Section 8 goal.
- Below estimated market value.

Expandable Quick Numbers must include:

- Monthly cash flow.
- Cap rate.
- Cash-on-cash return.
- Total cash required.
- Overall investor score.
- Risk level.
- Occupancy.
- Section 8 status.

## 10.7 Investor goals and personalization

Users may choose one or more goals:

- Highest cash flow.
- Lowest risk.
- Best Section 8 opportunity.
- Best appreciation.
- Best flip potential.
- Best for a beginner.
- Best balanced deal.
- Other, with custom description.

If no goal is selected:

1. Use saved profile preferences.
2. If no preferences exist, use Best Balanced Deal.

When goals conflict, DealFactor must:

- Explain the tradeoff.
- Create a personalized overall recommendation.
- Continue to show individual category rankings.
- Allow optional advanced weighting.

Beginners must not be required to adjust weights.

## 10.8 Comparable Sales Engine

The engine must consider:

- Distance.
- Sale date.
- Property type.
- Bedrooms.
- Bathrooms.
- Square footage.
- Lot size.
- Age.
- Condition.
- Renovation status.
- Number of units.
- Neighborhood similarity.

Output must include:

- Selected comparable properties.
- Why each was chosen.
- Sale price.
- Price per square foot.
- Distance.
- Sale date.
- Similarities and differences.
- Current estimated fair value.
- Likely value range.
- Confidence level.

The AI selects comps automatically. Advanced users may remove comps, add sold properties, and recalculate valuation.

When flip analysis is applicable, show:

- Purchase price.
- Renovation estimate.
- Holding costs.
- Selling costs.
- Estimated after-repair value.
- Projected profit.
- Projected return.
- Confidence range.

## 10.9 Ask About This Deal

This property-specific assistant appears only on investor or general property pages.

It must have access only to the active property’s:

- Property facts.
- Comparable sales.
- Financial calculations.
- Scores.
- Assumptions.
- Market research.
- Section 8 information.
- Saved scenarios.

It must not mix another property’s information into the conversation.

It may use general profile preferences.

Placement:

- Visible chat box near the top of the full property page.
- Floating action while scrolling.
- Compact action in quick view.
- Full chat opens on the property page.

When a user changes assumptions through chat, the system must update structured calculations and offer to save the result as a named scenario.

Chat retention:

- Signed-in users: saved automatically by property.
- Guests: temporary until the browser tab closes.
- Users can delete saved conversations.

## 10.10 Ask About This Home

The separate Home Buyer assistant must focus on:

- Affordability.
- Mortgage scenarios.
- Condition.
- Move-in readiness.
- Neighborhood fit.
- Commute.
- Comparable homes.
- Resale potential.
- Ownership risks.

Signed-in users may save named Home Buyer scenarios. Guest scenarios remain temporary until the tab closes.

## 10.11 General Help AI

The Help AI must:

- Explain how to use DealFactor.
- Explain calculations and terminology.
- Assist with accounts and saved features.
- Guide users to the correct page.
- Help users begin a search.
- Transfer unresolved issues into the Contact form with a prefilled summary.

It must not perform property-specific analysis.

## 10.12 Home Buyer cost and affordability tools

Monthly cost must include:

- Principal.
- Interest.
- Property taxes.
- Homeowners insurance.
- HOA fees.
- Estimated maintenance.
- Total estimated monthly housing cost.

Upfront cost must include:

- Down payment.
- Closing costs.
- Prepaid taxes and insurance.
- Inspection.
- Appraisal.
- Immediate repairs.
- Total estimated cash required.

Mortgage rate must use an accurate current estimate from reliable available information and consider:

- Loan type.
- Term.
- Down payment.
- Property location.
- Owner occupancy.
- Optional credit-score range.
- Optional lender quote.

Credit-score range must be labeled Optional and may be left blank without blocking calculation.

Allow comparison among Conventional, FHA, VA, and later-supported loan types when applicable.

Affordability inputs may include income, debt, down payment, and preferred maximum monthly payment. A visible Skip option is required.

## 10.13 Home Buyer pricing and negotiation analysis

Pricing output:

- Underpriced, Fairly Priced, or Overpriced.
- Fair-value range.
- Dollar difference.
- Percentage difference.
- Comparable sales.
- Confidence level.

Negotiation output:

- Low, Medium, or High negotiation potential.
- Reasons.
- Suggested offer-price range.
- Possible seller-paid closing costs.
- Possible repair credits.
- General contingency and closing-term ideas.
- Questions to discuss with an agent.

The website must state that these are estimates and not legal advice or guarantees.

## 10.14 Neighborhood and proximity analysis

Use Geoapify and MapLibre at launch.

Evaluate proximity to:

- Grocery stores.
- Schools.
- Parks.
- Restaurants.
- Shopping.
- Healthcare.
- Public transportation.
- Major roads.
- Employment areas.
- Other common daily destinations.

Display:

- Walking distance.
- Estimated walking time.
- Driving distance.
- Estimated driving time.
- Short, moderate, or long classification.

Users may optionally enter workplace, school, family location, healthcare provider, or other frequent destinations. A destination may be used once or saved privately to the profile. If skipped, use general neighborhood proximity.

## 10.15 Move-in readiness and condition

Condition analysis may use:

- Listing descriptions.
- Listing photos.
- Property age.
- Inspection reports.
- Uploaded documents.
- Available condition fields.

It must separate:

- Confirmed condition facts.
- Visible possible concerns.
- AI estimates.
- Unknown conditions.

The AI must not claim hidden defects based only on photos.

Output may include:

- Move-in-readiness score.
- Known repair needs.
- Possible concerns.
- Estimated repair range.
- Confidence.
- Recommended professional inspections.

## 10.16 Renovation analysis

Default quality: Standard.

Users may switch to:

- Budget Rental.
- High-End.

The model must:

- Show a likely cost range.
- Use local labor and material estimates where available.
- Include editable line items.
- Calculate contingency automatically.
- Allow contingency edits.
- Recalculate all connected returns and scores after changes.

Line-item factors include property size, age, visible condition, labor, materials, permits, roof, HVAC, plumbing, electrical, foundation, kitchen, bathrooms, flooring, paint, windows, appliances, exterior, landscaping, cleanup, and contingency reserve.

Default contingency varies by property age, condition, scope, inspection data, and data confidence.

## 10.17 Editable assumptions and saved scenarios

Analyses must load immediately using automatic assumptions.

A clear **Edit Assumptions** action must allow changes to:

- Down payment.
- Interest rate.
- Loan term.
- Expected rent.
- Vacancy rate.
- Management fee.
- Maintenance reserve.
- Insurance.
- Property taxes.
- HOA fees.
- Utilities.
- Renovation costs.
- Other relevant expenses.

Update flow:

1. Preview updated results.
2. Apply temporarily.
3. Cancel.
4. Save as a named scenario.

Example names:

- 10% Down.
- HUD Rent.
- Self-Managed.
- Renovate and Hold.
- Flip Scenario.

Users may compare saved scenarios side by side.

## 10.18 Section 8 status and entry points

Possible status labels:

- Section 8 Mentioned — Unverified.
- Section 8 Tenant Reported.
- Active Section 8 Tenant — Confirmed.
- HAP Contract Confirmed.

Most listing-description claims must be treated as unverified unless supported by additional evidence.

Properties with confirmed or reported involvement show **View Section 8 Analysis**.

Eligible residential investment properties without current involvement show **Analyze as Section 8** and open a clearly hypothetical analysis.

The system must not imply guaranteed:

- Housing-authority approval.
- Inspection approval.
- Voucher tenant.
- HUD rent.
- HAP contract.

Section 8 entry points appear in Investor Analysis, general property pages, and Deal Analyzer. They do not appear in the Home Buyer-only experience.

## 10.19 Section 8 rent scenarios

Display side by side:

1. Current confirmed rent, when available.
2. HUD benchmark rent.
3. Estimated open-market rent.

Display separately when available:

- Local housing-authority payment standard.
- Estimated rent-reasonableness range.

Every amount must be labeled:

- Confirmed.
- Estimated.
- Benchmark.
- Unverified.
- Not available.

When a listing reports a Section 8 tenant but omits rent:

- Display Current rent: Not available.
- Calculate HUD benchmark and market-rent scenarios.
- Do not present either as confirmed current rent.

When available, show tenant-paid portion, housing-authority-paid portion, and total monthly rent. Missing portions show Not available.

Utility allowance must be included only when stated or confirmed. When available, show before allowance, after allowance, monthly difference, and annual difference. Do not guess an allowance.

Rent increase analysis must calculate monthly increase, annual increase, percentage increase, and updated cash flow, cap rate, cash-on-cash return, and score. State that final approved rent depends on housing-authority review.

## 10.20 Section 8 risk and process analysis

Include:

- Approval-risk rating.
- Supported property-condition concerns.
- Likely inspection issues only when evidence exists.
- Missing documentation.
- Local housing-authority considerations.
- Supported repair requirements.
- Tenant demand.
- Leasing outlook.
- Payment-interruption risk.
- HAP abatement risk.
- Resale potential.
- Appreciation potential.
- Overall recommendation.

The educational inspection checklist may be general. Property-specific repairs require support from photos, listing description, inspection report, uploaded document, or other reliable data.

When condition information is unavailable, state that repairs may be required and an official inspection is necessary.

A collapsed **Approval and Lease-Up Process** section may cover voucher tenant search, tenancy approval request, rent-reasonableness review, inspection, repairs, reinspection, lease signing, HAP contract, and payment commencement. Use reliable local time estimates where possible; otherwise use clearly labeled general ranges.

Payment interruption and HAP abatement content must include possible causes, inspection-failure risks, repair requirements, approximate known deadlines, estimated cash-flow impact, and confidence. Do not state that abatement will occur without evidence.

Tenant and payment history appears only when reliable data is available and must not show tenant names, contact details, or identifying information.

## 10.21 Section 8 scores

Show:

- Balanced Section 8 Deal Score.
- Personalized Section 8 Fit Score.

Category scores:

- Financial performance.
- Approval risk.
- Tenant demand.
- Property condition.
- Rent potential.
- Payment-interruption risk.
- Resale and long-term potential.

Every score must include reasoning, assumptions, confidence, and a likely range when confidence is low.

Comparable Section 8 deal priority:

1. Same ZIP code.
2. Same city.
3. Same metro area.
4. Similar nearby market.

Show distance and similarity for each comparable deal.

## 10.22 Low-confidence analysis

When important information has low confidence, display a score and range, for example:

- Estimated score: 72/100.
- Likely range: 68–76.
- Low-confidence data.

The warning must be clickable and explain:

- Which inputs are uncertain.
- Why they are uncertain.
- Which sources were used.
- How uncertainty affects the analysis.
- What the user should verify independently.

The default is to continue using conservative assumptions rather than block the analysis. The administrator may change this behavior per market.

## 10.23 Save to My Deals

The heart and label **Save to My Deals** must appear on:

- Search-result cards.
- Quick-view panels.
- Full property pages.
- Deal Analyzer.
- Comparison results.
- Address-based analyses.

Saving must be immediate. Folder assignment is optional.

## 10.24 Notifications

Access:

- Notification bell in the top navigation.
- Full history in My Deals.

Enabled by default:

- Price changes.
- Listing-status changes.
- Major deal-score changes.

Users may configure notifications globally and per saved property.

Launch notifications are in-app only. Email and text alerts are future features.

## 10.25 Manual deal entry and uploads

Minimum manual fields:

- Address.
- Purchase price.
- Rent.
- Bedrooms.
- Bathrooms.
- Square footage.

Advanced optional fields:

- Financing.
- Expenses.
- Occupancy.
- Condition.
- Renovation costs.
- Section 8 information.
- Number of units.
- Taxes.
- Insurance.
- HOA.
- Utilities.

Supported uploads:

- PDF.
- Images and screenshots.
- Spreadsheets.

AI may extract and prefill data. Users must review and confirm before analysis. Uncertain fields show **Needs review**.

After extraction, ask whether to Save to deal or Delete document. Confirmed extracted values may remain after deletion.

Before upload, warn users to remove unnecessary personal information. The system should attempt to detect and redact tenant names, phone numbers, email addresses, Social Security numbers, bank information, and signatures. Redaction must be described as assistance, not a guarantee.

## 10.26 Sharing and reports

Signed-in users may:

- Generate a private view-only link.
- Set an optional password.
- Set an expiration date.
- Disable the link.
- Download a standard property-analysis report.

Private notes and tasks are excluded by default. Uploaded documents are excluded unless explicitly included.

Generic private-link preview text may state: **A private property analysis has been shared with you.**

## 10.27 Report an Issue

Every analysis must include a simple Report an Issue action.

The form asks for a brief explanation and automatically attaches:

- Property.
- Analysis version.
- Assumptions.
- Data sources.
- Date.
- Relevant system information.

Guests may report issues and may provide an optional email. Signed-in users may receive in-app updates.

## 10.28 Data Sources panel

A small **View Data Sources** button must appear near property facts.

The side panel must show:

- Source for each important fact.
- Conflicting values.
- Selected value.
- Why it was selected.
- Last update time.
- Confirmed, estimated, description-extracted, or unavailable status.
- Stored-data age when recent cached data was used.

Source labels should not clutter the primary property interface.

Primary original-listing link priority:

1. Realtor.com.
2. Zillow when Realtor.com is unavailable.
3. Redfin when both are unavailable.

An expandable **View Other Sources** area shows other available links.

## 10.29 Environmental risk

The supporting Environmental Risk section may include:

- Flood.
- Wildfire.
- Earthquake.
- Severe weather.
- Other location-specific hazards.

Show:

- Available risk rating.
- Explanation.
- Source.
- Confidence.
- Possible insurance impact.
- Possible ownership or investment impact.
- Recommended professional verification.

Environmental risk may affect the overall risk score when financially significant but must not become the primary focus of the property analysis.

## 10.30 AI architecture

Claude Code is the development tool. The live site uses the Anthropic Claude API.

One Anthropic account may power:

- Investor analysis.
- Home Buyer analysis.
- Section 8 analysis.
- Ask About This Deal.
- Ask About This Home.
- Deal Analyzer.
- Help AI.
- Document extraction.
- Admin research summaries.

Each assistant must have separate instructions, context, permissions, and tools.

Critical financial calculations must be performed by tested application code. Claude interprets, explains, compares, summarizes, and answers questions. It must not freely generate core financial calculations when application code can calculate them.

The AI integration must be modular so another provider can be added or substituted later.


---

# 11. Forms and Submission Behavior

## 11.1 Global form behavior

All forms must:

- Use visible labels rather than placeholder-only labels.
- Identify required and optional fields.
- Validate on blur and on submission without blocking valid user progress prematurely.
- Preserve entered values when validation fails.
- Display field-level errors beside the affected field and a form-level summary when multiple errors exist.
- Prevent duplicate submission while a request is processing.
- Provide a clear success state and next action.
- Support keyboard submission where appropriate.
- Use accessible error associations and focus management.
- Avoid storing exact sensitive financial data unless the user deliberately chooses to save it.

### Recommendation

Use schema-based server and client validation with one shared validation definition where practical. Server validation remains authoritative.

## 11.2 Landing-page address form

Fields:

- Address: required.

Behavior:

1. User selects **Analyze a Specific Property**.
2. Address field expands inline.
3. User enters an address and selects Search.
4. No additional information is required.
5. If one confident address match exists, continue to Deal Analyzer/general property page.
6. If multiple address matches exist, display an accessible selection list.
7. If no property is retrievable, offer manual entry without discarding the entered address.

## 11.3 Investor AI search form

Required input:

- Natural-language query or at least one usable filter/strategy.

Optional inputs:

- Strategy selection.
- Structured filters.
- One or two AI follow-up answers.

Behavior:

- Search may proceed without a profile.
- **Skip and Search Now** bypasses follow-up questions.
- The original wording must remain attached to the search request for ranking and explanation.
- If the query cannot be interpreted, ask for a simple correction rather than fabricating criteria.

## 11.4 Home Buyer AI search form

Required input:

- Natural-language query or enough structured criteria to search.

Behavior:

- Follow-up questions occur only when the request is too broad to produce useful results.
- Follow-ups are optional and easy to skip.
- Affordability inputs are not required to view search results.

## 11.5 Edit Assumptions form

Fields are listed in Section 10.17.

Behavior:

1. Open the current assumption set with source/default labels.
2. Validate numeric ranges and units.
3. Show a live or requested preview of affected metrics.
4. Allow Apply Temporarily, Cancel, or Save as Named Scenario.
5. Recalculate all dependent metrics through application code.
6. Mark user-overridden values as User input.
7. Preserve the original/default scenario.
8. Require authentication only when saving persistently.

## 11.6 Home Buyer affordability form

Possible fields:

- Income.
- Debt.
- Down payment.
- Preferred maximum monthly payment.
- Loan type.
- Loan term.
- Optional credit-score range.
- Optional lender quote.

Behavior:

- A visible Skip action must permit analysis without completing the form.
- Credit score must be explicitly labeled Optional.
- Leaving optional fields blank must not block calculation.
- Exact values may be used temporarily.
- Exact values must not be saved unless the user deliberately chooses to save them.

## 11.7 Manual deal entry form

### Basic fields

- Address.
- Purchase price.
- Rent.
- Bedrooms.
- Bathrooms.
- Square footage.

### Add More Details fields

- Financing.
- Expenses.
- Occupancy.
- Property condition.
- Renovation costs.
- Section 8 information.
- Number of units.
- Taxes.
- Insurance.
- HOA.
- Utilities.

Behavior:

- The basic form must remain usable without opening advanced fields.
- All entered values must be labeled User input in analysis and source panels.
- Unsupported or missing values must not be fabricated.
- Users may return to edit manual data.

## 11.8 Upload and extraction form

Accepted formats:

- PDF.
- Image.
- Screenshot.
- Spreadsheet.

Required behavior:

1. Display a warning to remove unnecessary personal data before upload.
2. Validate file type and configured file-size limits.
3. Upload securely to private storage.
4. Show extraction progress.
5. Attempt sensitive-data detection and redaction assistance.
6. Display extracted values in a review form.
7. Label uncertain values **Needs review**.
8. Require explicit confirmation before analysis.
9. Ask whether to Save to deal or Delete document.
10. Preserve confirmed extracted data if the file is deleted.

### External dependency / TBD

Final upload-size limits, malware-scanning service, document retention period, and exact spreadsheet formats require implementation approval.

## 11.9 Account creation form

Fields/actions:

- Email.
- Password.
- Google sign-in.
- Main terms and disclaimer acceptance.

Behavior:

- Email verification is not required.
- The user may use the account immediately.
- Profile setup is optional and skippable.
- If sign-up began from a guest workflow, transfer eligible temporary work and return the user to that workflow.
- There is no age-verification requirement.

## 11.10 Sign-in form

Support:

- Email and password.
- Google sign-in.
- Secure recovery flow supported by the authentication provider.

The system must return users to the intended page after authentication.

## 11.11 Profile preferences form

Optional fields:

- Experience level.
- Investment strategy.
- Section 8 interest.
- Preferred markets.
- Property types.
- Risk tolerance.
- Cash flow versus appreciation preference.
- Available down-payment range.
- Preferred monthly cash flow.
- Self-management versus property management.

If skipped, use Best Balanced Deal when no other preference exists.

## 11.12 Saved financial ranges form

Optional ranges:

- Income.
- Debt.
- Available down payment.
- Credit score.
- Preferred monthly payment.
- Loan type.
- Loan term.

The UI must distinguish saving a range from entering an exact temporary calculator value.

## 11.13 Personal destination form

Fields:

- Destination type: Workplace, School, Family location, Healthcare provider, Other.
- Address/location.
- Save privately toggle.

Saved destinations must remain private and excluded from shared reports unless explicitly included.

## 11.14 Contact form

Request-type dropdown values:

- General question.
- Technical support.
- Incorrect property data.
- AI analysis issue.
- Billing or account help.
- Partnership or business inquiry.
- Press or media.
- Other.

Other fields:

- Name.
- Email.
- Message.
- Optional prefilled Help AI summary.
- Optional property or analysis reference when relevant.

Technical and account support must route through this form rather than a public support email.

## 11.15 Report an Issue form

User input:

- Brief explanation.
- Optional guest email.

Automatically attached context:

- Property.
- Analysis version.
- Assumptions.
- Data sources.
- Date.
- Relevant system information.

Guests must be permitted to submit. The admin view labels them Guest User.

## 11.16 Share form

Controls:

- Generate link.
- Optional password.
- Optional expiration date.
- Include uploaded documents, off by default.
- Disable link.

Private notes and tasks remain excluded and must not be offered as default shared content.

## 11.17 Notes and task forms

Notes:

- Add and edit private text.
- Remain excluded from shares by default.

Tasks:

- Add task.
- Edit task.
- Mark complete/incomplete.
- Delete task.
- Display in collapsible checklist.

## 11.18 Account deletion form

Behavior:

1. Explain what active data will be removed.
2. Offer **Download My Data** before deletion.
3. Require current authentication or recent reauthentication.
4. Require explicit confirmation.
5. Remove personal information from active systems immediately.
6. Invalidate private share links and active sessions.
7. Explain that encrypted backup remnants may remain inaccessible until normal backup expiration.

## 11.19 Administrator forms

Admin forms must include:

- User management actions.
- Market activation and status.
- Assumption approval/edit/research request.
- Data-source configuration.
- Refresh-limit configuration.
- Content editing and preview.
- Backup restore.
- Recovery-method changes.

Sensitive actions require recent reauthentication. Market publication and backup restoration require explicit confirmation and audit logging.

---

# 12. Search, Sorting, and Filtering

## 12.1 Search-ranking precedence

### Investor results

Ranking priority must be:

1. Current written search.
2. Selected investment goals.
3. Saved profile preferences.

### Home Buyer results

The current written search is the strongest factor. Profile preferences may influence results but must carry less weight than the active request.

Search-result explanations should identify important match reasons without claiming unsupported causation.

## 12.2 Investor default filters

- Location.
- Price range.
- Property type.
- Bedrooms.
- Bathrooms.

## 12.3 Investor advanced filters

- Section 8 status.
- Occupied or vacant.
- Current monthly rent.
- Number of units.
- Property condition.
- Renovation needs.
- Minimum monthly cash flow.
- Minimum cap rate.
- Minimum cash-on-cash return.
- Appreciation potential.
- Risk level.
- Minimum investor score.
- Days on market.
- Estimated total cash required.

## 12.4 Investor sorting

Manual sort options:

- Cash flow.
- Cap rate.
- Cash-on-cash return.
- Risk.
- Appreciation potential.
- Price.
- Overall deal score.
- Days on market.

## 12.5 Investor result views

Users may switch among:

- Grid.
- List.
- Map.
- Split view.

Defaults:

- Desktop: split view.
- Mobile: property cards.

View changes must not reset the current search or filters.

## 12.6 Home Buyer default filters

- Location.
- Price.
- Bedrooms.
- Bathrooms.
- Property type.

## 12.7 Home Buyer advanced filters

- Square footage.
- Lot size.
- Year built.
- Move-in readiness.
- School information.
- Commute.
- Neighborhood safety.
- HOA fees.
- Parking or garage.
- Accessibility features.
- Property condition.
- New construction.
- Days on market.
- Open houses.
- Amenities.
- Estimated monthly payment.
- Down payment.
- Property taxes.
- Homeowners insurance.

## 12.8 Home Buyer sorting

Default:

- Best Overall Match.

Additional sorts:

- Price.
- Monthly payment.
- Newest listing.
- Home Buyer score.
- Square footage.
- Days on market.

## 12.9 Search coverage and confidence behavior

- Search results outside fully supported markets must display a limited-local-data or lower-confidence notice when applicable.
- Unsupported filters must be disabled or labeled unavailable rather than silently ignored.
- If a filter depends on estimated data, the UI must identify that the result is estimate-based.
- Empty results must preserve the user’s query and offer clear ways to broaden criteria.

## 12.10 Recommendation: search request model

Represent each search as:

- Original natural-language text.
- Parsed structured criteria.
- User-selected strategies.
- User-selected filters.
- Optional follow-up answers.
- Ranking goal.
- Profile influence used.
- Market coverage/confidence.

This makes ranking explainable and testable without changing confirmed product behavior.

---

# 13. Accounts and Authentication

## 13.1 Sign-in methods

Required:

- Email and password.
- Google sign-in.

Apple sign-in is a future feature.

## 13.2 Email verification

Email verification is not required at launch. Users may use accounts immediately.

### Recommendation

Use risk-based protections such as rate limiting, abuse monitoring, password-strength rules, and reauthentication for sensitive actions to compensate for immediate account activation.

## 13.3 Profile setup

Profile setup is optional and must be skippable.

Default when no preferences exist:

- Best Balanced Deal.

## 13.4 Guest session

Guest work is temporary to the browser tab. The implementation must:

- Preserve guest state during normal in-tab navigation.
- Attempt to preserve state after a refresh.
- Remove state after the tab session ends.
- Warn before leaving with unsaved work.
- Transfer current eligible work after authentication.

## 13.5 User data controls

Users must be able to:

- View/edit profile preferences.
- Configure notifications.
- Delete saved chats.
- Download their data.
- Delete their account.

## 13.6 Terms acceptance

Users accept the main terms and disclaimers:

- During account creation.
- On first use of advanced analysis.

Do not interrupt users with a long disclaimer before every analysis. Use concise contextual notices near estimates and recommendations.

## 13.7 Administrator authentication

Admin login requires:

- Email and password.
- SMS verification code sent to the primary phone.

Recovery methods:

- Verified backup phone.
- Verified recovery email.

Changing recovery methods requires current authentication. Sensitive actions require recent reauthentication.

---

# 14. Database and Stored-Data Requirements

## 14.1 Persistence requirements

User information must persist between sessions. Supabase must store or manage:

- Accounts.
- Profiles.
- Preferences.
- My Deals.
- Folders.
- Progress stages.
- Notes.
- Tasks.
- Scenarios.
- Chats.
- Notifications.
- Documents.
- Admin settings.
- Share links.
- Reports and export references.
- Market configuration and assumptions.
- Source records and refresh metadata.
- Analysis versions and confidence data.
- Issue reports and support requests.
- Audit/activity logs.

## 14.2 Recommended logical data model

The following entities are implementation recommendations that support confirmed requirements. Names may change, but equivalent relationships are required.

### Identity and preferences

- `users`
- `profiles`
- `profile_preferences`
- `saved_financial_ranges`
- `personal_destinations`
- `notification_preferences`

### Property and source data

- `properties`
- `property_addresses`
- `property_listings`
- `property_facts`
- `property_fact_source_values`
- `property_photos`
- `listing_history`
- `price_history`
- `source_providers`
- `source_fetch_runs`
- `source_outages`
- `property_refresh_jobs`

Each important selected property fact should retain:

- Selected value.
- Unit.
- Selected source.
- All candidate source values.
- Selection method: majority, source priority, user input, extraction, estimate, or other approved method.
- Verification/status label.
- Source retrieval time.
- Effective date where known.
- Confidence.

### Analysis

- `analysis_runs`
- `analysis_versions`
- `investor_analyses`
- `home_buyer_analyses`
- `section8_analyses`
- `analysis_assumptions`
- `analysis_scores`
- `analysis_risks`
- `analysis_recommendations`
- `low_confidence_inputs`
- `comparable_sales`
- `comparison_workspaces`
- `comparison_members`

### User workspace

- `saved_deals`
- `deal_folders`
- `folder_memberships`
- `deal_notes`
- `deal_tasks`
- `saved_scenarios`
- `saved_chats`
- `chat_messages`
- `notifications`

### Documents and sharing

- `uploaded_documents`
- `document_extractions`
- `document_extracted_fields`
- `document_redaction_results`
- `share_links`
- `generated_reports`

### Operations and admin

- `market_coverage`
- `market_assumptions`
- `market_research_runs`
- `market_sample_analyses`
- `content_entries`
- `content_versions`
- `issue_reports`
- `support_requests`
- `admin_users`
- `admin_roles`
- `admin_activity_logs`
- `system_settings`
- `backup_records`

## 14.3 Data ownership and isolation

- Private user records must be scoped to the owning authenticated user.
- Shared-link access must be token-based and read only.
- Admin access must be permission based.
- Property source data may be shared across analyses only when license terms permit it.
- Property-specific chat context must be isolated by property and user/session.
- Saved destinations, financial ranges, notes, tasks, chats, and uploads are private unless the user deliberately shares eligible content.

## 14.4 Data labels and provenance

Store sufficient metadata to render these labels accurately:

- Confirmed.
- Estimated.
- Benchmark.
- Unverified.
- Description-extracted.
- User input.
- Not available.
- Insufficient data.
- Low confidence.
- Not applicable.

## 14.5 Analysis versioning

Each generated analysis must retain:

- Property data snapshot/version.
- Formula version.
- Scoring-model version.
- Market-assumption version.
- AI prompt/model version or traceable identifier.
- User assumptions.
- Generated time.
- Confidence inputs.

This version information is required to support issue reports, score-change notifications, reproducibility, and audits.

## 14.6 Document retention

After extraction, users choose whether the document remains attached to the deal. If deleted:

- The source file must be removed from active storage.
- Confirmed extracted structured values may remain.
- The retained values must keep provenance indicating they originated from a deleted upload and were user confirmed.

## 14.7 Account deletion

Active systems must immediately remove or anonymize, as appropriate:

- Profile.
- Financial preferences.
- My Deals.
- Scenarios.
- Notes.
- Tasks.
- Documents.
- Saved chats.
- Private share links.

Encrypted backup remnants may remain inaccessible until the normal backup cycle expires.

## 14.8 Download My Data

The export must include:

- Profile.
- Preferences.
- Saved properties.
- Folders.
- Scenarios.
- Comparisons.
- Notes.
- Tasks.
- Chats.
- Documents.
- Reports.
- Shared links.

Use common formats, including PDF, CSV, and original upload formats as appropriate.

## 14.9 Backups

Required:

- Weekly restorable backups.
- More frequent automatic backups when included by the provider.
- Separate file backup when database backup does not include uploaded file contents.

Restore workflow:

1. Preview affected records.
2. Show newer data at risk.
3. Prefer record-level recovery.
4. Create a new safety backup.
5. Require administrator approval and recent reauthentication.

---

# 15. Administrator Dashboard Requirements

## 15.1 Dashboard modules

The admin dashboard must support:

- User management.
- Issue reports.
- Support requests.
- Data-source status.
- API configuration.
- AI monitoring.
- Market coverage.
- Market expansion.
- Content management.
- Legal and disclaimer content.
- Usage analytics.
- Notification settings.
- Refresh limits.
- Backup and restore.
- Activity logs.

## 15.2 Market coverage statuses

- Not configured.
- In development.
- Internal testing.
- Limited beta.
- Fully supported.
- Temporarily paused.

## 15.3 Market-expansion workflow

The dashboard must support this sequence:

1. Enter a state, region, county, city, or ZIP code.
2. Retrieve connected property data.
3. Research local assumptions.
4. Check source coverage.
5. Generate suggested assumptions.
6. Generate sample analyses.
7. Review confidence and warnings.
8. Approve, edit, request more research, limit, or reject.
9. Publish the market.

The administrator chooses the sample-analysis count each time. Default: 10.

## 15.4 Automated market-research output

Potential research topics:

- Vacancy.
- Insurance.
- Management fees.
- Maintenance reserves.
- Appreciation history.
- Rental demand.
- Leasing speed.
- Renovation costs.
- Neighborhood risk.
- Section 8 requirements.

For each suggested assumption, show:

- Suggested value.
- Supporting range.
- Sources.
- Source reliability.
- Data date.
- Geographic relevance.
- Confidence.
- Approve.
- Edit.
- Request more research.

The administrator approves final assumptions rather than every source item.

## 15.5 Content-management system

Editable without code:

- Landing-page text.
- About Us.
- FAQs.
- Help articles.
- Disclaimers.
- Contact information.
- Search examples.
- Announcements.
- Supported-market notices.
- Reusable labels.

Required content features:

- Preview before publishing.
- Version history.
- Restore earlier content.

The CMS must not expose financial formulas, scoring logic, API settings, or security settings to ordinary content editing.

## 15.6 User and support management

Admin must be able to:

- Find users according to permitted identifiers.
- View issue-report context.
- View guest issue reports as Guest User.
- Update issue/support statuses.
- Provide in-app report updates to signed-in users.
- Avoid exposing unnecessary private user content to roles that do not need it.

### Recommendation

Use least-privilege support views and redact private financial/chat/document content unless needed for a specific authorized case.

## 15.7 Data-source status and API configuration

Admin must be able to view:

- Provider availability.
- Last successful fetch.
- Error state.
- Affected markets or features.
- Stored-data age.
- Configuration state.

Sensitive credentials must not be displayed in plaintext after entry.

## 15.8 AI monitoring

Admin monitoring should support:

- Assistant type.
- Model/version identifier.
- Success/failure status.
- Latency and token/cost indicators where available.
- Safety or policy flags.
- Analysis version linkage.
- User-reported AI issues.

Private AI conversation content must not be included in product analytics. Access for support investigation must be tightly controlled and logged.

## 15.9 Refresh limits and notifications

Admin can change the launch default of three manual refreshes per signed-in user per day and manage platform-level notification settings.

## 15.10 Activity log

Maintain a complete searchable admin activity log containing:

- Summary.
- Date and time.
- Administrator.
- Affected user, property, market, or setting.
- Previous value.
- Updated value.
- Security and recovery events.

Verification codes must never be stored in the activity log.

## 15.11 Backup restore

Before restoration, admin must see affected records and newer information at risk. The system must create a safety backup, prefer record-level recovery, and require explicit approval plus recent reauthentication.

---

# 16. External Integrations

## 16.1 Property-data providers

Planned production integrations:

- Realtor.com.
- Zillow.
- Redfin.
- Additional approved licensed/public property datasets as needed.

These integrations are subject to licensing and access approval.

## 16.2 Government and Section 8 data

- HUD.
- HUD User.
- Local housing-authority data when available.

Integrations must preserve source date, geographic coverage, and confidence.

## 16.3 Mapping and proximity

- Geoapify for location, nearby places, routing, and travel times.
- MapLibre for map rendering.

## 16.4 AI

- Anthropic Claude API for live AI features.
- Modular provider layer for future substitution or addition.

## 16.5 Backend platform

Supabase at launch for:

- PostgreSQL.
- Authentication.
- User permissions.
- File storage.
- Edge Functions.
- Queues.
- Scheduled jobs.
- Realtime progress updates.

No separate background-job platform is required initially. The architecture must allow one later if workloads grow.

## 16.6 Hosting

- Vercel or another compatible professional hosting platform.

## 16.7 Admin two-factor authentication

An SMS provider is required for admin verification codes.

## 16.8 Integration failure behavior

- One property provider failure must not surface to users when another provider can satisfy the request.
- A user-facing warning appears only when all relevant sources fail to provide the requested information.
- Long-running integrations must expose progress states.
- Integration credentials remain server side.
- Provider-specific code must be isolated behind adapters.

## 16.9 External dependencies / TBD

Required before production:

- Zillow API access.
- Realtor.com API access.
- Redfin API access.
- HUD API access.
- Data-display, caching, storage, combination, AI-use, photo, agent-info, and linking rights.
- Anthropic API key.
- Supabase project.
- Geoapify key.
- SMS provider.
- Sample development data.

---

# 17. Design and Branding Direction

## 17.1 Brand style

The visual system must combine:

- Professional financial-platform design.
- Modern AI styling.
- Polished real-estate photography.

It must remain functional, trustworthy, and beginner friendly.

## 17.2 Color palette

Primary palette:

- Dark navy.
- White.
- Subtle gold accents.

Gold must be used sparingly for:

- Selected controls.
- Important scores.
- Key actions.
- Premium visual details.

Gold must not reduce legibility or make the site appear overly decorative.

## 17.3 Typography

- Elegant headings.
- Clean modern body text.
- Highly readable financial tables and numbers.
- Clear differentiation between labels, values, assumptions, and confidence states.

## 17.4 Visual content

Use a balanced mix of:

- Property photography.
- Maps.
- Charts.
- Tables.
- Subtle AI graphics.

Visuals must support decision making rather than overwhelm the interface.

## 17.5 Light and dark modes

- Default to device preference.
- Allow Light, Dark, and System.
- A manual choice overrides the device preference.

## 17.6 Motion

Use moderate, polished animation for:

- Page transitions.
- Property cards.
- Charts.
- AI processing.
- Expanding panels.

Animations must remain fast and functional and must respect reduced-motion settings.

## 17.7 Recommendations

- Use a consistent score-card system with visible confidence and label status.
- Use monospace or tabular numerals for dense financial tables where it improves alignment.
- Avoid presenting gold as a proxy for a paid tier because the site is free at launch.
- Use clear visual separation between confirmed facts, assumptions, and estimates.

---

# 18. Desktop, Tablet, and Mobile Behavior

## 18.1 Desktop

Desktop is the primary development target and must provide the richest experience for:

- Split maps.
- Comparison tables.
- Dashboards.
- Side navigation.
- Advanced filters.
- Dense financial information.

Desktop default for Investor Search is split view.

## 18.2 Tablet

- Larger tablets: simplified desktop behavior.
- Smaller tablets: mobile behavior.
- Tables may become horizontally scrollable or convert to comparison cards when needed.
- Touch targets must remain accessible.

## 18.3 Mobile

Mobile must support:

- Search.
- Property viewing.
- Full analysis.
- Saving deals.
- AI assistants.
- Account access.

Mobile defaults to property cards for search results.

Detailed analysis uses expandable sections and a section selector rather than persistent desktop side navigation.

## 18.4 Responsive content priorities

On smaller screens, preserve in this order:

1. Primary property facts and current context.
2. Main score, recommendation, and confidence.
3. Critical financial/affordability metrics.
4. Risks and missing information.
5. Save, analyze, compare, and assistant actions.
6. Detailed tables and secondary charts.

No required feature may be removed solely because the user is on mobile, although presentation may be simplified.

## 18.5 Responsive maps and comparisons

- Split view may collapse to toggled Results/Map views on narrow screens.
- Multi-property comparison must remain usable through cards, sticky property labels, or horizontal scroll.
- Users must not lose search state when changing views or orientation.

---

# 19. Accessibility Requirements

DealFactor must meet standard accessibility requirements without cluttering the interface.

## 19.1 Required accessibility behavior

- Readable color contrast.
- Full keyboard navigation.
- Visible keyboard focus.
- Screen-reader labels.
- Accessible forms.
- Clear validation errors.
- Descriptive image alternative text.
- Reduced-motion support.
- Semantic heading hierarchy.
- Accessible dialogs, side panels, menus, tabs, accordions, tooltips, maps, and notifications.
- Focus trapping and return for modal/quick-view interfaces.
- Status announcements for loading, success, refresh, and AI completion.
- No color-only communication for scores, risk, confidence, or status.

## 19.2 Target standard

### Recommendation

Target WCAG 2.2 Level AA for public and authenticated user experiences. Treat this as the implementation definition of “standard accessibility requirements,” subject to legal review.

## 19.3 Charts, maps, and tables

- Charts require text summaries or accessible data tables.
- Financial tables need proper row/column headers.
- Map-only information must also be available in a list or text format.
- Interactive map markers must be keyboard reachable where practical.

## 19.4 AI and dynamic updates

- AI progress must be announced without excessive repetition.
- New generated content must not unexpectedly move focus.
- Long generated content needs headings and landmarks.
- Error recovery must remain keyboard accessible.

---

# 20. SEO Requirements

## 20.1 Launch indexing policy

At launch, the website is publicly accessible by URL, but search engines must be instructed not to index it.

## 20.2 Permanently private indexing exclusions

The following must always remain excluded from indexing:

- My Deals.
- Profiles.
- Uploads.
- Saved scenarios.
- AI conversations.
- Private reports.
- Admin pages.
- Shared private analysis pages.

## 20.3 Social sharing metadata

Public pages should use polished DealFactor social previews.

Private analysis links must use a generic preview and must not expose:

- Address.
- Property photo.
- Scores.
- Financial results.
- User identity.

## 20.4 Recommendation: technical controls

At launch:

- Use sitewide `noindex, nofollow` where appropriate.
- Configure `robots.txt` consistently with page metadata.
- Do not rely on `robots.txt` alone for private pages.
- Private pages must require authentication or a valid share token.
- Use canonical URLs and structured metadata architecture so indexing can be enabled later without redesign.

## 20.5 Future indexing

Public indexing may be enabled later. No launch requirement exists for public search ranking or property-page indexing.

---

# 21. Performance Requirements

## 21.1 Launch scale

Expected launch traffic is fewer than 10 users. Enterprise-scale infrastructure is not a launch priority.

The architecture must remain organized enough to expand later without an immediate rebuild.

## 21.2 Page performance

- Basic pages and stored data must load quickly.
- Search interfaces must become interactive without waiting for full analysis.
- Cached or previously stored analysis should render promptly while freshness is identified.
- Images must be responsive and optimized.
- Noncritical content should load progressively.

### Recommendation: initial targets

These targets are recommendations, not interview-confirmed numeric requirements:

- Core static/navigation pages: target Largest Contentful Paint under 2.5 seconds on a typical broadband connection.
- Common authenticated data views: target useful content within 2 seconds when data is already stored.
- User input response: target under 100 milliseconds for local UI feedback.
- Avoid unbounded client bundles and unnecessary map/AI code on pages that do not need them.

## 21.3 Full analysis performance

Accuracy and completeness take priority over speed. Full analysis may take longer when retrieving and verifying available data. DealFactor must not skip available information merely to produce a faster result.

Long actions must show a step-by-step progress panel with applicable stages:

- Finding properties.
- Combining listing data.
- Reviewing comparable sales.
- Researching market conditions.
- Calculating returns.
- Evaluating risks.
- Generating analysis.

Do not show fake precision or inaccurate percentage completion. Allow cancellation when practical.

## 21.4 Background work

Supabase queues, scheduled jobs, Edge Functions, and realtime progress may support launch workloads. A separate job platform is not required initially but must be addable later.

## 21.5 Resilience

- Retry transient provider failures with controlled backoff.
- Avoid duplicate analysis/refresh jobs.
- Make long-running work idempotent where practical.
- Preserve completed stages if a later stage fails.
- Do not replace fresh data with older data during a partial refresh.

---

# 22. Security and Privacy Requirements

## 22.1 Core security requirements

- API keys and secrets remain on the backend.
- Use encrypted HTTPS connections in production.
- Use Supabase authentication and row-level authorization or equivalent controls.
- Enforce least privilege for users and staff.
- Validate all user input server side.
- Apply rate limiting and abuse prevention to authentication, search, AI, refresh, upload, share, contact, and issue-report endpoints.
- Protect against common web risks, including injection, cross-site scripting, cross-site request forgery where applicable, insecure direct object references, and malicious file uploads.
- Store passwords only through the authentication provider’s secure password handling.

## 22.2 Privacy minimization

Do not collect or retain data that is unnecessary for the requested feature.

Exact financial values may be used temporarily in calculators. They must not be saved unless the user deliberately chooses to save them.

Private search wording, uploaded contents, personal financial information, private AI conversations, passwords, and sensitive account data must not be recorded in analytics.

## 22.3 File security

- Uploaded files must be private by default.
- Access requires the owning user or deliberate share inclusion.
- Validate content type and extension.
- Scan or isolate files according to the selected launch security approach.
- Attempt sensitive-data detection/redaction but clearly state that it is not guaranteed.
- Deleting a document removes the active source file while allowing confirmed extracted structured data to remain.

## 22.4 Share-link security

- Use high-entropy unguessable tokens.
- Support optional password and expiration.
- Allow owner revocation.
- Keep shared content read only.
- Exclude notes/tasks and documents by default.
- Prevent search indexing and sensitive social previews.
- Do not expose owner identity unless deliberately included.

## 22.5 Admin security

Required:

- Email/password plus SMS verification.
- Verified backup phone and recovery email.
- Current authentication to change recovery methods.
- Recent reauthentication for backup restore, market publication, security changes, and data-source changes.
- Complete searchable activity log.
- No verification code in logs.

## 22.6 Privacy and account deletion

Users can delete accounts. Active personal information must be removed immediately as described in Sections 14 and 11. Encrypted backup remnants may remain inaccessible until expiration through the normal backup cycle.

## 22.7 Cookies and browser storage

Use only essential cookies or storage for:

- Authentication.
- Security.
- Appearance preference.
- Temporary guest analysis.
- Abuse prevention.

No advertising or cross-site tracking cookies at launch.

## 22.8 Fair Housing and sensitive inferences

Neighborhood, school, safety, and location analysis must comply with Fair Housing requirements and must not steer users based on protected characteristics.

### Recommendation

Legal review should define allowed datasets, wording, proxy-risk controls, and presentation rules for neighborhood and school scoring before production.

## 22.9 Incident readiness recommendation

Maintain documented procedures for credential rotation, provider compromise, unauthorized access, account takeover, sensitive-data upload, and restoration. This supports the confirmed security expectations without adding a user-facing feature.

---

# 23. Error, Loading, Success, and Empty States

## 23.1 Global state requirements

Every asynchronous feature must define:

- Idle state.
- Loading state.
- Success state.
- Empty state.
- Recoverable error state.
- Unrecoverable error state.
- Offline or connectivity-limited state when relevant.

Messages must explain what happened, whether user input was preserved, and what action is available next.

## 23.2 Short loading states

Use a spinner or subtle indicator for short actions, including:

- Saving a deal.
- Changing a folder or stage.
- Updating a task.
- Applying a simple filter.
- Opening stored content.

## 23.3 Long loading states

Use the staged progress panel described in Section 21.3 for search, aggregation, document extraction, refresh, comparisons, and full analysis.

The system must not display fabricated percentages. Cancellation must be offered when practical.

## 23.4 Property source outage states

- If one source fails but another provides the needed data, continue without alarming the user.
- If all relevant sources fail, show a clear retrieval warning.
- If recent stored data is available, allow use and show its age.
- Preserve the user’s address/search and provide Retry or Manual Entry.

## 23.5 Missing-data state

Use approved labels rather than blank or invented values:

- Not available.
- Insufficient data.
- Unverified listing claim.
- Low confidence.
- Not applicable.

Explain material missing data and how it affects confidence.

## 23.6 Search empty state

Display:

- No matching properties found.
- Current query/filters retained.
- Suggestions to broaden location, price, strategy, or thresholds.
- Clear reset controls.
- Address analysis/manual entry alternatives.

Do not silently remove filters to create results.

## 23.7 My Deals empty state

Explain how to save a property and provide direct actions to:

- Explore Investor Properties.
- Find a Home to Buy.
- Analyze a Specific Property.

## 23.8 Comparison empty state

Explain the supported property-input methods and provide actions to add a DealFactor property, search an address, enter a manual deal, or upload a document.

## 23.9 Upload states

Required states:

- Uploading.
- Scanning/validating.
- Extracting.
- Needs review.
- Ready for confirmation.
- Saved to deal.
- Document deleted.
- Unsupported type.
- File too large.
- Extraction failed.
- Redaction assistance warning.

An extraction failure must not prevent manual data entry.

## 23.10 Manual refresh states

Show:

- Remaining refreshes.
- Refresh in progress.
- Property facts updated.
- Scores/scenarios recalculating.
- Completed time.
- Next automatic refresh.
- Daily limit reached.
- Provider failure with retry guidance.

## 23.11 Authentication states

- Invalid credentials must not reveal whether a particular account exists beyond the authentication provider’s safe behavior.
- Guest conversion must show that work is being transferred.
- If transfer partially fails, preserve the account and explain which work needs to be retried.

## 23.12 Form success states

Examples:

- Contact request submitted.
- Issue report submitted.
- Scenario saved.
- Share link created.
- Account export requested/ready.
- Account deleted.
- Content published.
- Market published.

Success messages must not disappear before screen-reader users can perceive them.

## 23.13 AI error states

If AI interpretation fails:

- Preserve calculated facts and structured data.
- Explain that the explanation or summary could not be generated.
- Offer Retry.
- Do not replace missing AI output with fabricated text.
- Allow the user to continue using non-AI calculations when available.


---

# 24. Analytics Requirements

## 24.1 Analytics approach

Use privacy-focused, first-party product analytics.

## 24.2 Permitted tracking

Track aggregated product behavior such as:

- Visitors.
- Account creation.
- Feature usage.
- Search completion.
- Saved deals.
- Deal Analyzer usage.
- Property-page engagement.
- Errors.
- Drop-off points.

## 24.3 Prohibited analytics content

Do not record:

- Private natural-language search wording.
- Uploaded document contents.
- Personal financial information.
- Private AI conversations.
- Passwords.
- Sensitive account information.

## 24.4 Recommended event categories

The following event categories are recommended to make the confirmed metrics actionable without collecting prohibited content:

- `page_view` with page type, not private identifiers.
- `search_started` and `search_completed` with market, result count band, search type, and filter count, but not query text.
- `follow_up_shown`, `follow_up_skipped`, and `follow_up_completed`.
- `property_quick_view_opened`.
- `analysis_started`, `analysis_completed`, and `analysis_failed` with analysis type and supported-market status.
- `assumptions_opened`, `assumptions_applied`, and `scenario_saved` without values.
- `deal_saved`, `deal_removed`, `folder_created`, `stage_changed`, and `task_used`.
- `manual_entry_started/completed`.
- `upload_started/completed/failed` with file type and size band, not filename or contents.
- `share_created`, `share_viewed`, `share_disabled`.
- `issue_report_submitted` and `contact_submitted` with request category only.
- `refresh_started/completed/failed/limit_reached`.
- `help_ai_opened` and `help_escalated` without conversation content.

## 24.5 Analytics access and retention

### Recommendation

- Limit raw analytics access to the owner/full administrator.
- Define a retention period before launch.
- Avoid stable cross-context identifiers when aggregated event data is sufficient.
- Document all analytics cookies/storage in the Cookie Policy.

---

# 25. Legal-Page Requirements

## 25.1 Required launch pages

- Privacy Policy.
- Terms of Use.
- Cookie Policy.
- Investment and Financial Disclaimer.
- AI Disclaimer.
- Property-Data Disclaimer.
- Fair Housing Notice.
- Accessibility Statement.

## 25.2 Required acceptance points

Users accept the main terms and disclaimers:

- When creating an account.
- When first using advanced analysis.

Do not place a long blocking disclaimer before every analysis.

## 25.3 Contextual notices

Short notices must appear near:

- Financial estimates.
- Mortgage calculations.
- AI recommendations.
- Neighborhood scores.
- Section 8 projections.
- Renovation estimates.

## 25.4 Required non-guarantee content

DealFactor does not guarantee:

- Investment returns.
- Property values.
- Mortgage terms.
- Appraisals.
- Inspections.
- Legal advice.
- Tax advice.
- Housing-authority approval.
- Seller acceptance.

## 25.5 Privacy Policy content requirements

At minimum, describe:

- Account and profile data.
- Optional financial ranges and temporary exact inputs.
- Search and analysis data.
- Uploaded documents and extraction.
- AI providers and processing.
- Property and third-party data sources.
- Analytics restrictions.
- Essential cookies/storage.
- Sharing links.
- Retention and backups.
- Account export and deletion.
- Contact method for privacy requests.

## 25.6 Terms of Use content requirements

At minimum, address:

- Eligibility and account responsibilities.
- Acceptable use.
- Property-data and listing limitations.
- AI limitations.
- User-uploaded content.
- Private sharing.
- No professional advisory relationship.
- Service changes and availability.
- Intellectual property.
- Termination/account deletion.
- Dispute and governing terms after legal review.

There is no age-verification feature requirement.

## 25.7 Investment and financial disclaimer

Must clearly state that outputs are estimates and educational decision-support information, not investment, financial, lending, appraisal, legal, or tax advice. Users must independently verify material information and consult appropriate professionals.

## 25.8 AI disclaimer

Must explain:

- AI may make mistakes.
- Application code performs critical calculations.
- AI explains and interprets available data.
- Missing information is not intended to be invented.
- Users should verify property facts, risks, and recommendations.

## 25.9 Property-data disclaimer

Must explain:

- Data comes from third parties.
- Sources may conflict, be incomplete, or be delayed.
- The source-selection rules.
- Last-update and confidence behavior.
- Original source links when available.

## 25.10 Fair Housing notice

Must state the commitment to Fair Housing compliance and explain that the website must not be used for discriminatory housing decisions.

## 25.11 Accessibility statement

Must describe the accessibility target, known contact channel for accessibility issues, and ongoing improvement process.

## 25.12 External dependency / TBD

All legal pages and contextual language require qualified legal review before production launch.

---

# 26. Hosting, Deployment, and Custom-Domain Requirements

## 26.1 Technical stack

### Frontend

- Next.js.
- TypeScript.
- Responsive desktop-first interface.
- GitHub repository from the beginning.

### Backend

- Supabase PostgreSQL.
- Supabase Authentication.
- User permissions.
- File storage.
- Edge Functions.
- Queues.
- Scheduled jobs.
- Realtime progress updates.

### Hosting

- Vercel or another compatible professional hosting platform.

### AI

- Anthropic Claude API.

### Mapping

- Geoapify.
- MapLibre.

### Development

- Claude Code.

## 26.2 Environments

### Recommendation

Maintain separate environments for:

- Local development.
- Preview/testing.
- Production.

Each environment should use separate credentials, databases or schemas, storage buckets, and webhook/endpoints where supported. Production data must not be copied into development without appropriate sanitization.

## 26.3 Source control and deployment

Required:

- GitHub repository established at the beginning.
- Deployments from version-controlled code.
- Secrets supplied through secure environment variables.
- Database migrations committed and reviewable.

### Recommendation

Use pull-request previews, automated tests before production deployment, and protected production branches.

## 26.4 Scheduled jobs

Configure scheduled work for:

- Twice-daily active listing refreshes.
- Weekly off-market refreshes.
- Notifications generated from material changes.
- Backup workflows where not fully managed by the provider.
- Expired share-link cleanup.
- Other maintenance jobs required for retention and integrity.

## 26.5 Custom domain

The final domain will be purchased outside this specification.

Production requirements:

- Connect the final domain to the hosting platform.
- Enforce HTTPS.
- Redirect alternate hostnames to the canonical hostname.
- Configure secure DNS records.
- Configure generic social metadata.
- Keep launch noindex controls active after domain connection.
- Avoid exposing preview/staging environments to indexing.

## 26.6 Monitoring and logs

### Recommendation

Implement production error monitoring, structured server logs, job status monitoring, provider-health monitoring, and uptime alerts. Logs must exclude passwords, verification codes, private AI content, uploaded document contents, and personal financial values.

## 26.7 Operating budget

Target initial operating cost: approximately $50–$100 per month.

Before implementation, prepare a cost breakdown for:

- Hosting.
- Supabase.
- Claude API.
- Mapping.
- Storage.
- Property-data APIs.
- Supporting research services.

Property-data licensing is the cost most likely to exceed the target.

If projected cost exceeds the target, explain:

- Which service causes the increase.
- Why it is needed.
- Whether a cheaper alternative exists.
- What functionality changes under the cheaper option.

Accuracy and reliability are more important than choosing the cheapest service.

---

# 27. Minimum Viable Launch Version

The first public launch must include the following capabilities.

## 27.1 Discovery and property access

- Nationwide basic property search.
- Detroit advanced investor analysis.
- Investor AI search.
- Home Buyer search and analysis.
- Address search.
- Quick-view panels.
- General and context-specific property pages.
- Active and off-market property handling.

## 27.2 Analysis

- One-property Deal Analyzer.
- Multi-property comparison.
- Comparable sales.
- Financial calculations.
- Editable assumptions.
- Named saved scenarios.
- Investor scores and analysis.
- Home Buyer scores and analysis.
- Full Section 8 analysis.
- Low-confidence ranges and explanations.
- Environmental risk support.
- Renovation analysis with launch-level simplification where specified.

## 27.3 AI

- Investor analysis.
- Home Buyer analysis.
- Section 8 analysis.
- Ask About This Deal.
- Ask About This Home.
- Deal Analyzer assistant.
- General Help AI.
- Document extraction.
- Admin research summaries at simplified launch capability.

## 27.4 Accounts and workspace

- Email/password and Google authentication.
- No email verification.
- Guest usage and guest-to-account transfer.
- Optional profiles.
- My Deals.
- Folders.
- Progress stages.
- Notes.
- Tasks.
- Saved chats.
- In-app notifications.
- Profile privacy controls.
- Download My Data.
- Account deletion.

## 27.5 Data transparency and support

- Property-source conflict rules.
- Last-updated information.
- Automatic and manual refresh.
- View Data Sources.
- Source links.
- Confidence warnings.
- Report an Issue.
- Contact form.
- About and Help content.

## 27.6 Manual data, sharing, and reports

- Manual deal entry.
- PDF/image/screenshot/spreadsheet upload.
- AI extraction and required user confirmation.
- Retention choice.
- Sensitive-data warning and redaction assistance.
- Private view-only sharing.
- Optional share password and expiration.
- Standard downloadable report.

## 27.7 Administration and operations

- Core admin dashboard.
- Prepared staff roles, with owner-only access initially.
- Market coverage and expansion controls.
- Simplified automated market research.
- CMS.
- Data-source and AI monitoring.
- Refresh-limit setting.
- Issue/support management.
- Backups and restore workflow.
- Activity logs.
- Admin SMS two-factor authentication.

## 27.8 Launch quality bar

The MVP is not complete until:

- Required financial calculations have automated tests.
- Major workflows have automated coverage.
- Missing data is never fabricated.
- Source conflicts follow the required rules.
- Analysis confidence is visible.
- Desktop flows are polished.
- Mobile supports all core user actions.
- Legal and licensing approvals required for launch are complete.

---

# 28. Features Excluded from the First Launch

The following are explicitly excluded or deferred:

- Properties with five or more units.
- Commercial property analysis.
- Vacant-land analysis.
- Paid subscriptions.
- Paywalls.
- Payment processing.
- Upgrade pressure.
- Email property alerts.
- Text/SMS property alerts.
- Collaborative deal workspaces.
- Direct property-tour requests.
- Agent partnerships/features.
- Lender partnerships/features.
- Property-manager partnerships/features.
- Fully activated multi-staff role interfaces.
- Advanced investor analysis nationwide outside activated markets.
- Apple sign-in.
- Required email verification.
- Founder name, photo, and story on About Us.
- Search-engine indexing.

The following launch features are included but intentionally simplified:

- Admin market-research automation.
- Extraction for uncommon document types.
- Analytics dashboards.
- Mobile optimization.
- Report customization.
- Profile weighting controls.
- Renovation models outside fully supported markets.
- Advanced staff-role interfaces.

Simplification must not remove the architectural foundation needed for later expansion.

---

# 29. Future Features

Officially reserved for later:

- Paid plans and monetization.
- Premium reports.
- Higher limits.
- Referrals and approved partnerships.
- Email and text property alerts.
- Collaborative deal workspaces.
- Direct property-tour requests.
- Agent partnerships.
- Lender partnerships.
- Property-manager partnerships.
- Fully activated staff roles.
- More advanced mobile optimization.
- Advanced investor analysis outside Detroit and other activated markets.
- Specialized five-plus-unit multifamily analysis.
- Commercial property analysis.
- Vacant-land analysis.
- Additional report formats.
- Deeper analytics.
- More advanced continuous market research.
- Apple sign-in.
- Email verification if later needed.

The architecture may permit future monetization but must not expose launch users to monetization behavior.

---

# 30. Acceptance Criteria for Major Pages and Features

## 30.1 Home page

- [ ] The investor natural-language search is visually dominant.
- [ ] The permanent prompt reads: “What kind of real-estate deal are you looking for?”
- [ ] Rotating examples include Section 8, beginner-friendly, multifamily occupancy, and tenant-occupied/cash-on-cash use cases.
- [ ] Explore Investor Properties and Find a Home to Buy appear directly below the search and remain prominent.
- [ ] Analyze a Specific Property is noticeable but secondary.
- [ ] Selecting it expands an address field without leaving the page.
- [ ] Address submission requires no field other than address.
- [ ] Supporting content covers how the product works, investor benefits, Section 8, home buyers, transparency, trust/disclaimers, About, and Contact.

## 30.2 Global navigation

- [ ] Desktop header remains available while scrolling.
- [ ] Logo returns to Home.
- [ ] Required left and right navigation items are present.
- [ ] Notification bell is available to signed-in users.
- [ ] Mobile provides logo, menu, search, profile, and simplified navigation.
- [ ] Tablet switches between simplified desktop and mobile behavior based on size.

## 30.3 Investor Search

- [ ] Natural-language search is the primary control.
- [ ] Every confirmed strategy quick selection is available.
- [ ] Strategy selection applies a filter immediately and permits additional natural-language detail.
- [ ] Broad requests may trigger no more than one or two optional follow-ups.
- [ ] Skip and Search Now is always visible when follow-ups appear.
- [ ] All default and advanced investor filters are present or visibly unavailable with explanation.
- [ ] Ranking follows current search, selected goals, then profile preferences.
- [ ] All manual sort options are available.
- [ ] Grid, list, map, and split views work without losing state.
- [ ] Desktop defaults to split view; mobile defaults to cards.
- [ ] Cards show required facts, save action, recommendation reasons, and Quick Numbers.
- [ ] Results outside fully supported markets display appropriate coverage/confidence messaging.

## 30.4 Home Buyers Search

- [ ] Natural-language search is primary.
- [ ] Follow-ups appear only when needed and are optional.
- [ ] All confirmed filters and sorts are available or clearly unavailable.
- [ ] Best Overall Match is the default sort.
- [ ] Current search outweighs profile preferences.
- [ ] Property opening retains Home Buyer context.

## 30.5 Property quick view

- [ ] Every displayed property is clickable.
- [ ] Quick view shows photos, core facts, status, key numbers, context score, AI summary, save, assistant, and full-analysis action.
- [ ] The correct assistant label appears for the current context.
- [ ] Closing and reopening quick view does not lose search state.

## 30.6 General full property page

- [ ] General contexts show concise Investor and Home Buyer summaries and links to both full analyses.
- [ ] Full gallery, facts, history, sources, comps, calculations, assumptions, scenarios, environmental risk, and applicable Section 8 tools are available.
- [ ] Off-market status is prominent when applicable.
- [ ] Off-market pages do not imply an active-listing purchase recommendation.
- [ ] Users can add off-market deal inputs manually.
- [ ] View Data Sources is near property facts.

## 30.7 Investor Analysis

- [ ] The top summary contains every required metric and risk/strength item.
- [ ] Desktop uses expandable sections with side navigation.
- [ ] Mobile uses expandable sections and a section selector.
- [ ] All 13 required detailed sections are present.
- [ ] Every applicable category score is shown.
- [ ] Inapplicable or unsupported categories show Not applicable, Insufficient data, or Low confidence.
- [ ] Source, assumption, and confidence information is reachable from the analysis.

## 30.8 Home Buyer Analysis

- [ ] Every required Home Buyer category score is shown.
- [ ] Monthly cost contains principal, interest, taxes, insurance, HOA, maintenance, and total.
- [ ] Upfront cost contains all required line items and total.
- [ ] Mortgage estimate considers the confirmed inputs.
- [ ] Credit-score range and lender quote are optional.
- [ ] Conventional, FHA, and VA comparisons appear when applicable.
- [ ] Affordability has a visible Skip action.
- [ ] Pricing status, fair-value range, differences, comps, and confidence are shown.
- [ ] Negotiation analysis includes level, reasons, offer range, possible credits, term ideas, and agent questions.
- [ ] Estimate and legal-disclaimer language is visible.

## 30.9 Comparable Sales Engine

- [ ] Comparable selection considers every confirmed factor.
- [ ] The user can see why each comparable was chosen.
- [ ] Required sale, distance, similarity, value, range, and confidence fields are shown.
- [ ] Advanced users can remove and add comps and recalculate.
- [ ] Flip output appears only when applicable and includes every required metric.
- [ ] Recalculation uses application code where calculations are critical.

## 30.10 Editable assumptions and scenarios

- [ ] Analyses load with automatic assumptions.
- [ ] Edit Assumptions exposes every required field.
- [ ] User can preview, apply temporarily, cancel, or save a named scenario.
- [ ] Dependent calculations and scores recalculate consistently.
- [ ] User-entered values are labeled as such.
- [ ] Saved scenarios can be compared side by side.
- [ ] Guests can use temporary assumptions but must authenticate to save.

## 30.11 Ask About This Deal

- [ ] Appears only on investor/general property contexts.
- [ ] Has access to the active property’s required facts and analysis context.
- [ ] Cannot access or mix another property’s context.
- [ ] Appears near the top, through a floating control, and in quick view.
- [ ] Assumption changes update structured calculations.
- [ ] The assistant offers to save changed assumptions as a scenario.
- [ ] Signed-in chat saves by property; guest chat ends with the tab.
- [ ] Users can delete saved conversations.

## 30.12 Ask About This Home

- [ ] Appears on Home Buyer property pages.
- [ ] Focuses on the confirmed Home Buyer topics.
- [ ] Uses the active property only.
- [ ] Signed-in users can save named Home Buyer scenarios.
- [ ] Guest scenarios remain temporary.

## 30.13 Section 8 entry and status

- [ ] The four confirmed status labels are supported.
- [ ] Description-only claims are unverified unless additional evidence exists.
- [ ] Confirmed/reported involvement shows View Section 8 Analysis.
- [ ] Eligible nonparticipating investment properties show Analyze as Section 8.
- [ ] Hypothetical analysis is clearly labeled and includes no approval, inspection, tenant, rent, or HAP guarantees.
- [ ] Section 8 entry is absent from Home Buyer-only context.

## 30.14 Section 8 full analysis

- [ ] Summary panel shows all required returns, scores, risks, and opportunities.
- [ ] Current, HUD benchmark, and market rent scenarios display side by side.
- [ ] Payment standard and rent-reasonableness range display separately when available.
- [ ] Every amount uses an approved data-status label.
- [ ] Missing current rent is Not available and is not substituted with a benchmark.
- [ ] Tenant and housing-authority portions display only when available.
- [ ] Utility allowance is never guessed.
- [ ] Rent-increase calculations update all required metrics.
- [ ] All required Section 8 financial fields and formulas are supported.
- [ ] Risk analysis includes every confirmed category.
- [ ] Property-specific inspection claims require evidence.
- [ ] Approval and Lease-Up Process is collapsible.
- [ ] HAP abatement is not predicted without evidence.
- [ ] Tenant/payment history appears only with reliable, non-identifying data.
- [ ] Scores include reasoning, assumptions, confidence, and ranges when needed.
- [ ] Comparable-deal geography priority and similarity are shown.

## 30.15 Deal Analyzer

- [ ] Permanent top-navigation entry exists.
- [ ] One-property mode supports all confirmed property-input methods.
- [ ] One-property output contains all confirmed analysis elements.
- [ ] Multi-property mode provides a structured workspace.
- [ ] Automatic comparison brief identifies every required category and uncertainty.
- [ ] All confirmed goal controls are available, including Custom goal.
- [ ] Comparison table supports all applicable confirmed metrics.
- [ ] Separate category rankings are displayed.
- [ ] Comparison AI supports recalculation and risk/verification questions.

## 30.16 My Deals

- [ ] Save to My Deals appears on every required surface.
- [ ] Signed-in saving is immediate.
- [ ] Guests are prompted to authenticate and active work transfers afterward.
- [ ] Saved-property display can show every confirmed field.
- [ ] Users can create folders and assign properties optionally.
- [ ] Every confirmed progress stage is available.
- [ ] Notes remain private.
- [ ] Tasks can be added, edited, completed, and deleted in a collapsible checklist.
- [ ] Notification history is accessible.
- [ ] Price/status/score changes and update dates are shown when available.

## 30.17 Notifications

- [ ] Notification bell appears in top navigation.
- [ ] Full history is available in My Deals.
- [ ] Price changes, listing-status changes, and major score changes are enabled by default.
- [ ] Users can configure globally and per property.
- [ ] Launch notifications are in-app only.

## 30.18 Manual entry and uploads

- [ ] Basic manual form contains every required minimum field.
- [ ] Add More Details exposes every confirmed optional category.
- [ ] PDF, image/screenshot, and spreadsheet uploads are accepted within configured limits.
- [ ] Pre-upload personal-information warning appears.
- [ ] Extraction prefills values and labels uncertainty Needs review.
- [ ] Analysis cannot begin until extracted values are confirmed.
- [ ] Save to deal and Delete document options appear after extraction.
- [ ] Confirmed values may remain after document deletion.
- [ ] Redaction assistance covers every confirmed sensitive-data type and is not presented as guaranteed.

## 30.19 Sharing and reports

- [ ] Signed-in users can create a private read-only link.
- [ ] Optional password and expiration work.
- [ ] Owner can disable the link.
- [ ] Shared viewers cannot edit.
- [ ] Notes/tasks are excluded by default.
- [ ] Documents are excluded unless explicitly included.
- [ ] Generic social preview exposes none of the prohibited data.
- [ ] A standard analysis report can be downloaded.

## 30.20 Help, Contact, and issue reporting

- [ ] Help AI explains product usage and terminology but not property-specific analysis.
- [ ] Help link and unobtrusive global chat control are present.
- [ ] Help AI can prefill Contact with an unresolved summary.
- [ ] Contact uses the confirmed request-type dropdown.
- [ ] Public emails appear only for business, partnerships, and media.
- [ ] Every analysis has Report an Issue.
- [ ] Issue reports attach all confirmed analysis context.
- [ ] Guests can submit with optional email and appear as Guest User to admin.
- [ ] Signed-in users can receive in-app issue updates.

## 30.21 Data source aggregation and refresh

- [ ] Majority rule selects matching values when two of three sources agree.
- [ ] Source priority is Realtor.com, Zillow, Redfin when all conflict.
- [ ] Every candidate source value is preserved internally.
- [ ] View Data Sources explains selection, conflicts, status, and update time.
- [ ] Active listings refresh twice daily.
- [ ] Off-market properties refresh weekly.
- [ ] Signed-in users receive three manual refreshes daily by default.
- [ ] Admin can change the limit.
- [ ] Refresh updates facts before dependent analysis.
- [ ] One-provider outage is silent when another provider supplies the data.
- [ ] Stored data age displays when used.

## 30.22 Low confidence and missing information

- [ ] Missing property facts are never invented.
- [ ] Approved missing/uncertainty labels are used consistently.
- [ ] Important low-confidence scores display a likely range.
- [ ] Warning explains uncertain inputs, cause, sources, effect, and independent verification.
- [ ] Conservative analysis proceeds by default unless market configuration says otherwise.

## 30.23 Accounts and privacy

- [ ] Email/password and Google sign-in work.
- [ ] No email verification is required.
- [ ] Profile setup is optional.
- [ ] No preferences defaults to Best Balanced Deal.
- [ ] Guest state follows the tab-session rules.
- [ ] Exact temporary financial values are not saved without deliberate choice.
- [ ] Download My Data contains every confirmed category in suitable formats.
- [ ] Account deletion removes active personal data and invalidates private links.
- [ ] Backup-remnant language is displayed accurately.

## 30.24 Admin dashboard

- [ ] Owner can access every confirmed module.
- [ ] Prepared roles exist in the permission model.
- [ ] Market statuses match the confirmed list.
- [ ] Market expansion follows all nine required steps.
- [ ] Sample-analysis count is selectable and defaults to 10.
- [ ] Suggested assumptions display value, range, sources, reliability, date, geography, confidence, and actions.
- [ ] CMS edits all confirmed content categories without code.
- [ ] CMS supports preview, version history, and restore.
- [ ] Ordinary content editing cannot change formulas, scoring, APIs, or security.
- [ ] Admin login uses email/password and SMS code.
- [ ] Sensitive actions require recent reauthentication.
- [ ] Activity log contains all required fields and excludes verification codes.
- [ ] Restore workflow previews risk, creates safety backup, prefers record recovery, and requires approval.

## 30.25 Accessibility and responsive behavior

- [ ] Desktop contains the richest required layouts.
- [ ] Mobile supports search, viewing, analysis, saving, assistants, and account access.
- [ ] Tablet follows the confirmed breakpoint behavior.
- [ ] Required features are not removed on mobile.
- [ ] Keyboard, screen-reader, contrast, errors, alt text, and reduced-motion support are implemented.
- [ ] Maps/charts have nonvisual alternatives.
- [ ] Dynamic progress and errors are announced accessibly.

## 30.26 SEO and privacy previews

- [ ] Launch pages are publicly reachable but noindexed.
- [ ] Private/auth/admin/share pages remain excluded from indexing.
- [ ] Private previews reveal no address, photo, scores, results, or identity.
- [ ] Public pages use polished DealFactor previews.

## 30.27 Performance and reliability

- [ ] Basic/stored pages load promptly under expected launch usage.
- [ ] Long analysis shows truthful staged progress.
- [ ] No fake percentage is displayed.
- [ ] Cancellation is available where practical.
- [ ] Accuracy is not reduced solely to speed analysis.
- [ ] Provider failures and retries do not create duplicate or contradictory records.

## 30.28 Analytics

- [ ] Privacy-focused first-party analytics tracks confirmed product metrics.
- [ ] Private query wording is not recorded.
- [ ] Uploaded content is not recorded.
- [ ] Personal financial data is not recorded.
- [ ] Private AI conversations are not recorded.
- [ ] Passwords and sensitive account data are not recorded.

## 30.29 Legal

- [ ] Every required legal page exists.
- [ ] Account creation and first advanced analysis capture required acceptance.
- [ ] Contextual notices appear near every confirmed estimate category.
- [ ] No-guarantee language covers every confirmed item.
- [ ] Fair Housing and accessibility notices are present.
- [ ] Final text has been legally reviewed.

## 30.30 Deployment and backups

- [ ] Next.js/TypeScript frontend is in GitHub from the beginning.
- [ ] Supabase provides the confirmed backend services.
- [ ] Hosting is configured on Vercel or an approved compatible platform.
- [ ] Production secrets are server-side environment variables.
- [ ] Custom domain uses HTTPS and canonical redirects.
- [ ] Active/off-market refresh schedules run as configured.
- [ ] Weekly restorable backups exist.
- [ ] File backups exist when database backups exclude file contents.
- [ ] Production launch noindex configuration is verified after domain setup.

## 30.31 Automated test acceptance

Automated coverage must include:

- [ ] Mortgage calculations.
- [ ] NOI.
- [ ] Cash flow.
- [ ] Cap rate.
- [ ] Cash-on-cash return.
- [ ] Section 8 scenarios.
- [ ] Source-conflict rules.
- [ ] Assumption updates.
- [ ] Saved scenarios.
- [ ] Sign-up.
- [ ] My Deals.
- [ ] Uploads.
- [ ] Sharing.
- [ ] Major workflows.

The owner will conduct broader real-world testing. More extensive security, provider-failure, device, and high-traffic testing may be expanded later, but launch-critical security and data-integrity testing cannot be omitted.

---

# 31. Unanswered Questions and Decisions Still Required

## 31.1 Brand and public identity

- Final DealFactor logo.
- Final domain purchase and canonical domain.
- Final founder information for later About Us update.

## 31.2 Property data and licensing

- Final API/provider access method for Realtor.com.
- Final API/provider access method for Zillow.
- Final API/provider access method for Redfin.
- Final HUD/HUD User access method.
- Exact local housing-authority sources for Detroit.
- Verified rights to retrieve, display, cache, store, combine, analyze with AI, show photos/agent data, and link to each provider.
- Provider rate limits, freshness guarantees, and cost.
- Final behavior if a named provider cannot be licensed.

## 31.3 Scoring and market assumptions

- Final investor scoring formulas.
- Final Home Buyer scoring formulas.
- Final Section 8 scoring formulas.
- Final category weights and advanced-weighting ranges.
- Definition of a “major deal-score change” for notifications.
- Final Detroit vacancy, insurance, management, maintenance, appreciation, leasing, renovation, neighborhood-risk, and Section 8 assumptions.
- Thresholds for low, medium, and high risk.
- Thresholds for low-confidence score ranges.
- Definition of “beginner-friendly.”
- Definition of “balanced deal.”
- Default conservative assumptions outside supported markets.

## 31.4 Financial and mortgage data

- Source and refresh cadence for current mortgage-rate estimates.
- Exact assumptions for closing costs, maintenance, insurance, taxes, vacancy, and management when unavailable.
- How cash-on-cash return should behave when down payment is zero or total cash invested differs materially from down payment.
- Whether Total Acquisition Cost includes closing and renovation costs in every context or only specified contexts.
- Final treatment of owner-paid utilities and reserves in NOI versus cash flow outside the confirmed Section 8 formula set.

## 31.5 Search and ranking

- Exact AI parsing and fallback behavior for ambiguous searches.
- Exact ranking model and tie-breaking rules.
- Whether search results can include off-market properties by default.
- Maximum results per request and pagination/infinite-scroll behavior.
- Which strategy views are specialized at launch beyond Section 8.

## 31.6 Property and analysis presentation

- Final score scale design and colors.
- Exact definition of the likely score range.
- Final chart types.
- Maximum number of comparables shown by default.
- Whether general property pages default to Investor or combined summary when opened from My Deals.
- Final standard downloadable report layout.

## 31.7 Document handling

- Maximum file size.
- Maximum pages/sheets/images per upload.
- Malware-scanning or file-isolation approach.
- Final OCR/extraction providers or libraries.
- Document retention default if the user leaves before making a retention choice.
- Redaction review workflow and whether the original file is preserved during redaction.
- Exact supported spreadsheet file types.

## 31.8 Accounts, privacy, and support

- Password reset and account-recovery UX details for ordinary users.
- Data-export generation time and expiration.
- Backup retention period.
- Analytics retention period.
- Support response expectations and issue statuses.
- Contact-form spam prevention.
- Whether users may permanently delete an individual analysis version while keeping the property saved.

## 31.9 Administrator security

- SMS provider.
- Primary and backup phone enrollment flow.
- Session timeout and recent-reauthentication window.
- Which owner actions require dual confirmation beyond reauthentication.
- Whether support/content roles will be enabled in the first deployment or only represented in code.

## 31.10 Technical and operational

- Final hosting provider: Vercel or approved alternative.
- Supabase plan and region.
- Anthropic model selection for each assistant.
- AI token/cost limits and per-user abuse limits.
- Geoapify plan and usage limits.
- Error-monitoring and analytics vendors.
- Final operating-cost review.
- Launch domain email configuration.
- Production backup provider behavior for stored files.
- Exact criteria for adding a separate background-job platform.

## 31.11 Legal

- Final legal review of every required page and contextual notice.
- Fair Housing review for safety, school, neighborhood, commute, and ranking features.
- State-specific privacy obligations based on launch users and location.
- Terms governing user-uploaded listing and investment documents.
- Provider attribution requirements.

## 31.12 Launch content and data

- Sample property data for development.
- Final landing-page copy.
- Final About copy.
- Initial FAQs/help articles.
- Initial announcements and supported-market notices.
- Final public business, partnership, and media contact information.

---

# Appendix A. Financial Calculation Requirements

Critical calculations must be implemented and tested in application code, not improvised by AI.

## A.1 Section 8 financial fields

Each Section 8 analysis must support:

- Address.
- Occupancy status.
- Square footage.
- Bedrooms.
- Bathrooms.
- Total acquisition cost.
- Down payment.
- Loan amount.
- Interest rate.
- Loan term.
- Monthly mortgage payment.
- Monthly rent.
- Annual rent.
- Monthly property taxes.
- Monthly insurance.
- Monthly property management.
- Monthly maintenance reserve.
- Monthly HOA.
- Monthly vacancy reserve.
- Monthly utilities.
- Total monthly operating expenses.
- Total annual operating expenses.
- Monthly NOI.
- Annual NOI.
- Monthly cash flow.
- Annual cash flow.
- Price per square foot.
- Cap rate.
- Cash-on-cash return.

## A.2 Confirmed formulas

### Loan Amount

```text
Loan Amount = Total Acquisition Cost - Down Payment
```

### Monthly Mortgage Payment

```text
Monthly Mortgage Payment = PMT(Interest Rate / 12, Loan Term * 12, -Loan Amount)
```

Implementation must define interest rate as a decimal and loan term in years.

### Annual Rental Income

```text
Annual Rental Income = Monthly Rental Income * 12
```

### Total Monthly Operating Expenses

```text
Total Monthly Operating Expenses =
  Property Taxes
  + Insurance
  + Property Management
  + Maintenance Reserve
  + HOA
  + Vacancy Reserve
  + Utilities
```

### Total Annual Operating Expenses

```text
Total Annual Operating Expenses = Total Monthly Operating Expenses * 12
```

### Monthly NOI

```text
Monthly NOI = Monthly Rental Income - Total Monthly Operating Expenses
```

### Annual NOI

```text
Annual NOI = Annual Rental Income - Total Annual Operating Expenses
```

### Monthly Cash Flow

```text
Monthly Cash Flow = Monthly NOI - Monthly Mortgage Payment
```

### Annual Cash Flow

```text
Annual Cash Flow = Monthly Cash Flow * 12
```

### Price per Square Foot

```text
Price per Square Foot = Total Acquisition Cost / Square Footage
```

### Cap Rate

```text
Cap Rate = Annual NOI / Total Acquisition Cost
```

### Cash-on-Cash Return

```text
Cash-on-Cash Return = Annual Cash Flow / Down Payment Amount
```

## A.3 Calculation safeguards

### Recommendations

- Return a defined unavailable/error state for division by zero rather than Infinity or fabricated output.
- Store monetary calculations using decimal-safe techniques.
- Define rounding at presentation level, not during intermediate calculations.
- Unit-test positive, negative, zero, and missing-value cases.
- Keep formula versions in analysis records.
- Distinguish operating expenses from debt service in every UI.

---

# Appendix B. Required Status Vocabulary

Use these exact or equivalent approved labels consistently:

## B.1 Data confidence and provenance

- Confirmed.
- Estimated.
- Benchmark.
- Unverified.
- Description-extracted.
- User input.
- Not available.
- Insufficient data.
- Low confidence.
- Not applicable.
- Needs review.
- Unverified listing claim.

## B.2 Section 8 status

- Section 8 Mentioned — Unverified.
- Section 8 Tenant Reported.
- Active Section 8 Tenant — Confirmed.
- HAP Contract Confirmed.

## B.3 Deal progress

- Saved.
- Researching.
- Contacted.
- Under Contract.
- Purchased.
- Rejected.

## B.4 Market coverage

- Not configured.
- In development.
- Internal testing.
- Limited beta.
- Fully supported.
- Temporarily paused.

## B.5 Pricing and negotiation

- Underpriced.
- Fairly Priced.
- Overpriced.
- Low negotiation potential.
- Medium negotiation potential.
- High negotiation potential.

---

# Appendix C. Recommended Implementation Sequence

This sequence is a recommendation, not a change to launch scope.

1. Establish repository, environments, Supabase, authentication, base design system, and authorization.
2. Define provider-agnostic property data contracts and sample-data adapters.
3. Implement property facts, provenance, conflict rules, property page shell, and refresh versioning.
4. Implement tested financial engine and assumption/scenario engine.
5. Implement investor search/results and Investor Analysis.
6. Implement comparable sales and Deal Analyzer one-property mode.
7. Implement Section 8 data, formulas, scores, risk, and process analysis.
8. Implement Home Buyer search, cost engine, and analysis.
9. Implement AI orchestration with isolated assistants and structured calculation tools.
10. Implement My Deals, folders, stages, notes, tasks, chats, and notifications.
11. Implement multi-property comparison.
12. Implement manual entry, uploads, extraction review, and retention choice.
13. Implement sharing, reports, Contact, Help, About, legal, and issue reporting.
14. Implement admin dashboard, market activation, CMS, monitoring, backups, and audit logs.
15. Complete responsive/accessibility polish, automated testing, cost review, licensing review, legal review, domain setup, and production launch checks.

---

# Appendix D. Definition of Done

A feature is complete only when:

- Confirmed functional requirements are implemented.
- Loading, empty, error, and success states are implemented.
- Desktop and mobile behavior is usable.
- Keyboard and screen-reader behavior is tested.
- Authorization and privacy rules are enforced server side.
- Analytics omit prohibited content.
- Relevant automated tests pass.
- Source provenance and confidence are visible where applicable.
- No missing property fact is invented.
- User-facing language avoids guarantees.
- Documentation and environment configuration are updated.

