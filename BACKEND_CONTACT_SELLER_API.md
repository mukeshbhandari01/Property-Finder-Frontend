# Backend changes required: Seller Profile + per-listing contact visibility

This frontend expects the following endpoints. Implement these in the existing Spring Boot property-service and keep the existing authentication cookie/security rules.

## 1. Seller profile table

Create a new table/entity `seller_profile` with one row per authenticated seller:
- `id` (primary key)
- `seller_email` (unique, not null; use authenticated principal, not request-supplied email)
- `phone` (nullable)
- `instagram_url` (nullable)
- `facebook_url` (nullable)

Recommended: a unique constraint on normalized `seller_email`. Do not store the seller login email in this profile table; it comes from the authenticated account.

### GET `/api/properties/seller-profile`
Return the signed-in seller's saved profile:
```json
{
  "phone": "+919876543210",
  "instagramUrl": "https://instagram.com/example",
  "facebookUrl": "https://facebook.com/example"
}
```
If no profile exists yet, return HTTP 200 with empty/null fields (or create an empty profile row).

### PUT `/api/properties/seller-profile`
Request body:
```json
{
  "phone": "+919876543210",
  "instagramUrl": "https://instagram.com/example",
  "facebookUrl": "https://facebook.com/example"
}
```
Use `Authentication.getName()` (or the authenticated JWT principal) to identify the seller. Never accept seller email from the request body as the identity. Validate URLs and phone length. Upsert/save the row and return the saved profile. Restrict to authenticated SELLER role.

## 2. Add visibility flags to PropertyListing

Add boolean columns (default values shown):
- `show_email` — true by default
- `show_phone` — false by default
- `show_instagram` — false by default
- `show_facebook` — false by default

Add these fields to `CreatePropertyRequest`:
- `Boolean showEmail`
- `Boolean showPhone`
- `Boolean showInstagram`
- `Boolean showFacebook`

When creating a listing, set flags with safe defaults, e.g. `showEmail = request.showEmail() == null || request.showEmail()`, other flags default false. The owner identity must still come from the authenticated principal, not `request.ownerEmail()`.

Frontend posts these fields in the JSON multipart part called `property`.

## 3. Contact endpoint

Implement authenticated:
`GET /api/properties/{id}/contact`

- Load the property by ID.
- Return only the details enabled for this specific property.
- Email: if `show_email` is true, use the property's verified owner email (or lookup the authenticated user-service account for the listing owner). Do not use an arbitrary email from the request.
- Phone/Instagram/Facebook: load the listing owner's `seller_profile` row, then include each field only if its corresponding listing visibility flag is true and the profile value is nonblank.
- Do not return visibility flags or hidden fields in this response.
- Keep the property owner email out of public property search/list response DTOs.
- Decide whether this endpoint should require login; current frontend requires login before calling it, so require authentication and enforce any desired rate limiting.

Example response:
```json
{
  "email": "seller@example.com",
  "phone": "+919876543210",
  "instagramUrl": "https://instagram.com/example",
  "facebookUrl": "https://facebook.com/example"
}
```
If a field is hidden or empty, omit it (or return null). Return `{}` if no allowed contact values exist.

## 4. Property ID in public response

The frontend's details page requires the real database property ID. Ensure `PropertyResponse` includes `id` and that home/search API responses serialize it. Do not use a title/city fallback ID for contact API calls.

## 5. Image optionality

The frontend now only appends the `file` multipart part when a user selects a photo. Ensure the controller uses `@RequestPart(value = "file", required = false) MultipartFile file` and `PropertyService` skips S3 upload when `file == null || file.isEmpty()`. Save a null/empty image key when no photo is provided; the frontend uses its bundled placeholder.

## 6. Security and migration

- Use Flyway or a SQL migration to create `seller_profile` and add the four visibility columns to `property_listing`; preserve existing listing rows.
- Normalize seller email consistently if email is used as the profile lookup key.
- Do not trust a seller email submitted from the frontend for ownership/profile updates.
- Do not return hidden contact fields in any API response, including property list/search.
- The frontend expects external routes under `/api/properties/**` through the gateway.
