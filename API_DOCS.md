Refresh Countries

POST /countries/refresh
Fetches data from external APIs and stores/updates countries in the database.

Success (200)

{
  "message": "Countries refreshed successfully!",
  "total_updated": 250,
  "last_refreshed_at": "2025-10-28T18:00:00Z"
}

External API failure (503)
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from [API name]"
}

Get All Countries

GET /countries?region=Africa&currency=NGN&sort=gdp_desc

Supports:

Filtering by region or currency

Sorting by GDP (ascending or descending)

Get Country by Name
GET /countries/:name
Returns data for a specific country.

{ "error": "Country not found" }

Delete a Country
DELETE /countries/:name

Deletes a country record by name.
404 Example

{ "error": "Country not found" }

Get Status

GET /status

Returns:
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-28T18:00:00Z"
}

Get Summary Image

GET /countries/image

Returns an image showing:

Total countries

Last updated date

Top 5 countries by estimated GDP

If no image exists:
{ "error": "Summary image not found" }
