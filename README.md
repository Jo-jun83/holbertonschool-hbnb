# HbNb Project

## Table of Contents

- [HbNb Project - Part 3](#hbnb-project---part-3)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Database Schema](#database-schema)
    - [Main Entities:](#main-entities)
  - [API Endpoints](#api-endpoints)
    - [Users](#users)
    - [Listings](#listings)
    - [Amenities](#amenities)
    - [Reviews](#reviews)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
  - [Configuration](#configuration)
  - [Usage](#usage)
    - [Run the Application](#run-the-application)
    - [API Authentication](#api-authentication)
  - [Testing](#testing)
  - [Technologies Used](#technologies-used)
  - [Auteurs](#auteurs)

## Overview

HBnB is a full-stack web application inspired by Airbnb, allowing users to list, search, and book accommodations. The project is based on a RESTful API developed with Flask and SQLAlchemy to manage users, listings, amenities, and reviews.

## Features

- **User Management**: Registration, authentication, and profiles
- **Property Management**: Add, update, and search for listings
- **Review System**: Add and manage user reviews
- **Amenity Management**: Associate amenities with listings

## Database Schema
The application uses a relational database with the following entities:

![ER Diagram](./Diagram/mermaid-diagram-2025-03-17-181330.png)

### Main Entities:

- **User**: Manages accounts (owners and renters)
- **Listing**: Represents rental offers
- **Review**: Contains user comments
- **Amenity**: Groups services and facilities
- **Listing_Amenity**: Junction table between listings and amenities

## API Endpoints

### Users

- `GET /api/v1/users` : List all users
- `GET /api/v1/users/<user_id>` : Retrieve a user
- `POST /api/v1/users` : Create a new user
- `PUT /api/v1/users/<user_id>` : Update a user
- `DELETE /api/v1/users/<user_id>` : Delete a user

### Listings

- `GET /api/v1/places` : List all listings
- `GET /api/v1/places/<place_id>` : Get listing details
- `POST /api/v1/places` : Add a listing
- `PUT /api/v1/places/<place_id>` : Update a listing
- `DELETE /api/v1/places/<place_id>` : Delete a listing

### Amenities

- `GET /api/v1/amenities` : List all amenities
- `GET /api/v1/amenities/<amenity_id>` : Get amenity details
- `POST /api/v1/amenities` : Add an amenity (admin only)
- `PUT /api/v1/amenities/<amenity_id>` : Update an amenity (admin only)
- `DELETE /api/v1/amenities/<amenity_id>` : Delete an amenity (admin only)

### Reviews

- `GET /api/v1/reviews` : List all reviews
- `GET /api/v1/reviews/<review_id>` : Get review details
- `POST /api/v1/reviews` : Add a review
- `PUT /api/v1/reviews/<review_id>` : Update a review (only by its author)
- `DELETE /api/v1/reviews/<review_id>` : Delete a review

## Installation

### Prerequisites

- Python 3.10+
- PostgreSQL Database

### Steps

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/hbnb-clone.git
    cd hbnb-clone/part3/hbnb
    ```

2. Install dependencies:

    ```bash
    pip install -r requirements.txt
    ```

3. Set up the database:

    ```bash
    mysql -h hostname -u user database < Creation_Script.sql
    ```

## Configuration

```python
# JWT Settings
JWT_SECRET_KEY = 'your-secret-key'
JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour

# Other configurations
DEBUG = True
```

## Usage

### Run the Application

```bash
python run.py
```

The API will be available at `http://localhost:5000/api/v1/`.

### API Authentication

Some endpoints require JWT authentication.

1. Retrieve a token:

    ```bash
    curl -X POST http://localhost:5000/api/v1/auth/login \ 
        -H "Content-Type: application/json" \ 
        -d '{"email": "user@example.com", "password": "password123"}'
    ```

2. Use the token:

    ```bash
    curl -X GET http://localhost:5000/api/v1/places \ 
        -H "Authorization: Bearer your_token"
    ```

## Testing
The project includes tests to validate core functionalities:

```bash
python test.py
```

Tests cover:

- Resource creation (success and errors)
- Resource retrieval (existing and non-existing)
- Resource updating and deletion

## Technologies Used

- **Backend**: Flask, SQLAlchemy
- **API**: Flask-RestX
- **Authentication**: Flask-JWT-Extended
- **Database**: PostgreSQL
- **Testing**: unittest

## Auteurs

- [Jonas](https://github.com/Jo-jun83)
- [Luca](https://github.com/mansiluca)
- [Yassine](https://github.com/yassinejsa2ab)
