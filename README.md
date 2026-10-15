# Property Finder — Responsive React JSX Frontend

This is a redesigned, responsive React + Vite frontend with a warm red/coral and light-orange theme. The hero uses a CSS illustration rather than a background photograph. React components and pages use `.jsx` files.

## Run
1. Extract the ZIP.
2. Open a terminal in `property_frontend_v2`.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL shown by Vite (usually `http://localhost:5173`).

## Backend integration
The frontend calls the API gateway at `http://localhost:9090` by default. Copy `.env.example` to `.env` to set `VITE_API_BASE_URL` if required.

Seller accounts now have a **Seller Profile** page in the navigation for saving phone/Instagram/Facebook details once. Each property form has per-listing visibility checkboxes; login email is enabled by default. The backend must implement the endpoints and schema described in `BACKEND_CONTACT_SELLER_API.md` before these features can persist or return data.\n\nConnected routes include `/api/auth/register`, `/api/auth/verify-otp`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/properties`, `/api/properties/owner/{email}`, `/api/properties/{id}`, and `/api/properties/uploads/presign`.

Registration sends `name`, `email`, `password`, and `role` (`CUSTOMER` or `SELLER`). Property posting sends `property` as a JSON multipart part and `file` as an image multipart part. If the user skips photo selection, the file part is omitted; backend must support optional multipart photo uploads. The authenticated user name is displayed in the navigation bar and account/owner details area when available.

## Important backend limitations
- Backend search currently supports city only; purpose and property type are filtered in the browser after loading results.
- Home/search responses should include a fresh `imageUrl` (presigned GET URL) for each property. The frontend falls back to a bundled default image if an image URL is absent or fails. S3 upload also needs correct bucket CORS and backend AWS credentials. The property-service DTO currently does not return ownerName; the frontend can show the signed-in user name, but a different listing owner name requires the backend response to include it.
- Seller profile persistence and per-listing contact visibility require the backend work listed in `BACKEND_CONTACT_SELLER_API.md`.
- Run the backend services and allow the Vite origin in gateway CORS for credentialed requests.
- This package has not been tested against a running backend in this environment.


## Fixes in this corrected frontend package

- The Post Property form no longer preselects Dehradun. City/location and purpose are controlled fields, and the exact selected values are sent in the multipart `property` JSON part.
- City/location supports Dehradun, Rishikesh, Haridwar, Haldwani, Roorkee, and a custom city.
- Property cards enrich the limited home/search response with the corresponding property record so saved purpose, property type, address, and status can display rather than defaulting to “Buy” or “Property”.
- Contact Seller now stores the API response in `sellerContact` (the old code called an undefined `setSellerEmail`) and supports email, phone, Instagram, or Facebook individually. It no longer fails just because the seller chose not to share email.
- Photo remains optional; selected files larger than 5 MB are rejected before upload.

### Backend compatibility note

The supplied backend's home/search `PropertyResponse` only contains `id`, `title`, `city`, `price`, and `imageUrl`; it omits purpose, property type, address, and status. To preserve the current backend as supplied, this frontend fetches each listing's existing `GET /api/properties/{id}` endpoint to fill those fields. For production, the recommended fix is to return those display fields in a safe public DTO and ensure the single-property endpoint never exposes `ownerEmail` or private visibility flags to public clients.

### Run

1. Extract this ZIP.
2. Open a terminal in `property_frontend_v2`.
3. Run `npm install`.
4. Copy `.env.example` to `.env` if needed and set `VITE_API_BASE_URL=http://localhost:9090`.
5. Run `npm run dev`.

The live backend was not running in this environment, so API integration against a running gateway was not performed.


## Latest home/location/readability updates
- Home defaults to showing all available listings (Buy and Rent); Buy/Rent tabs still filter when selected.
- Home listing fetch tries `/api/properties` if `/api/properties/home` fails or returns an empty list.
- Post Property now starts with India, offers state/UT and dependent district selectors, plus a full address field. The saved `city` value includes district, state and country for compatibility with existing backend DTOs.
- Property cards show full location and a posting-date label when the backend returns `createdAt`, `postedAt`, `createdDate` or `postedDate`. If the backend does not return a creation timestamp, the card clearly says the posting date is unavailable; the backend must persist/expose a creation timestamp to show accurate dates across refreshes.
- Supporting text was enlarged and darkened for readability.
