# Strapi content model

Strapi is the editorial system for public website content. The checked-in schemas provide the
seven core collection types. Homepage and About page structures are documented here so editors
and developers can agree on them before implementing reusable components.

## Modeling conventions

- Use `uid` fields generated from `title` for routable records.
- Enable Draft & Publish for all public editorial content.
- Use Strapi media fields, descriptive alternative text, and appropriately sized source images.
- Use integer `order` fields for curated lists; sort explicitly in frontend queries.
- Keep SEO as a reusable component in a future refinement: `metaTitle` (70 characters),
  `metaDescription` (170 characters), keywords, canonical URL, and social image.
- Treat JSON fields in the initial scaffold as structured contracts. Replace repeated structures
  with Strapi components before nontechnical editors begin large-scale entry.
- Public permissions should normally be read-only and limited to published records.

## Collection types

### Blog

Purpose: articles, news, and EdTech insights.

Fields: `title`, generated `slug`, `excerpt`, rich `content`, `coverImage`, `category`, `author`,
`tags`, `featured`, and `seo`. Draft & Publish controls visibility. Recommended filters are
category, tag, featured, and publication date.

Schema:
`strapi-cms/src/api/blog/content-types/blog/schema.json`

### CaseStudy

Purpose: explain client challenges, the CITIS solution, and outcomes.

Fields: `title`, `slug`, `client`, `industry`, rich `challenge`, rich `solution`, `results`,
`coverImage`, `gallery`, `tags`, `featured`, and `seo`. Results should be concise, measurable
statements where possible.

Schema:
`strapi-cms/src/api/case-study/content-types/case-study/schema.json`

### Testimonial

Purpose: approved customer or learner quotes.

Fields: `name`, `role`, `company`, `content`, `avatar`, `rating`, `featured`, and `order`. Record
proof of consent outside public fields and establish a review/expiry process.

Schema:
`strapi-cms/src/api/testimonial/content-types/testimonial/schema.json`

### ClientLogo

Purpose: curated customer and partner marks.

Fields: `name`, `logo`, `website`, required `altText`, `featured`, and `order`. The initial schema
uses the API name `client`, resulting in `/api/clients`, to match the existing frontend service.
SVG uploads should be sanitized or converted to a safe raster format.

Schema:
`strapi-cms/src/api/client/content-types/client/schema.json`

### Career

Purpose: publish openings; applicant records remain in the Express API and must not be stored in
public Strapi records.

Fields: `title`, `slug`, `department`, `location`, `employmentType`, rich `description`,
`requirements`, `responsibilities`, `benefits`, private `salary`, `applicationUrl`, and
`closingDate`. Unpublish closed roles or retain them with a clear closed state added later.

Schema:
`strapi-cms/src/api/career/content-types/career/schema.json`

### Product

Purpose: describe products, platforms, and digital solutions.

Fields: `title`, `slug`, `shortDescription`, rich `description`, `category`, `features`,
`benefits`, `learningOutcomes`, `curriculum`, `coverImage`, `gallery`, `featured`, `order`, and
`seo`.

Schema:
`strapi-cms/src/api/product/content-types/product/schema.json`

### AcademyCourse

Purpose: market courses offered through CITIS Academy.

Fields: `title`, `slug`, `summary`, rich `description`, `level`, `duration`, `deliveryMode`,
`learningOutcomes`, `curriculum`, `prerequisites`, `coverImage`, `enrollmentUrl`, `featured`,
`order`, and `seo`. Enrollment and learner progress should live in an operational learning system,
not Strapi.

Schema:
`strapi-cms/src/api/academy-course/content-types/academy-course/schema.json`

## Planned single and component types

These structures are intentionally documented but not generated as schemas in the initial
scaffold. Create them through Strapi's Content-Type Builder after validating the page design, then
commit the generated schemas and component definitions.

### HomepageSection

A reusable component or dynamic-zone component:

- `internalName` for editor identification
- `eyebrow`, `heading`, and rich `body`
- `layout` enumeration such as hero, split, cards, stats, logos, testimonials, or CTA
- `theme` and optional background media
- primary and secondary link labels/URLs
- optional related products, courses, testimonials, or client logos
- `order` and visibility controls

Prefer a dynamic zone on the Homepage single type over one unrestricted generic JSON field.

### AboutPage

A single type containing:

- page title, summary, and hero media
- rich company story
- mission, vision, and values
- leadership or team entries
- statistics/milestones
- a dynamic zone of `HomepageSection`-style blocks
- SEO metadata

### Media

Strapi's Upload plugin supplies the media library; do not create a second generic Media content
type. For business metadata not supported by the built-in file model, create a dedicated asset
collection relating to one media file with fields such as rights owner, license, attribution,
expiry date, focal point, and usage restrictions.

## Access policy

| Persona | Recommended access |
| --- | --- |
| Public | `find` and `findOne` only on explicitly public collection types |
| Frontend server | Read-only API token when public permissions are insufficient |
| Editor | Create/update drafts and upload approved media |
| Publisher | Editor rights plus publish/unpublish |
| Strapi administrator | Settings, users, roles, tokens, and model changes |

Strapi admin roles are separate from Express roles. Never place a privileged token in
`NEXT_PUBLIC_STRAPI_TOKEN`; browser-visible variables can be extracted by any visitor.
