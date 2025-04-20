import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
import axios from 'axios';
import { FaStar, FaEdit, FaTrash, FaUserCircle } from 'react-icons/fa'; // Import icons

// Helper function to get transport type name
const getTransportTypeName = (type) => {
  switch (String(type)) { // Convert type to string for reliable matching
    case '0': return 'Tram';
    case '1': return 'Subway';
    case '2': return 'Rail';
    case '3': return 'Bus';
    case '4': return 'Ferry';
    case '5': return 'Cable Car';
    case '6': return 'Gondola';
    case '7': return 'Funicular';
    default: return 'Other';
  }
};

// Star rating component
const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'} />
      ))}
      <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
    </div>
  );
};

function TransportDetail() {
    const { routeId } = useParams();
    const [transportDetails, setTransportDetails] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [detailsError, setDetailsError] = useState(null);
    const [reviewsError, setReviewsError] = useState(null);
    const [user, setUser] = useState(null);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');

    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');

    // Fetch logged-in user info from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                console.log("User loaded from localStorage:", parsedUser); // Debug log
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
                localStorage.removeItem('user'); // Clear invalid item
            }
        } else {
             console.log("No user found in localStorage."); // Debug log
        }
    }, []);

    // Fetch transport details and reviews
    useEffect(() => {
        const fetchDetailsAndReviews = async () => {
            setIsLoadingDetails(true);
            setIsLoadingReviews(true);
            setDetailsError(null);
            setReviewsError(null);
            setReviews([]);
            try {
                // Fetch transport details
                const detailsRes = await axios.get(`${process.env.REACT_APP_API_URI}transport/transports/route/${routeId}`);
                setTransportDetails(detailsRes.data.length > 0 ? detailsRes.data[0] : null);
            } catch (err) {
                console.error("Error fetching transport details:", err);
                setDetailsError(err.response?.data?.message || 'Failed to load transport details.');
            } finally {
                setIsLoadingDetails(false);
            }
            // Fetch reviews
            try {
                const reviewsRes = await axios.get(`${process.env.REACT_APP_API_URI}review/route/${routeId}/reviews`);
                if (Array.isArray(reviewsRes.data)) {
                    setReviews(reviewsRes.data);
                } else {
                    console.warn("API did not return an array for reviews:", reviewsRes.data);
                    setReviewsError('Received invalid data format for reviews.');
                }
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setReviewsError(err.response?.data?.message || 'Failed to load reviews.');
                setReviews([]);
            } finally {
                setIsLoadingReviews(false);
            }
        };

        fetchDetailsAndReviews();
    }, [routeId]);

    // Handle review submission
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setReviewError("You must be logged in to submit a review.");
            return;
        }
        if (!comment.trim()) {
            setReviewError("Comment cannot be empty.");
            return;
        }

        setIsSubmitting(true);
        setReviewError('');

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URI}review/route/${routeId}/review`,
                { rating, comment },
                { withCredentials: true } // Send cookies if using session-based auth
            );
            // Add user name to the new review before adding to state
            const newReview = { ...response.data, userId: { _id: user.id, name: user.name } };
            setReviews([newReview, ...reviews]); // Add new review to the top
            setRating(5); // Reset form
            setComment('');
        } catch (err) {
            console.error("Error submitting review:", err);
            setReviewError(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle starting the edit process
    const handleEditClick = (review) => {
        setEditingReviewId(review._id);
        setEditRating(review.rating);
        setEditComment(review.comment);
        setUpdateError(''); // Clear previous update errors
    };

    // Handle cancelling the edit
    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setEditRating(0);
        setEditComment('');
        setUpdateError('');
    };

    // Handle review update
    const handleReviewUpdate = async (e) => {
        e.preventDefault();
        if (!editComment.trim()) {
            setUpdateError("Comment cannot be empty.");
            return;
        }

        setIsUpdating(true);
        setUpdateError('');

        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URI}review/review/${editingReviewId}`,
                { rating: editRating, comment: editComment },
                { withCredentials: true }
            );
            // Ensure the updated review data includes the user name if needed
            const updatedReview = { ...response.data, userId: { _id: user.id, name: user.name } };
            setReviews(reviews.map(r => r._id === editingReviewId ? updatedReview : r));
            handleCancelEdit(); // Exit editing mode
        } catch (err) {
            console.error("Error updating review:", err);
            setUpdateError(err.response?.data?.message || 'Failed to update review.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle review deletion
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) {
            return;
        }

        try {
            await axios.delete(`${process.env.REACT_APP_API_URI}review/review/${reviewId}`, { withCredentials: true });
            setReviews(reviews.filter(review => review._id !== reviewId)); // Remove review from state
        } catch (err) {
            console.error("Error deleting review:", err);
            alert(err.response?.data?.message || 'Failed to delete review.'); // Show error to user
        }
    };

    const routeShortName = transportDetails?.route_short_name || routeId;
    const transportTypeName = transportDetails ? getTransportTypeName(transportDetails.route_type) : 'N/A';

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Display Transport Details Section */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                {isLoadingDetails && <div className="text-center text-gray-500 py-4">Loading transport details...</div>}
                {detailsError && <div className="text-center text-red-600 bg-red-100 p-4 rounded-md mb-4">Error loading details: {detailsError}</div>}
                {!isLoadingDetails && !detailsError && !transportDetails && (
                    <div className="text-center text-gray-500 py-4">Transport route details not found for {routeId}.</div>
                )}
                {transportDetails && (
                    <>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Route: {routeShortName}</h1>
                        <p className="text-lg text-gray-600 mb-1">
                            <strong>Full Name:</strong> {transportDetails.route_long_name || 'N/A'}
                        </p>
                        <p className="text-lg text-gray-600">
                            <strong>Type:</strong> {transportTypeName}
                        </p>
                        {/* Add more details as needed */}
                    </>
                )}
            </div>

            {/* Review Section */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Reviews</h2>

                {/* Add Review Form */}
                {user ? (
                    <form onSubmit={handleReviewSubmit} className="mb-8 p-4 border border-gray-200 rounded-md bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-700 mb-3">Leave a Review for {routeShortName}</h3>
                        {reviewError && <p className="text-red-500 text-sm mb-3">{reviewError}</p>}
                        <div className="mb-3">
                            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                            <select
                                id="rating"
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                                rows="4"
                                placeholder="Share your experience..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                ) : (
                    <p className="mb-6 text-center text-gray-600 bg-gray-100 p-4 rounded-md">
                        Please <Link to="/login" className="text-indigo-600 hover:underline font-medium">log in</Link> to leave a review.
                    </p>
                )}

                {/* Display Reviews Section */}
                {isLoadingReviews && <div className="text-center text-gray-500 py-4">Loading reviews...</div>}
                {reviewsError && <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">Error loading reviews: {reviewsError}</div>}
                {!isLoadingReviews && !reviewsError && (
                    reviews.length > 0 ? (
                        <ul className="space-y-6">
                            {reviews.map(review => (
                                <li key={review._id} className="border border-gray-200 rounded-md p-4">
                                    {editingReviewId === review._id ? (
                                        // Edit Form
                                        <form onSubmit={handleReviewUpdate}>
                                            {updateError && <p className="text-red-500 text-sm mb-3">{updateError}</p>}
                                            <div className="flex items-center mb-2">
                                                <FaUserCircle className="h-5 w-5 text-gray-500 mr-2" />
                                                <span className="font-semibold text-gray-700">{review.userId?.name || 'Unknown User'}</span>
                                                <span className="text-gray-500 text-sm ml-2">- Editing</span>
                                            </div>
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                                <select
                                                    value={editRating}
                                                    onChange={(e) => setEditRating(Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                >
                                                    {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>)}
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                                                <textarea
                                                    value={editComment}
                                                    onChange={(e) => setEditComment(e.target.value)}
                                                    required
                                                    rows="3"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="submit"
                                                    disabled={isUpdating}
                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out disabled:opacity-50"
                                                >
                                                    {isUpdating ? 'Updating...' : 'Update Review'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        // Display Review
                                        <>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <FaUserCircle className="h-6 w-6 text-gray-500 mr-2" />
                                                    <div>
                                                        <span className="font-semibold text-gray-800">{review.userId?.name || 'Unknown User'}</span>
                                                        <span className="block text-xs text-gray-500">Reviewed on {new Date(review.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <StarRating rating={review.rating} />
                                            </div>
                                            <p className="text-gray-700 mb-3">{review.comment}</p>
                                            {user && user.id && review.userId?._id && user.id === review.userId._id.toString() && (
                                                <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleEditClick(review)}
                                                        className="flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                                                        title="Edit Review"
                                                    >
                                                        <FaEdit className="mr-1" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReview(review._id)}
                                                        className="flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                                                        title="Delete Review"
                                                    >
                                                        <FaTrash className="mr-1" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-4">No reviews yet for this transport route.</p>
                    )
                )}
            </div>
        </div>
    );
}

export default TransportDetail;
