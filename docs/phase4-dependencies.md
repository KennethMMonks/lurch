
We have designed the work on the Lurch Deductive Engine (LDE) to progress in
phases.  The idea is that each phase ends with a completed whole that can be
tested in that state, and that provides more features than the previous
state did.  By the time the final phase is complete, the LDE will be a
robust and useful product.

# LDE Design Phase 4: Dependencies

## Content

This document is not yet complete.  Its content will eventually specify:

 * Support dependencies as read-only first-few-children of the document.
 * They need to be validated only to be sure they don't redeclare one
   another's stuff.
 * Note that every structure already has an .exports() method, so we just
   need to implement that structure for the root of the LDE Document, and
   that will be what a document exports when it is used as a dependency.

## Goal

Rule definitions can be stored in a master document on which others depend,
and many later documents can all use the same central rule set.

## Status

This phase has not yet been implemented.  Once it has been implemented, its
contents will be documented in the API Documentation available from the
navigation menu at the top of this site.
