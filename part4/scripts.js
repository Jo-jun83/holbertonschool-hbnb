document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
  fetchPlaces();

  const loginForm = document.getElementById('login-form');
  const errorMsg = document.getElementById('error-message');
  const submitBtn = document.getElementById('submit-btn');

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

        if (!response.ok) {
          throw new Error("Échec de la connexion. Vérifiez vos identifiants.");
        }

        const data = await response.json();

        // Stockage dans localStorage uniquement
        localStorage.setItem('authToken', data.access_token); 

        // Redirection
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

  function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    const loginBtn = document.getElementById('login-button');

    if (loginBtn) {
      loginBtn.style.display = token ? 'none' : 'flex';
    }

    if (token) {
      fetchPlaces(token);
    }
  }

  let allPlaces = [];

  async function fetchPlaces(token) {
    const url = "http://127.0.0.1:5000/api/v1/places/";
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du chargement des lieux (${response.status})`);
      }

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
  const priceFilter = document.getElementById('price-filter');
  const priceOptions = [50, 75, 100, 150, 'All'];

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
    
});
