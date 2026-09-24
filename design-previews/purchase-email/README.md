# Purchase thank-you email — approval draft

This is a separate design preview. The live `BookingConfirmation.tsx` template and email sender remain unchanged. No messages have been sent. All booking data in the preview is fictional.

Run from the project root:

```powershell
node design-previews/purchase-email/serve.cjs 3055
```

Open http://localhost:3055 to switch between desktop and mobile views, or between a standard reservation and a booking with extras and hotel pickup. The server listens only on the local computer and exposes only the draft and its three artwork assets.

## Design

An engraved rainforest invitation in forest green, ivory, and muted lime. Live text introduces the confirmed reservation; the receipt presents the booking reference, date, time, guests, payment, and directions. Optional extras, pickup details, and the guest's note have their own area. Real venue photography leads into arrival information and direct contact links.

The draft uses React Email tables and inline styles with a small mobile media query. Header artwork is decorative: the text remains readable against the solid green fallback when background images are unavailable. No JavaScript or web-only animation is included in the email HTML. Browser preview controls live outside the email.

The generated HTML files can be opened with the adjacent assets folder. Final email delivery will require absolute HTTPS asset URLs and inbox checks in Gmail, Outlook, and Apple Mail after design approval. Browser checks are not a substitute for inbox rendering checks.

## Assets and generation

- `assets/botanical-canopy.jpg`: custom botanical artwork generated with the built-in image-generation tool, then compressed for email delivery. The optimized artwork is included here so the preview is portable.
- `assets/rainforest-dining.jpg`: optimized copy of the project's actual venue photograph, `public/images/new/threemonkeys057.jpg`.
- `assets/logo.png`: the existing Three Monkeys logo, `public/images/3M logo.png`.

Generation prompt:

> Use case: illustration-story. Asset type: bespoke background illustration for a premium Three Monkeys Restaurant Phuket purchase thank-you email. Create one exquisite wide 3:2 botanical engraving, 1536 by 1024 if possible. Deep almost-black rainforest green paper (#14271e), muted chartreuse and antique-gold fine linework (#b1b94c). Elegantly layered tropical palms, banana leaves, tiny orchid blossoms and delicate fern fronds growing inward only from the far left edge, far right edge and lower corners. Intricate hand-engraved veins, subtle tactile paper grain and very few tiny soft warm light specks like distant restaurant lanterns. Natural, luxurious, editorial, quiet and refined; credible botanical illustration rather than fantasy. The middle 65 percent of the composition must remain very dark and almost empty so white live email text can later sit there; top center also empty. Leaves slightly brighter near the corners and dissolve into the dark center. Make all four background edges an even deep #14271e to blend seamlessly with the email. No text, no lettering, no logos, no checkmarks, no borders, no buildings, no people. This is an ornamental backdrop, not a complete email mockup.

Email image guidance: [React Email image documentation](https://react.email/docs/components/image). Layout primitives: [React Email section documentation](https://react.email/docs/components/section).

## Approval boundary

This preview is saved in the repository as an unapproved draft. Only after the user approves: integrate the selected draft into the live confirmation template, publish its static assets, preserve all real booking fields, and check inbox rendering. Sending a test email needs an explicitly authorized recipient. Saving this draft does not activate it in the live email sender.
