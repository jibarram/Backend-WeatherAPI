# Weather API
Sample solution for the [Weather API challenge](https://roadmap.sh/projects/weather-api-wrapper-service) from [roadmap.sh](https://roadmap.sh).

## Features

- Fetch weather data for any city using the Visual Crossing API.
- Caching of API responses in Redis to reduce redundant requests.
- Rate limiting to prevent API abuse.
- Support for dynamic unit group selection: `metric`, `us`, or `uk`.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- [Redis](https://redis.io/) installed and running locally or remotely
- A Visual Crossing API key (you can get one at [Visual Crossing API](https://www.visualcrossing.com/weather-api))

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jibarram/Backend-WeatherAPI.git
   cd weather-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the project and add the following:
   ```env
   VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key
   REDIS_URL=redis://localhost:6379
   PORT=3000
   ```

   Replace `your_visual_crossing_api_key` with your Visual Crossing API key.

4. Start the Redis server (if running locally):
   ```bash
   redis-server
   ```

5. Start the application:
   ```bash
   npm start
   ```

## Usage

### API Endpoint

The API exposes the following endpoint:

```
GET /weather/:city
```

#### Query Parameters

- `unitGroup` (optional): Specify the unit system for the response. Acceptable values:
  - `metric`: Celsius and kilometers
  - `us`: Fahrenheit and miles (default)
  - `uk`: Celsius and miles

#### Example Request

```
GET http://localhost:3000/weather/London?unitGroup=metric
```

#### Example Response

```json
{
  "city": "London, England, United Kingdom",
  "temperature": "15°C",
  "description": "Partly cloudy",
  "humidity": "70%"
}
```