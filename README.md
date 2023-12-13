Backend_Mongo: Crypto Exchange Rate Converter
---------------------------------------------

### Overview

This document outlines a simple Node.js server that functions as a RESTful API for converting cryptocurrency prices based on historical data. It utilizes Express for handling HTTP requests, Mongoose for MongoDB interaction, and Node-cron for automating tasks.

The server retrieves a list of cryptocurrencies from the CoinGecko API and stores them in a MongoDB database. Users can then request price conversions between two specific dates through API endpoints.

### Setup

#### Environment Variables

1.  Create a file named `.env` in the project root directory.
2.  Add the following lines, replacing `<your-mongodb-password>` with your actual password:

```
PORT=3010
MONGODB_PASSWORD=<your-mongodb-password>

```

#### Installation

1.  Clone the repository:

```
git clone https://github.com/your-username/crypto-exchange-rate-converter.git

```

1.  Install dependencies:

```
cd crypto-exchange-rate-converter
npm install

```

### Running the Server

Start the server with the following command:

```
npm start

```

### API Endpoints

#### 1\. Convert Price

-   Endpoint: `/convertPrice`
-   Method: POST
-   Request Body:

JSON

```
{
  "fromCurrency": "Bitcoin",
  "toCurrency": "Ethereum",
  "date": "2023-01-01"
}

```

Use code with caution. [Learn more](https://bard.google.com/faq#coding)

content_copy

-   Response:

JSON

```
{
  "price": 1234.56
}

```

Use code with caution. [Learn more](https://bard.google.com/faq#coding)

content_copy

#### 2\. Scheduled Job

The server runs a cron job every hour to fetch and store the latest list of cryptocurrencies.

### Error Handling

A global error handler middleware catches unhandled errors and returns a 500 Internal Server Error response.

### Dependencies

-   Express: Web application framework
-   Mongoose: MongoDB object modeling
-   Node-cron: Task scheduler for cron jobs
-   Axios: HTTP client for making API requests

### Contributing

Feel free to contribute by opening issues or submitting pull requests. Follow the Contribution Guidelines for more details.
