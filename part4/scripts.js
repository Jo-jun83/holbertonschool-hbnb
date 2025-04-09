document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMsg = document.getElementById('error-message');
  const submitBtn = document.getElementById('submit-btn');
  const reviewForm = document.getElementById('review-form');
  const priceFilter = document.getElementById('price-filter');
  const logoutBtn = document.getElementById('logout-btn');

  let allPlaces = [];
  const token = localStorage.getItem('authToken');
  const placeId = getPlaceIdFromURL();

  function getPlaceIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        showError("Veuillez remplir tous les champs.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Connexion...";

      try {
        const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error("Échec de la connexion. Vérifiez vos identifiants.");

        const data = await response.json();
        localStorage.setItem('authToken', data.access_token);
        window.location.href = 'index.html';
      } catch (error) {
        showError(error.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Login";
      }
    });
  }

  function showError(message) {
    if (errorMsg) {
      errorMsg.textContent = message;
      errorMsg.style.display = 'block';
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.href = 'index.html';
    });
  }

  function checkAuthentication() {
    const loginBtn = document.getElementById('login-button');
    const reviewBtn = document.getElementById('review-form');
    const loginReview = document.querySelector('.login-review');

    if (token) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (reviewBtn) reviewBtn.style.display = 'flex';
      if (loginReview) loginReview.style.display = 'none';

      if (placeId) {
        displayReviewPlaceName(placeId, token);
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'flex';
      if (reviewBtn) reviewBtn.style.display = 'none';
      if (loginReview) loginReview.style.display = 'flex';
    }
  }

  async function fetchPlaces() {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/v1/places/", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) throw new Error(`Erreur lors du chargement des lieux (${response.status})`);

      allPlaces = await response.json();
      displayPlaces(allPlaces);
    } catch (error) {
      console.error("Erreur:", error.message);
    }
  }

  function displayPlaces(places) {
    const placesList = document.getElementById("all-places");
    if (!placesList) return;

    placesList.innerHTML = "";

    places.forEach(place => {
      const placeElement = document.createElement("section");
      placeElement.classList.add("places-list");

      placeElement.innerHTML = `
        <h3>${place.title}</h3>
        <p>Price per night: ${place.price}$</p>
        <p>Description: ${place.description}</p>
        <a href="./place.html?id=${place.id}">
          <button>Voir les détails</button>
        </a>
      `;
      placesList.appendChild(placeElement);
    });
  }

  if (priceFilter) {
    const priceOptions = [10, 50, 100, 'All'];
    priceOptions.forEach(price => {
      const option = document.createElement('option');
      option.value = price;
      option.textContent = price;
      priceFilter.appendChild(option);
    });

    priceFilter.addEventListener('change', (event) => {
      const selected = event.target.value;
      if (selected === "All") {
        displayPlaces(allPlaces);
      } else {
        const maxPrice = parseFloat(selected);
        const filtered = allPlaces.filter(place => place.price <= maxPrice);
        displayPlaces(filtered);
      }
    });
  }

  async function fetchPlaceDetails() {
    if (!placeId) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Impossible de récupérer les détails du lieu.");

      const place = await response.json();
      displayPlaceDetails(place);
      fetchReviews(placeId, token);
    } catch (error) {
      console.error("Erreur:", error.message);
    }
  }

  function displayPlaceDetails(place) {
    const placeContainer = document.getElementById("place-details");
    if (!placeContainer) return;

    placeContainer.innerHTML = `
      <h3>${place.title}</h3>
      <p><strong>Host:</strong> ${place.owner ? place.owner.first_name : "N/A"}</p>
      <p>Price per night: ${place.price}$</p>
      <p>Description: ${place.description}</p>
      <p><strong>Amenities:</strong> ${place.amenities?.map(a => a.name).join(', ') || "Aucune"}</p>
    `;
  }

  function displayReviewPlaceName(placeId, token) {
    fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    .then(response => response.json())
    .then(place => {
      const placeName = place.title; 
      const placeNameElement = document.getElementById('place-name');
      if (placeNameElement) {
        placeNameElement.textContent = placeName;
      }
    })
    .catch(error => console.error('Erreur lors de l\'obtention du nom du lieu :', error));
  }

  const decodeJWT = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const userId = decodeJWT?.sub;

  if (reviewForm && token && placeId) {
    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      console.log("Soumission du formulaire review");

      const reviewText = document.getElementById('review').value.trim();
      const rating = document.getElementById('rating').value;

      if (!reviewText || !rating) {
        alert("Veuillez remplir tous les champs.");
        return;
      }

      try {
        const response = await submitReview(token, placeId, reviewText, rating, userId);
        await handleResponse(response, reviewForm);
        fetchReviews(placeId, token);
      } catch (error) {
        alert("Une erreur est survenue lors de la soumission : " + error.message);
      }
    });
  }

  async function submitReview(token, placeId, reviewText, rating, userId) {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/v1/reviews/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                text: reviewText,
                rating: parseInt(rating),
                user_id: userId.id,
                place_id: placeId
            })
        });

        await handleResponse(response);

    } catch (error) {
        console.error("Erreur lors de l'ajout de l'avis :", error.message);
        alert(`Une erreur est survenue lors de l'ajout de l'avis : ${error.message}`);
    }
}

async function handleResponse(response) {
  console.log('Réponse du serveur dans handleResponse:', response);

  try {
      if (response.ok) {
          let result;
          try {
              result = await response.json();
              console.log('Réponse du serveur (result):', result);
              alert('Votre avis a bien été envoyé !');
          } catch (error) {
              console.error('Erreur de parsing JSON:', error);
              alert('La réponse du serveur n\'est pas un JSON valide.');
          }
      } else {
          const data = await response.json();
          console.error('Erreur de soumission:', data);
          alert('Erreur lors de la soumission de l’avis.');
      }
  } catch (error) {
      console.error("Erreur de traitement de la réponse JSON:", error.message);
  }
}

  async function fetchReviews(placeId, token) {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/v1/reviews/places/${placeId}/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des avis.");
      }

      const reviews = await response.json();
      displayReviews(reviews);
    } catch (error) {
      console.error("Erreur lors du chargement des avis :", error.message);
    }
  }

  function displayReviews(reviews) {
    const reviewsContainer = document.getElementById("reviews");
    if (!reviewsContainer) return;

    reviewsContainer.innerHTML = "";

    if (reviews.length === 0) {
      reviewsContainer.innerHTML = "<p>Aucun avis pour ce lieu.</p>";
      return;
    }

    reviews.forEach(review => {
      const reviewElement = document.createElement("div");
      reviewElement.classList.add("review");

      const nameElement = document.createElement("h3");
      nameElement.textContent = review.user?.first_name || "Utilisateur";

      const textElement = document.createElement("p");
      textElement.textContent = review.text;

      const starsElement = document.createElement("div");
      const rating = parseInt(review.rating);
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.textContent = i <= rating ? "★" : "☆";
        starsElement.appendChild(star);
      }

      reviewElement.appendChild(nameElement);
      reviewElement.appendChild(textElement);
      reviewElement.appendChild(starsElement);
      reviewsContainer.appendChild(reviewElement);
    });
  }

  fetchPlaceDetails();
  fetchPlaces();
  checkAuthentication();
});
