#!/usr/bin/env python3
from flask_restx import Namespace, Resource, fields
from app.services import facade

api = Namespace('reviews', description='Review operations')

# Define the review model for input validation and documentation
review_model = api.model('Review', {
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=True, description='Rating of the place (1-5)'),
    'user_id': fields.String(required=True, description='ID of the user'),
    'place_id': fields.String(required=True, description='ID of the place')
})

@api.route('/')
class ReviewList(Resource):
    @api.expect(review_model, validate=True)
    @api.response(201, 'Review successfully created')
    @api.response(400, 'Invalid input data')
    @api.response(404, 'User or Place not found')
    @api.response(500, 'Internal server error')
    def post(self):
        """Register a new review"""
        try:
            review_data = api.payload

            # Validate required fields
            required_fields = ['text', 'rating', 'user_id', 'place_id']
            for field in required_fields:
                if field not in review_data:
                    return {'error': f'Missing required field: {field}'}, 400
                if not review_data[field]:
                    return {'error': f'Field {field} cannot be empty'}, 400

            # Validate text field
            if not isinstance(review_data['text'], str):
                return {'error': 'Text must be a string'}, 400
            if len(review_data['text'].strip()) == 0:
                return {'error': 'Text cannot be empty'}, 400

            # Check if user exists
            user = facade.get_user(review_data['user_id'])
            if not user:
                return {'error': 'User not found'}, 404

            # Check if place exists
            place = facade.get_place(review_data['place_id'])
            if not place:
                return {'error': 'Place not found'}, 404

            # Validate rating range
            if not isinstance(review_data['rating'], int) or not (1 <= review_data['rating'] <= 5):
                return {'error': 'Rating must be an integer between 1 and 5'}, 400

            new_review = facade.create_review(review_data)
            return {
                'id': new_review.id,
                'text': new_review.text,
                'rating': new_review.rating,
                'user_id': new_review.user_id,
                'place_id': new_review.place_id,
            }, 201

        except (ValueError, KeyError) as e:
            return {"error": str(e)}, 400
        except Exception as e:
            return {"error": str(e)}, 500

    @api.response(200, 'List of reviews retrieved successfully')
    def get(self):
        """Retrieve a list of all reviews"""
        reviews = facade.get_all_reviews()

        return [
            {
                'id': review.id,
                'text': review.text,
                'rating': review.rating,
                'user_id': review.user_id,
                'place_id': review.place_id
            }
            for review in reviews
        ], 200

@api.route('/<review_id>')
class ReviewResource(Resource):
    @api.response(200, 'Review details retrieved successfully')
    @api.response(404, 'Review not found')
    def get(self, review_id):
        """Get review details by ID"""
        review = facade.get_review(review_id)
        if not review:
            return {"error": "Review not found"}, 404

        # Get user info
        user = facade.get_user(review.user_id)
        user_data = None
        if user:
            user_data = {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name
            }

        # Get place info
        place = facade.get_place(review.place_id)
        place_data = None
        if place:
            place_data = {
                'id': place.id,
                'title': place.title
            }

        return {
            'id': review.id,
            'text': review.text,
            'rating': review.rating,
            'user': user_data,
            'place': place_data,
            'user_id': review.user_id,
            'place_id': review.place_id
        }, 200

    @api.expect(review_model, validate=True)
    @api.response(200, 'Review updated successfully')
    @api.response(404, 'Review not found')
    @api.response(400, 'Invalid input data')
    def put(self, review_id):
        """Update review details"""
        try:
            # Get existing review
            review = facade.get_review(review_id)
            if not review:
                return {"error": "Review not found"}, 404

            update_data = api.payload

            # Validate rating if provided
            if 'rating' in update_data and not (isinstance(update_data['rating'], int) and 1 <= update_data['rating'] <= 5):
                return {'error': 'Rating must be an integer between 1 and 5'}, 400

            # Validate text if provided
            if 'text' in update_data:
                if not isinstance(update_data['text'], str) or len(update_data['text'].strip()) == 0:
                    return {'error': 'Text must be a non-empty string'}, 400

            # Check if place_id is being updated and if the new place exists
            if 'place_id' in update_data and update_data['place_id'] != review.place_id:
                place = facade.get_place(update_data['place_id'])
                if not place:
                    return {'error': 'Place not found'}, 404

            # Check if user_id is being updated and if the new user exists
            if 'user_id' in update_data and update_data['user_id'] != review.user_id:
                user = facade.get_user(update_data['user_id'])
                if not user:
                    return {'error': 'User not found'}, 404

            # Update the review
            facade.update_review(review_id, update_data)
            updated_review = facade.get_review(review_id)

            return {
                'id': updated_review.id,
                'text': updated_review.text,
                'rating': updated_review.rating,
                'user_id': updated_review.user_id,
                'place_id': updated_review.place_id
            }, 200

        except ValueError as e:
            return {'error': str(e)}, 400
        except Exception as e:
            return {'error': 'Internal server error', 'details': str(e)}, 500

    @api.response(204, 'Review deleted successfully')
    @api.response(404, 'Review not found')
    def delete(self, review_id):
        """Delete a review"""
        review = facade.get_review(review_id)
        if not review:
            return {"error": "Review not found"}, 404
        facade.delete_review(review_id)
        return {"message" : "Review deleted successfully"}, 204

@api.route('/places/<place_id>/reviews')
class PlaceReviewList(Resource):
    @api.response(200, 'List of reviews for the place retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """Get all reviews for a specific place"""
        # Check if place exists
        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404

        reviews = facade.get_reviews_by_place(place_id)

        # Include user info for each review
        result = []
        for review in reviews:
            user = facade.get_user(review.user_id)
            user_info = None
            if user:
                user_info = {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }

            result.append({
                'id': review.id,
                'text': review.text,
                'rating': review.rating,
                'user_id': review.user_id,
                'user': user_info
            })

        return result, 200

@api.route('/users/<user_id>/reviews')
class UserReviewList(Resource):
    @api.response(200, 'List of reviews by the user retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get all reviews by a specific user"""
        # Implement this later - functionality to get reviews by user
        # Check if user exists
        user = facade.get_user(user_id)
        if not user:
            return {"error": "User not found"}, 404

        reviews = facade.get_reviews_by_user(user_id)

        # Include place info for each review
        result = []
        for review in reviews:
            place = facade.get_place(review.place_id)
            place_info = None
            if place:
                place_info = {
                    'id': place.id,
                    'title': place.title
                }

            result.append({
                'id': review.id,
                'text': review.text,
                'rating': review.rating,
                'place_id': review.place_id,
                'place': place_info
            })

        return result, 200



