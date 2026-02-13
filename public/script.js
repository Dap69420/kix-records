const header = document.querySelector(".site-header");
const popupButtons = document.querySelectorAll("[data-popup]");
const demoForm = document.querySelector(".demo-form");
const formStatus = document.querySelector(".form-status");
const modal = document.getElementById("popup-modal");
const modalTitle = document.getElementById("popup-title");
const modalText = document.getElementById("popup-text");
const modalAction = document.getElementById("popup-action");
const modalCloseButtons = document.querySelectorAll(".modal-close");

const popupContent = {
  listen: {
    title: "Listen Now",
    text: "Our label's music is available on all major streaming platforms. Follow on Spotify to stay updated on new releases.",
    actionText: "Go to Spotify",
    actionUrl: "https://open.spotify.com",
  },
  catalog: {
    title: "View Catalog",
    text: "The first releases are in motion. Join the Discord to get notified as soon as the label drops hit.",
    actionText: "Join Discord",
    actionUrl: "https://discord.gg/raPDZy4qnE",
  },
};

const handleScroll = () => {
  const elevated = window.scrollY > 30;
  header.classList.toggle("scrolled", elevated);
};

const openModal = (popupType) => {
  const content = popupContent[popupType];
  if (!content) return;

  modalTitle.textContent = content.title;
  modalText.textContent = content.text;
  modalAction.textContent = content.actionText;
  modalAction.onclick = () => {
    window.open(content.actionUrl, "_blank", "noreferrer");
  };

  modal.classList.add("open");
};

const closeModal = () => {
  modal.classList.remove("open");
};

const handlePopupClick = (event) => {
  const popupType = event.currentTarget.getAttribute("data-popup");
  openModal(popupType);
};

window.addEventListener("scroll", handleScroll);
popupButtons.forEach((button) => {
  button.addEventListener("click", handlePopupClick);
});

modalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

if (demoForm) {
  demoForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = demoForm.querySelector("button[type=submit]");
    const formData = new FormData(demoForm);
    const payload = Object.fromEntries(formData.entries());

    if (formStatus) {
      formStatus.textContent = "Sending demo...";
    }

    submitButton.disabled = true;

    try {
      const response = await fetch(demoForm.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      demoForm.reset();
      if (formStatus) {
        formStatus.textContent = "Demo received. We will be in touch soon.";
      }
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = "Something went wrong. Please try again.";
      }
    } finally {
      submitButton.disabled = false;
    }
  });
}

/* Release Embeds */
const releaseItems = document.querySelectorAll(".release-item");
const spotifyModal = document.getElementById("spotify-modal");
const spotifyEmbedWrapper = document.getElementById("spotify-embed-wrapper");
const spotifyTrackName = document.getElementById("spotify-track-name");
const spotifyTrackArtist = document.getElementById("spotify-track-artist");
const spotifyTrackDate = document.getElementById("spotify-track-date");
const spotifyOpenLink = document.getElementById("spotify-open-link");

const createSpotifyEmbed = (albumId) => {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("data-testid", "embed-iframe");
  iframe.style.borderRadius = "12px";
  iframe.src = `https://open.spotify.com/embed/album/${albumId}?utm_source=generator`;
  iframe.width = "100%";
  iframe.height = "352";
  iframe.frameBorder = "0";
  iframe.allowFullscreen = true;
  iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
  iframe.loading = "lazy";
  
  return iframe;
};

const openSpotifyModal = (albumId, trackName, artistName, releaseDate) => {
  if (!albumId) return;
  
  // Set track info
  spotifyTrackName.textContent = trackName || "Untitled";
  spotifyTrackArtist.textContent = artistName || "Unknown Artist";
  spotifyTrackDate.textContent = releaseDate ? `Released: ${releaseDate}` : "";
  
  // Set Spotify link
  spotifyOpenLink.href = `https://open.spotify.com/album/${albumId}`;
  
  // Load embed
  spotifyEmbedWrapper.innerHTML = "";
  const iframe = createSpotifyEmbed(albumId);
  spotifyEmbedWrapper.appendChild(iframe);
  
  spotifyModal.classList.add("open");
};

const closeSpotifyModal = () => {
  spotifyModal.classList.remove("open");
  setTimeout(() => {
    spotifyEmbedWrapper.innerHTML = "";
  }, 300);
};

releaseItems.forEach((item) => {
  const playBtn = item.querySelector(".release-play-btn");
  const albumId = item.getAttribute("data-album-id");
  const trackName = item.getAttribute("data-track-name");
  const artistName = item.getAttribute("data-artist-name");
  const releaseDate = item.getAttribute("data-release-date");

  if (playBtn && !playBtn.disabled) {
    playBtn.addEventListener("click", () => {
      openSpotifyModal(albumId, trackName, artistName, releaseDate);
    });
  }
});

if (spotifyModal) {
  spotifyModal.addEventListener("click", (event) => {
    if (event.target === spotifyModal) {
      closeSpotifyModal();
    }
  });

  const spotifyModalClose = spotifyModal.querySelector(".modal-close");
  if (spotifyModalClose) {
    spotifyModalClose.addEventListener("click", closeSpotifyModal);
  }
}

/* Updates Carousel */
const updatesCarousel = document.querySelector(".updates-carousel");
if (updatesCarousel) {
  const wrapper = updatesCarousel.querySelector(".updates-track-wrapper");
  const track = updatesCarousel.querySelector(".updates-track");
  const prevBtn = updatesCarousel.querySelector(".carousel-prev");
  const nextBtn = updatesCarousel.querySelector(".carousel-next");
  const cards = Array.from(track.querySelectorAll(".update-card"));
  
  let currentIndex = 1; 
  
  const updateCarousel = () => {
    const cardWidth = cards[currentIndex].offsetWidth;
    const gap = 24;
    const wrapperWidth = wrapper.offsetWidth;
    
    
    let offset = 0;
    for (let i = 0; i < currentIndex; i++) {
      offset += cards[i].offsetWidth + gap;
    }
    
    
    const centerOffset = (wrapperWidth - cardWidth) / 2;
    const finalOffset = offset - centerOffset;
    
    track.style.transform = `translateX(-${Math.max(0, finalOffset)}px)`;
    
    
    cards.forEach((card, index) => {
      if (index === currentIndex) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });
    
    // Update button states
    if (currentIndex <= 1) {
      prevBtn.style.display = "none";
    } else {
      prevBtn.style.display = "flex";
    }
    
    nextBtn.disabled = currentIndex === cards.length - 1;
  };
  
  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });
  
  nextBtn.addEventListener("click", () => {
    if (currentIndex < cards.length - 1) {
      currentIndex++;
      updateCarousel();
    }
  });
  
  // Initialize
  updateCarousel();
}


/* Form */
const form = document.querySelector(".multi-step-form");
console.log("Form found:", form);
if (form) {
  const steps = form.querySelectorAll(".form-step");
  const formStatus = form.querySelector(".form-status");
  const prevBtn = form.querySelector(".form-prev-btn");
  const nextBtn = form.querySelector(".form-next-btn");
  const submitBtn = form.querySelector("#submit-btn");
  const stepDots = form.querySelectorAll(".step-dot");
  const artistsList = form.querySelector(".artists-list");
  const addArtistBtn = form.querySelector(".add-artist-btn");
  
  console.log("Form elements - prevBtn:", prevBtn, "nextBtn:", nextBtn, "submitBtn:", submitBtn);
  console.log("Steps count:", steps.length);
  
  let currentStep = 1;
  let artistCount = 1;
  
  const formData = {
    legalName: "",
    releaseTitle: "",
    artists: [{ name: "", spotify: "" }],
    demoLink: "",
    email: "",
    message: "",
  };

  const updateStepIndicator = () => {
    stepDots.forEach((dot, index) => {
      const stepNum = index + 1;
      dot.classList.remove("active", "completed");
      
      if (stepNum === currentStep) {
        dot.classList.add("active");
      } else if (stepNum < currentStep) {
        dot.classList.add("completed");
      }
    });
  };

  const showStep = (stepNum) => {
    steps.forEach((step) => {
      step.classList.remove("active");
    });
    
    document.querySelector(`[data-step="${stepNum}"]`).classList.add("active");
    
    // Update button visibility
    prevBtn.style.display = stepNum === 1 ? "none" : "flex";
    nextBtn.style.display = stepNum === 5 ? "none" : "block";
    submitBtn.style.display = stepNum === 5 ? "block" : "none";
    
    updateStepIndicator();
  };

  const getRequiredFieldsForStep = (stepNum) => {
    if (stepNum === 1) {
      return [
        { selector: "#legal-name", name: "Legal name" },
        { selector: "#release-title", name: "Release title" },
      ];
    } else if (stepNum === 2) {
      
      return [];
    } else if (stepNum === 3) {
      return [
        { selector: "#demo-link", name: "Demo link" },
        { selector: "#email", name: "Email address" },
      ];
    } else if (stepNum === 4) {
      return [];
    } else if (stepNum === 5) {
      return [
        { selector: "#rights", name: "Rights confirmation", isCheckbox: true },
      ];
    }
    return [];
  };

  const validateStep = (stepNum) => {
    console.log("=== validateStep START - Step:", stepNum, "===");
    const requiredFields = getRequiredFieldsForStep(stepNum);
    let isValid = true;
    let errorMsg = "";
    
    console.log("Required fields for this step:", requiredFields);

    
    if (stepNum === 2) {
      const artistEntries = form.querySelectorAll(".artist-entry");
      console.log("Artist entries found:", artistEntries.length);
      if (artistEntries.length === 0) {
        isValid = false;
        errorMsg = "Please add at least one artist";
      } else {
        for (const entry of artistEntries) {
          const nameInput = entry.querySelector('input[type="text"]');
          console.log("Artist name input:", nameInput, "value:", nameInput?.value);
          if (!nameInput || !nameInput.value.trim()) {
            isValid = false;
            errorMsg = "All artist names are required";
            break;
          }
        }
      }
      
      if (formStatus) {
        if (isValid) {
          formStatus.textContent = "";
          formStatus.classList.remove("error");
        } else {
          formStatus.textContent = errorMsg;
          formStatus.classList.add("error");
        }
      }
      console.log("Step 2 validation result:", isValid, "Error:", errorMsg);
      console.log("=== validateStep END ===");
      return isValid;
    }

    
    if (stepNum === 4) {
      console.log("Step 4 - no validation needed");
      console.log("=== validateStep END ===");
      return true;
    }

    // Validation for other steps
    console.log("Validating", requiredFields.length, "fields");
    for (const field of requiredFields) {
      console.log("Checking field:", field);
      const element = form.querySelector(field.selector);
      console.log("Element found:", element);
      
      if (!element) {
        console.warn("Field not found:", field.selector);
        continue;
      }

      const value = field.isCheckbox ? element.checked : element.value.trim();
      console.log("Field value:", value);
      
      if (!value) {
        isValid = false;
        errorMsg = `Please fill in: ${field.name}`;
        console.log("Field is empty:", field.name);
        break;
      }

      // Additional validation for URLs
      if (field.name === "Demo link") {
        if (!isValidUrl(value)) {
          isValid = false;
          errorMsg = "Please enter a valid demo link URL";
          console.log("Invalid URL for demo link");
          break;
        }
      }

      // Additional validation for email
      if (field.name === "Email address") {
        if (!isValidEmail(value)) {
          isValid = false;
          errorMsg = "Please enter a valid email address";
          console.log("Invalid email");
          break;
        }
      }
    }

    if (formStatus) {
      if (isValid) {
        formStatus.textContent = "";
        formStatus.classList.remove("error");
      } else {
        formStatus.textContent = errorMsg;
        formStatus.classList.add("error");
      }
    }
    
    console.log("Final result for step", stepNum, "- Valid:", isValid, "Error:", errorMsg);
    console.log("=== validateStep END ===");
    return isValid;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const saveStepData = (stepNum) => {
    if (stepNum === 1) {
      formData.legalName = form.querySelector("#legal-name").value;
      formData.releaseTitle = form.querySelector("#release-title").value;
    } else if (stepNum === 2) {
      formData.artists = [];
      const artistEntries = form.querySelectorAll(".artist-entry");
      artistEntries.forEach((entry) => {
        const nameInput = entry.querySelector('input[type="text"]');
        const spotifyInput = entry.querySelector('input[type="url"]');
        if (nameInput && spotifyInput) {
          formData.artists.push({
            name: nameInput.value,
            spotify: spotifyInput.value,
          });
        }
      });
    } else if (stepNum === 3) {
      formData.demoLink = form.querySelector("#demo-link").value;
      formData.email = form.querySelector("#email").value;
      formData.message = form.querySelector("#message").value;
    }
  };

  const populateReview = () => {
    // Legal name & release title
    document.querySelector("#review-legal-name").textContent = formData.legalName;
    document.querySelector("#review-release-title").textContent = formData.releaseTitle;

    // Artists
    const reviewArtists = document.querySelector("#review-artists");
    reviewArtists.innerHTML = "";
    formData.artists.forEach((artist) => {
      const artistDiv = document.createElement("div");
      artistDiv.style.marginBottom = "12px";
      if (artist.spotify) {
        artistDiv.innerHTML = `
          <p><strong>${artist.name}</strong><br />
          <a href="${artist.spotify}" target="_blank" style="color: #1DB954; font-size: 12px;">Open on Spotify →</a></p>
        `;
      } else {
        artistDiv.innerHTML = `<p><strong>${artist.name}</strong></p>`;
      }
      reviewArtists.appendChild(artistDiv);
    });

    // Demo & contact
    const demoLinkSpan = document.querySelector("#review-demo-link");
    demoLinkSpan.innerHTML = `<a href="${formData.demoLink}" target="_blank" style="color: var(--solar);">${formData.demoLink}</a>`;
    document.querySelector("#review-email").textContent = formData.email;

    if (formData.message) {
      document.querySelector("#review-message-section").style.display = "block";
      document.querySelector("#review-message").textContent = formData.message;
    } else {
      document.querySelector("#review-message-section").style.display = "none";
    }
  };

  const addArtistField = () => {
    const newEntry = document.createElement("div");
    newEntry.className = "artist-entry";
    newEntry.innerHTML = `
      <button type="button" class="remove-artist-btn" aria-label="Remove artist">×</button>
      <div class="input-group">
        <label for="artist-${artistCount}">Artist name</label>
        <input id="artist-${artistCount}" name="artists[${artistCount}][name]" type="text" placeholder="Stage name" />
      </div>
      <div class="input-group">
        <label for="artist-spotify-${artistCount}">Spotify artist link (optional)</label>
        <input id="artist-spotify-${artistCount}" name="artists[${artistCount}][spotify]" type="url" placeholder="https://open.spotify.com/artist/..." />
      </div>
    `;

    const removeBtn = newEntry.querySelector(".remove-artist-btn");
    removeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      newEntry.remove();
      artistCount--;
    });

    artistsList.appendChild(newEntry);
    artistCount++;
  };

  // Event listeners for step navigation
  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep > 1) {
      saveStepData(currentStep);
      currentStep--;
      showStep(currentStep);
    }
  });

  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Next button clicked, validating step", currentStep);
    const isValid = validateStep(currentStep);
    console.log("Validation result:", isValid);
    if (isValid) {
      saveStepData(currentStep);
      currentStep++;
      
      if (currentStep === 4) {
        populateReview();
      }
      
      showStep(currentStep);
    }
  });

  // Add artist button
  addArtistBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addArtistField();
  });

  // Form submission
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Check cooldown
    const cooldownTime = localStorage.getItem("demoCooldownTime");
    if (cooldownTime) {
      const remaining = parseInt(cooldownTime) - Date.now();
      if (remaining > 0) {
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        if (formStatus) {
          formStatus.textContent = `Please wait ${hours}h ${minutes}m before submitting again.`;
          formStatus.classList.add("error");
        }
        return;
      }
    }

    if (!validateStep(5)) return;

    saveStepData(5);

    if (formStatus) {
      formStatus.textContent = "Sending demo...";
      formStatus.classList.remove("error");
    }

    submitBtn.disabled = true;

    // Assemble payload for the server
    const payload = {
      legalName: formData.legalName,
      releaseTitle: formData.releaseTitle,
      artists: formData.artists,
      email: formData.email,
      links: formData.demoLink,
      bio: formData.message,
    };

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      const data = await response.json();
      const ticketId = data.ticketId || "DEMO-XXXX-XXXX";

      // Set cooldown timestamp (1 hour from now)
      const cooldownTime = Date.now() + 60 * 60 * 1000;
      localStorage.setItem("demoCooldownTime", cooldownTime);

      // Show success popup
      showSuccessPopup(ticketId);

      // Reset form after popup closes
      setTimeout(() => {
        form.reset();
        currentStep = 1;
        artistCount = 1;
        formData.artists = [{ name: "", spotify: "" }];
        showStep(1);
        checkCooldown();
      }, 3000);
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = "Something went wrong. Please try again.";
        formStatus.classList.add("error");
      }
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Initialize
  showStep(1);

  // Show success popup
  const showSuccessPopup = (ticketId) => {
    const popup = document.getElementById("success-popup");
    const ticketDisplay = document.getElementById("ticket-id-display");
    const copyBtn = document.getElementById("copy-ticket-btn");
    const closeBtn = document.getElementById("close-success-btn");
    const cooldownMsg = document.getElementById("cooldown-message");

    ticketDisplay.textContent = ticketId;
    popup.classList.add("show");

    // Copy ticket ID
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(ticketId).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy ID";
        }, 2000);
      });
    });

    // Update cooldown message
    const updateCooldownMessage = () => {
      const cooldownTime = localStorage.getItem("demoCooldownTime");
      if (cooldownTime) {
        const now = Date.now();
        const remaining = Math.max(0, parseInt(cooldownTime) - now);
        if (remaining > 0) {
          const hours = Math.floor(remaining / (60 * 60 * 1000));
          const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
          cooldownMsg.textContent = `Next submission available in ${hours}h ${minutes}m`;
        }
      }
    };

    updateCooldownMessage();

    // Close popup
    closeBtn.addEventListener("click", () => {
      popup.classList.remove("show");
    });

    // Close on backdrop click
    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        popup.classList.remove("show");
      }
    });
  };

  // Check cooldown on page load
  let cooldownInterval;
  const checkCooldown = () => {
    // Clear any existing interval
    if (cooldownInterval) clearInterval(cooldownInterval);

    const cooldownTime = localStorage.getItem("demoCooldownTime");
    if (!cooldownTime) {
      submitBtn.disabled = false;
      if (formStatus) {
        formStatus.textContent = "";
        formStatus.classList.remove("error");
      }
      return;
    }

    const updateDisplay = () => {
      const now = Date.now();
      const remaining = parseInt(cooldownTime) - now;
      
      if (remaining > 0) {
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        const secs = Math.floor((remaining % (60 * 1000)) / 1000);
        
        submitBtn.disabled = true;
        if (formStatus) {
          formStatus.textContent = `Next submission available in ${hours}h ${minutes}m ${secs}s`;
          formStatus.classList.add("error");
        }
      } else {
        submitBtn.disabled = false;
        if (formStatus) {
          formStatus.textContent = "";
          formStatus.classList.remove("error");
        }
        localStorage.removeItem("demoCooldownTime");
        if (cooldownInterval) clearInterval(cooldownInterval);
      }
    };

    updateDisplay();
    cooldownInterval = setInterval(updateDisplay, 1000);
  };

  checkCooldown();
}

