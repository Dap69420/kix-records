const header = document.querySelector(".site-header");
const popupButtons = document.querySelectorAll("[data-popup]");
const demoForm = document.querySelector(".demo-form");
const formStatus = document.querySelector(".form-status");
const modal = document.getElementById("popup-modal");
const spotifyModal = document.getElementById("spotify-modal");

const modalTitle = document.getElementById("popup-title");
const modalText = document.getElementById("popup-text");
const modalAction = document.getElementById("popup-action");

// Generic function to close any modal
const closeAnyModal = (modalElement) => {
  modalElement.classList.remove("open");
  // If it's the spotify modal, clear content after transition
  if (modalElement.id === "spotify-modal") {
    setTimeout(() => {
      const wrapper = modalElement.querySelector("#spotify-embed-wrapper");
      if (wrapper) wrapper.innerHTML = "";
    }, 300);
  }
};

// Close buttons handler
document.querySelectorAll(".modal-close").forEach((btn) => {
  btn.addEventListener("click", () => {
    const modalToClose = btn.closest(".modal");
    if (modalToClose) {
      closeAnyModal(modalToClose);
    }
  });
});

// Click outside handler for all modals
document.querySelectorAll(".modal").forEach((modalEl) => {
  modalEl.addEventListener("click", (event) => {
    if (event.target === modalEl) {
      closeAnyModal(modalEl);
    }
  });
});

const popupContent = {
  listen: {
    title: "Listen Now",
    text: 'Our label\'s music is available on all major streaming platforms. Follow on Spotify to stay updated on new releases.<br><br><iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/playlist/0NbcEn4oXm642P2q3ZVeHh?utm_source=generator&theme=0" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
    actionText: "Go to Spotify",
    actionUrl: "https://open.spotify.com/playlist/0NbcEn4oXm642P2q3ZVeHh",
  },
  catalog: {
    title: "View Catalog",
    text: "The first releases are in motion. Join the Discord to get notified as soon as the label drops hit.",
    actionText: "Join Discord",
    actionUrl: "https://discord.gg/raPDZy4qnE",
  },
  social: {
    title: "Coming Soon!",
    text: "Our social pages are currently under construction. Stay tuned for updates!",
    actionText: "Join Discord",
    actionUrl: "https://discord.gg/raPDZy4qnE",
  },
};

const handleScroll = () => {
  if (!header) {
    return;
  }
  const elevated = window.scrollY > 30;
  header.classList.toggle("scrolled", elevated);
};

const openModal = (popupType) => {
  const content = popupContent[popupType];
  if (!content) return;

  modalTitle.textContent = content.title;
  modalText.innerHTML = content.text;
  modalAction.textContent = content.actionText;
  modalAction.onclick = () => {
    window.open(content.actionUrl, "_blank", "noreferrer");
  };

  modal.classList.add("open");
};


const handlePopupClick = (event) => {
  const popupType = event.currentTarget.getAttribute("data-popup");
  openModal(popupType);
};

// Re-select popup buttons to include newly added ones if script runs before DOM or dynamically
popupButtons.forEach((button) => {
  button.removeEventListener("click", handlePopupClick); // Cleanup first
});

// Select all buttons with data-popup attribute dynamically
document.querySelectorAll("[data-popup]").forEach((button) => {
  button.addEventListener("click", handlePopupClick);
});

if (header) {
  window.addEventListener("scroll", handleScroll);
}

// Removed manual close listeners as they are handled by generic listeners

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
const releaseList = document.querySelector("#releases .release-list");
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

const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const formatReleaseDate = (dateValue) => {
  if (!dateValue) return "";

  // Avoid UTC parsing shifts for date-only strings (YYYY-MM-DD).
  let date;
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [yearRaw, monthRaw, dayRaw] = dateValue.split("-");
    const year = parseInt(yearRaw, 10);
    const month = parseInt(monthRaw, 10);
    const day = parseInt(dayRaw, 10);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(dateValue);
  }

  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long" });
};

const attachSpotifyReleaseHandlers = () => {
  const releaseItems = document.querySelectorAll(".release-item[data-album-id]");
  releaseItems.forEach((item) => {
    const playBtn = item.querySelector(".release-play-btn");
    const albumId = item.getAttribute("data-album-id");
    const trackName = item.getAttribute("data-track-name");
    const artistName = item.getAttribute("data-artist-name");
    const releaseDate = item.getAttribute("data-release-date");

    if (playBtn && !playBtn.dataset.bound) {
      playBtn.dataset.bound = "1";
      playBtn.addEventListener("click", () => {
        openSpotifyModal(albumId, trackName, artistName, releaseDate);
      });
    }
  });
};

const renderReleases = (releases) => {
  if (!releaseList || !Array.isArray(releases) || releases.length === 0) {
    return;
  }

  const isAllReleasesPage = window.location.pathname.endsWith("all-releases.html");
  const releaseLimitRaw = releaseList.getAttribute("data-release-limit");
  const releaseLimit = releaseLimitRaw ? parseInt(releaseLimitRaw, 10) : 0;
  const shouldLimit = !isAllReleasesPage && releaseLimit > 0;
  const visibleReleases = shouldLimit ? releases.slice(0, releaseLimit) : releases;

  const cardsHtml = visibleReleases
    .map((release) => {
      const releaseDate = formatReleaseDate(release.release_date || release.created_at);
      return `
        <div class="release-item">
          <div class="release-info">
            <h3>${escapeHtml(release.release_name)}</h3>
            <p>${escapeHtml(release.artist_names)}</p>
            <span>${escapeHtml(releaseDate)}</span>
          </div>
          <div class="release-cover">
            <img src="${escapeHtml(release.cover_art_url)}" alt="Release cover art" loading="lazy" />
          </div>
          <a href="${escapeHtml(release.release_url)}" target="_blank" rel="noreferrer" class="release-play-btn" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <span>Listen</span>
          </a>
        </div>
      `;
    })
    .join("");

  const showAllCardHtml = shouldLimit
    ? `
      <div class="release-item show-all-releases">
        <div class="release-info">
          <h3>See All Releases</h3>
          <p>Browse full catalog</p>
          <span>KIX RECORDS</span>
        </div>
        <div class="release-cover" style="display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05);">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </div>
        <a href="all-releases.html" class="release-play-btn" style="text-decoration: none; display: flex; align-items: center; justify-content: center;">
          <span>See All Releases</span>
        </a>
      </div>
    `
    : "";

  releaseList.innerHTML = `${cardsHtml}${showAllCardHtml}`;
};

const loadReleases = async () => {
  if (!releaseList) {
    attachSpotifyReleaseHandlers();
    return;
  }

  releaseList.innerHTML = "";

  try {
    const response = await fetch("/api/releases");
    if (!response.ok) {
      throw new Error("Failed to load releases");
    }

    const data = await response.json();
    if (data.ok && Array.isArray(data.releases) && data.releases.length > 0) {
      renderReleases(data.releases);
    }
  } catch (_error) {
    // Keep static releases as fallback if API fetch fails.
  } finally {
    attachSpotifyReleaseHandlers();
  }
};

loadReleases();

/* Updates Carousel */
const updatesCarousel = document.querySelector(".updates-carousel");
if (updatesCarousel) {
  const wrapper = updatesCarousel.querySelector(".updates-track-wrapper");
  const track = updatesCarousel.querySelector(".updates-track");
  const prevBtn = updatesCarousel.querySelector(".carousel-prev");
  const nextBtn = updatesCarousel.querySelector(".carousel-next");

  if (wrapper && track && prevBtn && nextBtn) {
    const fallbackMarkup = track.innerHTML;
    let cards = [];
    let currentIndex = 0;

    const getCards = () => Array.from(track.querySelectorAll(".update-card"));
    const getMinSelectableIndex = () => {
      const currentCards = getCards();
      if (currentCards.length > 1 && currentCards[0]?.classList.contains("coming-soon")) {
        return 1;
      }
      return 0;
    };

    const updateCarousel = () => {
      cards = getCards();
      if (!cards.length) {
        prevBtn.style.display = "none";
        nextBtn.disabled = true;
        return;
      }

      const minSelectableIndex = getMinSelectableIndex();
      currentIndex = Math.max(minSelectableIndex, Math.min(currentIndex, cards.length - 1));

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

      prevBtn.style.display = currentIndex <= minSelectableIndex ? "none" : "flex";
      nextBtn.disabled = currentIndex === cards.length - 1;
    };

    const renderUpdates = (updates) => {
      if (!Array.isArray(updates) || updates.length === 0) {
        return false;
      }

      const hardcodedComingSoonCard = `
        <article class="update-card coming-soon">
          <div class="update-content">
            <h3>Coming Soon</h3>
            <p>Stay tuned for exciting updates.</p>
          </div>
        </article>
      `;

      const dynamicCards = updates
        .map(
          (update) => `
            <article class="update-card" data-date="${escapeHtml(update.update_date || "")}">
              <div class="update-badge">${escapeHtml(update.badge || "Update")}</div>
              <div class="update-content">
                <h3>${escapeHtml(update.title || "Untitled")}</h3>
                <p>${escapeHtml(update.content || "")}</p>
                <span class="update-date">${escapeHtml(update.update_date || "")}</span>
              </div>
            </article>
          `
        )
        .join("");

      track.innerHTML = `${hardcodedComingSoonCard}${dynamicCards}`;

      currentIndex = getMinSelectableIndex();
      updateCarousel();
      return true;
    };

    const loadUpdates = async () => {
      try {
        const response = await fetch("/api/updates");
        if (!response.ok) {
          throw new Error("Failed to load updates");
        }

        const data = await response.json();
        const didRender = renderUpdates(data.updates);
        if (!didRender) {
          throw new Error("No updates returned");
        }
      } catch (_error) {
        // Keep static carousel cards as fallback when API fails.
        track.innerHTML = fallbackMarkup;
        currentIndex = getMinSelectableIndex();
        updateCarousel();
      }
    };

    prevBtn.addEventListener("click", () => {
      const minSelectableIndex = getMinSelectableIndex();
      if (currentIndex > minSelectableIndex) {
        currentIndex -= 1;
        updateCarousel();
      }
    });

    nextBtn.addEventListener("click", () => {
      cards = getCards();
      if (currentIndex < cards.length - 1) {
        currentIndex += 1;
        updateCarousel();
      }
    });

    window.addEventListener("resize", updateCarousel);
    loadUpdates();
  }
}


/* Form */
const form = document.querySelector(".multi-step-form");
const authModal = document.getElementById("auth-modal");
const authToggleButtons = document.querySelectorAll("[data-auth-toggle]");
const authUsernameLabels = document.querySelectorAll("[data-auth-username]");
const authAdminLinks = document.querySelectorAll("[data-admin-link]");
const submitDemoLinks = document.querySelectorAll('.auth-actions .cta[href="submit-demo.html"]');

const updateHeaderAuthUI = () => {
  const loggedIn = auth.isLoggedIn();
  const username = auth.user?.username || "";
  const isAdmin = auth.user?.role === "Admin";

  authToggleButtons.forEach((button) => {
    button.textContent = loggedIn ? "Logout" : "Login";
    if (loggedIn) {
      button.removeAttribute("data-open-auth");
    } else {
      button.setAttribute("data-open-auth", "");
    }
  });

  authUsernameLabels.forEach((label) => {
    if (loggedIn) {
      label.textContent = username;
      label.classList.remove("hidden");
    } else {
      label.textContent = "";
      label.classList.add("hidden");
    }
  });

  authAdminLinks.forEach((link) => {
    if (loggedIn && isAdmin) {
      link.classList.remove("hidden");
    } else {
      link.classList.add("hidden");
    }
  });
};

const handleAuthToggleClick = (event) => {
  if (!event.currentTarget) {
    return;
  }

  if (auth.isLoggedIn()) {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) {
      return;
    }
    auth.logout();
    updateHeaderAuthUI();

    const isSubmitPage = window.location.pathname.endsWith("submit-demo.html");
    const isAdminPage = window.location.pathname.endsWith("admin.html");
    if (isSubmitPage || isAdminPage) {
      window.location.href = "index.html";
    }
  } else {
    authModal?.classList.add("open");
  }
};

authToggleButtons.forEach((button) => {
  button.addEventListener("click", handleAuthToggleClick);
});

submitDemoLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!auth.isLoggedIn()) {
      event.preventDefault();
      localStorage.setItem("postLoginRedirect", "submit-demo.html");
      authModal?.classList.add("open");
    }
  });
});

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("openAuth") === "1") {
  authModal?.classList.add("open");
}

const isSubmitDemoPage = window.location.pathname.endsWith("submit-demo.html");
if (isSubmitDemoPage && !auth.isLoggedIn()) {
  localStorage.setItem("postLoginRedirect", "submit-demo.html");
  window.location.href = "index.html?openAuth=1";
}

const isAdminPage = window.location.pathname.endsWith("admin.html");
if (isAdminPage) {
  if (!auth.isLoggedIn()) {
    localStorage.setItem("postLoginRedirect", "admin.html");
    window.location.href = "index.html?openAuth=1";
  } else if (auth.user?.role !== "Admin") {
    window.alert("Admin access required.");
    window.location.href = "index.html";
  }
}

updateHeaderAuthUI();

// Check if user is logged in
const checkAuthStatus = () => {
  if (!auth.isLoggedIn() && form) {
    // Show auth modal and prevent form navigation
    authModal.classList.add("open");
    return false;
  }
  return true;
};

// Auth Modal Handlers
if (authModal) {
  const authTabs = document.querySelectorAll(".auth-tab");
  const authForms = document.querySelectorAll(".auth-form");
  const openAuthButtons = document.querySelectorAll("[data-open-auth]");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const loginStatus = document.getElementById("login-status");
  const registerStatus = document.getElementById("register-status");
  const loginUsernameInput = document.getElementById("login-username");
  const loginPasswordInput = document.getElementById("login-password");
  const loginSecurityQuestionText = document.getElementById("login-security-question-text");
  const loginSecurityAnswerGroup = document.getElementById("login-security-answer-group");
  const loginSecurityAnswerInput = document.getElementById("login-security-answer");
  const loginSubmitBtn = document.getElementById("login-submit-btn");

  let loginChallenge = {
    username: "",
    password: "",
    active: false,
  };

  openAuthButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!auth.isLoggedIn()) {
        authModal.classList.add("open");
      }
    });
  });

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.getAttribute("data-tab");
      
      authTabs.forEach((t) => t.classList.remove("active"));
      authForms.forEach((f) => f.classList.remove("active"));
      
      tab.classList.add("active");
      document.getElementById(`${tabName}-form`).classList.add("active");
      
      // Clear status messages
      loginStatus.textContent = "";
      registerStatus.textContent = "";

      if (tabName === "login") {
        loginChallenge = { username: "", password: "", active: false };
        if (loginSecurityQuestionText) {
          loginSecurityQuestionText.value = "";
        }
        if (loginSecurityAnswerInput) {
          loginSecurityAnswerInput.value = "";
          loginSecurityAnswerInput.required = false;
        }
        if (loginSecurityAnswerGroup) {
          loginSecurityAnswerGroup.classList.add("hidden");
        }
        if (loginSubmitBtn) {
          loginSubmitBtn.textContent = "Continue";
        }
      }
    });
  });

  // Login handler
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = (loginUsernameInput?.value || "").trim();
      const password = loginPasswordInput?.value || "";
      
      loginStatus.textContent = "Signing in...";
      loginStatus.classList.remove("success");

      if (!loginChallenge.active) {
        const challengeResult = await auth.requestSecurityQuestion(username, password);

        if (challengeResult.success) {
          loginChallenge = { username, password, active: true };
          if (loginSecurityQuestionText) {
            loginSecurityQuestionText.value = challengeResult.data.securityQuestion || "";
          }
          if (loginSecurityAnswerGroup) {
            loginSecurityAnswerGroup.classList.remove("hidden");
          }
          if (loginSecurityAnswerInput) {
            loginSecurityAnswerInput.required = true;
            loginSecurityAnswerInput.focus();
          }
          if (loginSubmitBtn) {
            loginSubmitBtn.textContent = "Sign In";
          }
          loginStatus.textContent = "Now answer your security question.";
          loginStatus.classList.add("success");
        } else {
          loginStatus.textContent = challengeResult.error;
        }
      } else {
        const securityAnswer = (loginSecurityAnswerInput?.value || "").trim();
        const result = await auth.loginWithSecurityAnswer(
          loginChallenge.username,
          loginChallenge.password,
          securityAnswer
        );

        if (result.success) {
          loginStatus.textContent = "Login successful!";
          loginStatus.classList.add("success");
          updateHeaderAuthUI();
          setTimeout(() => {
            authModal.classList.remove("open");
            loginForm.reset();
            loginChallenge = { username: "", password: "", active: false };
            if (loginSecurityQuestionText) {
              loginSecurityQuestionText.value = "";
            }
            if (loginSecurityAnswerGroup) {
              loginSecurityAnswerGroup.classList.add("hidden");
            }
            if (loginSubmitBtn) {
              loginSubmitBtn.textContent = "Continue";
            }

            const redirectTo = localStorage.getItem("postLoginRedirect");
            if (redirectTo) {
              localStorage.removeItem("postLoginRedirect");
              window.location.href = redirectTo;
            }
          }, 500);
        } else {
          loginStatus.textContent = result.error;
        }
      }
    });
  }

  // Register handler
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const username = document.getElementById("register-username").value;
      const securityQuestion = document.getElementById("register-security-question").value;
      const securityAnswer = document.getElementById("register-security-answer").value;
      const password = document.getElementById("register-password").value;
      const confirmPassword = document.getElementById("register-confirm-password").value;
      
      registerStatus.textContent = "Creating account...";
      registerStatus.classList.remove("success");
      
      const result = await auth.register(
        username,
        password,
        confirmPassword,
        securityQuestion,
        securityAnswer
      );
      
      if (result.success) {
        registerStatus.textContent = "Account created! Redirecting...";
        registerStatus.classList.add("success");
        updateHeaderAuthUI();
        setTimeout(() => {
          authModal.classList.remove("open");
          registerForm.reset();

          const redirectTo = localStorage.getItem("postLoginRedirect");
          if (redirectTo) {
            localStorage.removeItem("postLoginRedirect");
            window.location.href = redirectTo;
          }
        }, 500);
      } else {
        registerStatus.textContent = result.error;
      }
    });
  }
}

if (form) {
  // Show auth modal if user is not logged in
  if (!auth.isLoggedIn()) {
    authModal.classList.add("open");
  }

  const steps = form.querySelectorAll(".form-step");
  const formStatus = form.querySelector(".form-status");
  const prevBtn = form.querySelector(".form-prev-btn");
  const nextBtn = form.querySelector(".form-next-btn");
  const submitBtn = form.querySelector("#submit-btn");
  const stepDots = form.querySelectorAll(".step-dot");
  const artistsList = form.querySelector(".artists-list");
  const addArtistBtn = form.querySelector(".add-artist-btn");
  
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
    const requiredFields = getRequiredFieldsForStep(stepNum);
    let isValid = true;
    let errorMsg = "";
    
    if (stepNum === 2) {
      const artistEntries = form.querySelectorAll(".artist-entry");
      if (artistEntries.length === 0) {
        isValid = false;
        errorMsg = "Please add at least one artist";
      } else {
        for (const entry of artistEntries) {
          const nameInput = entry.querySelector('input[type="text"]');
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
      return isValid;
    }

    
    if (stepNum === 4) {
      return true;
    }

    // Validation for other steps
    for (const field of requiredFields) {
      const element = form.querySelector(field.selector);
      
      if (!element) {
        console.warn("Field not found:", field.selector);
        continue;
      }

      const value = field.isCheckbox ? element.checked : element.value.trim();
      
      if (!value) {
        isValid = false;
        errorMsg = `Please fill in: ${field.name}`;
        break;
      }

      // Additional validation for URLs
      if (field.name === "Demo link") {
        if (!isValidUrl(value)) {
          isValid = false;
          errorMsg = "Please enter a valid demo link URL";
          break;
        }
      }

      // Additional validation for email
      if (field.name === "Email address") {
        if (!isValidEmail(value)) {
          isValid = false;
          errorMsg = "Please enter a valid email address";
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

    if (!auth.isLoggedIn()) {
      authModal?.classList.add("open");
      if (formStatus) {
        formStatus.textContent = "Please log in to continue.";
        formStatus.classList.add("error");
      }
      return;
    }

    const isValid = validateStep(currentStep);
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

    if (!auth.isLoggedIn()) {
      authModal?.classList.add("open");
      if (formStatus) {
        formStatus.textContent = "Login is required to submit a demo.";
        formStatus.classList.add("error");
      }
      return;
    }

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
        headers: {
          "Content-Type": "application/json",
          ...auth.getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Submission failed");
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



// Chat Widget Logic
const chatToggleBtn = document.getElementById("chat-toggle-btn");
const chatWindow = document.getElementById("chat-window");
const chatCloseBtn = document.getElementById("chat-close-btn");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const resizeHandle = document.getElementById("chat-resize-handle");

// Resize Logic (Top-Left Handle)
if (resizeHandle && chatWindow) {
  let startX, startY, startWidth, startHeight;

  const startResize = (e) => {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    // Get current computed style
    const style = window.getComputedStyle(chatWindow);
    startWidth = parseInt(style.width, 10);
    startHeight = parseInt(style.height, 10);
    
    document.documentElement.addEventListener('mousemove', doResize, false);
    document.documentElement.addEventListener('mouseup', stopResize, false);
    chatWindow.style.transition = 'none'; // Disable transition for smooth resize
  };

  const doResize = (e) => {
    // Top-Right resize (fixed at bottom-left): dragging right increases width, dragging up increases height
    const deltaX = e.clientX - startX;
    const deltaY = startY - e.clientY; // Dragging up reduces Y but increases height
    
    const newWidth = startWidth + deltaX;
    const newHeight = startHeight + deltaY;

    // Apply strict minimums
    if (newWidth >= 300) chatWindow.style.width = `${newWidth}px`;
    if (newHeight >= 400) chatWindow.style.height = `${newHeight}px`;
  };

  const stopResize = () => {
    document.documentElement.removeEventListener('mousemove', doResize, false);
    document.documentElement.removeEventListener('mouseup', stopResize, false);
    chatWindow.style.transition = ''; // Re-enable transition
  };

  resizeHandle.addEventListener('mousedown', startResize, false);
}

// Toggle Logic
if (chatToggleBtn && chatWindow) {
  chatToggleBtn.addEventListener("click", () => {
    chatWindow.classList.toggle("hidden");
    const isHidden = chatWindow.classList.contains("hidden");
    chatToggleBtn.setAttribute("aria-expanded", !isHidden);
    if (!isHidden && chatInput) {
      setTimeout(() => chatInput.focus(), 100);
    }
  });

  if (chatCloseBtn) {
    chatCloseBtn.addEventListener("click", () => {
      chatWindow.classList.add("hidden");
      chatToggleBtn.setAttribute("aria-expanded", "false");
    });
  }
}

// Chat Interaction Logic
if (chatForm) {
  let conversationHistory = [];

  const parseMarkdown = (text) => {
    // Basic formatting
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
      
    // Handle specific list formatting
    const lines = html.split('\n');
    let inList = false;
    let newLines = [];
    
    for (let line of lines) {
        let trimmed = line.trim();
        // Check for bullet points (- or *)
        if (trimmed.match(/^(?:-|\*)\s/)) {
            if (!inList) {
                newLines.push('<ul>');
                inList = true;
            }
            newLines.push(`<li>${trimmed.substring(2)}</li>`);
        } else {
            if (inList) {
                newLines.push('</ul>');
                inList = false;
            }
            if (trimmed.length > 0) newLines.push(trimmed + '<br>');
        }
    }
    if (inList) newLines.push('</ul>');
    
    return newLines.join('');
  };

  const addMessage = (text, sender) => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}`;
    
    if (sender === 'system') {
        msgDiv.innerHTML = parseMarkdown(text);
    } else {
        msgDiv.textContent = text;
    }
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message
    addMessage(text, "user");
    chatInput.value = "";
    conversationHistory.push({ role: "user", content: text });

    // Thinking indicator
    const thinkingDiv = document.createElement("div");
    thinkingDiv.className = "message system thinking";
    thinkingDiv.textContent = "Thinking...";
    chatMessages.appendChild(thinkingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (chatMessages.contains(thinkingDiv)) {
        chatMessages.removeChild(thinkingDiv);
      }

      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "No response.";

      addMessage(reply, "system");
      conversationHistory.push({ role: "assistant", content: reply });

    } catch (error) {
      if (chatMessages.contains(thinkingDiv)) {
        chatMessages.removeChild(thinkingDiv);
      }
      addMessage("Connection error. Please try again.", "system error");
      console.error(error);
    }
  });
}

/* Admin Panel */
const adminTabs = document.querySelectorAll(".admin-tab");
const adminPanels = document.querySelectorAll(".admin-panel");
const adminReleaseForm = document.getElementById("admin-release-form");
const adminReleaseList = document.getElementById("admin-release-list");
const adminFormStatus = document.getElementById("admin-form-status");
const adminUpdateForm = document.getElementById("admin-update-form");
const adminUpdateList = document.getElementById("admin-update-list");
const adminUpdateFormStatus = document.getElementById("admin-update-form-status");

if (adminTabs.length && adminPanels.length) {
  adminTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.getAttribute("data-admin-tab");

      adminTabs.forEach((item) => item.classList.remove("active"));
      adminPanels.forEach((panel) => panel.classList.remove("active"));

      tab.classList.add("active");
      const panel = document.querySelector(`[data-admin-panel="${tabName}"]`);
      if (panel) {
        panel.classList.add("active");
      }
    });
  });
}

const adminLoadReleases = async () => {
  if (!adminReleaseList) return;

  adminReleaseList.innerHTML = "<p class='meta'>Loading releases...</p>";

  try {
    const response = await fetch("/api/admin/releases", {
      headers: {
        ...auth.getAuthHeader(),
      },
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Failed to load releases");
    }

    if (!data.releases.length) {
      adminReleaseList.innerHTML = "<p class='meta'>No releases yet.</p>";
      return;
    }

    adminReleaseList.innerHTML = data.releases
      .map(
        (release) => {
          const releaseDateValue = release.release_date || (release.created_at ? new Date(release.created_at).toISOString().slice(0, 10) : "");
          return `
          <form class="admin-release-item" data-release-id="${release.id}">
            <div class="meta">ID: ${release.id} · Updated: ${new Date(release.updated_at).toLocaleString()}</div>
            <input type="text" name="releaseName" value="${escapeHtml(release.release_name)}" required />
            <input type="text" name="artistNames" value="${escapeHtml(release.artist_names)}" required />
            <input type="url" name="coverArtUrl" value="${escapeHtml(release.cover_art_url)}" required />
            <input type="url" name="releaseUrl" value="${escapeHtml(release.release_url)}" required />
            <input type="date" name="releaseDate" value="${escapeHtml(releaseDateValue)}" required />
            <button class="ghost" type="submit">Save Changes</button>
            <p class="auth-status"></p>
          </form>
        `;
        }
      )
      .join("");

    adminReleaseList.querySelectorAll(".admin-release-item").forEach((editForm) => {
      editForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const status = editForm.querySelector(".auth-status");
        const id = Number(editForm.dataset.releaseId);
        const payload = {
          id,
          releaseName: editForm.releaseName.value,
          artistNames: editForm.artistNames.value,
          coverArtUrl: editForm.coverArtUrl.value,
          releaseUrl: editForm.releaseUrl.value,
          releaseDate: editForm.releaseDate.value,
        };

        status.textContent = "Saving...";

        try {
          const response = await fetch("/api/admin/releases", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...auth.getAuthHeader(),
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          if (!response.ok || !data.ok) {
            throw new Error(data.error || "Failed to update release");
          }

          status.textContent = "Saved";
          status.classList.add("success");
          setTimeout(() => {
            status.textContent = "";
            status.classList.remove("success");
          }, 1200);
        } catch (error) {
          status.textContent = error.message;
          status.classList.remove("success");
        }
      });
    });
  } catch (error) {
    adminReleaseList.innerHTML = `<p class='auth-status'>${escapeHtml(error.message)}</p>`;
  }
};

const adminLoadUpdates = async () => {
  if (!adminUpdateList) return;

  adminUpdateList.innerHTML = "<p class='meta'>Loading updates...</p>";

  try {
    const response = await fetch("/api/admin/updates", {
      headers: {
        ...auth.getAuthHeader(),
      },
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Failed to load updates");
    }

    if (!data.updates.length) {
      adminUpdateList.innerHTML = "<p class='meta'>No updates yet.</p>";
      return;
    }

    adminUpdateList.innerHTML = data.updates
      .map(
        (update) => `
          <form class="admin-release-item" data-update-id="${update.id}">
            <div class="meta">ID: ${update.id} · Updated: ${new Date(update.updated_at).toLocaleString()}</div>
            <input type="text" name="badge" value="${escapeHtml(update.badge)}" required />
            <input type="text" name="title" value="${escapeHtml(update.title)}" required />
            <input type="text" name="updateDate" value="${escapeHtml(update.update_date)}" required />
            <textarea name="content" rows="4" required>${escapeHtml(update.content)}</textarea>
            <button class="ghost" type="submit">Save Changes</button>
            <p class="auth-status"></p>
          </form>
        `
      )
      .join("");

    adminUpdateList.querySelectorAll(".admin-release-item").forEach((editForm) => {
      editForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const status = editForm.querySelector(".auth-status");
        const id = Number(editForm.dataset.updateId);
        const payload = {
          id,
          badge: editForm.badge.value,
          title: editForm.title.value,
          updateDate: editForm.updateDate.value,
          content: editForm.content.value,
        };

        status.textContent = "Saving...";

        try {
          const response = await fetch("/api/admin/updates", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...auth.getAuthHeader(),
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          if (!response.ok || !data.ok) {
            throw new Error(data.error || "Failed to update update");
          }

          status.textContent = "Saved";
          status.classList.add("success");
          setTimeout(() => {
            status.textContent = "";
            status.classList.remove("success");
          }, 1200);
        } catch (error) {
          status.textContent = error.message;
          status.classList.remove("success");
        }
      });
    });
  } catch (error) {
    adminUpdateList.innerHTML = `<p class='auth-status'>${escapeHtml(error.message)}</p>`;
  }
};

if (adminReleaseForm) {
  adminReleaseForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      releaseName: document.getElementById("admin-release-name").value,
      artistNames: document.getElementById("admin-artist-names").value,
      coverArtUrl: document.getElementById("admin-cover-art-url").value,
      releaseUrl: document.getElementById("admin-release-url").value,
      releaseDate: document.getElementById("admin-release-date").value || new Date().toISOString().slice(0, 10),
    };

    if (adminFormStatus) {
      adminFormStatus.textContent = "Adding release...";
      adminFormStatus.classList.remove("success");
    }

    try {
      const response = await fetch("/api/admin/releases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...auth.getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to add release");
      }

      adminReleaseForm.reset();
      if (adminFormStatus) {
        adminFormStatus.textContent = "Release added.";
        adminFormStatus.classList.add("success");
      }

      await adminLoadReleases();
    } catch (error) {
      if (adminFormStatus) {
        adminFormStatus.textContent = error.message;
        adminFormStatus.classList.remove("success");
      }
    }
  });

  adminLoadReleases();
}

if (adminUpdateForm) {
  adminUpdateForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      badge: document.getElementById("admin-update-badge").value,
      title: document.getElementById("admin-update-title").value,
      updateDate: document.getElementById("admin-update-date").value,
      content: document.getElementById("admin-update-content").value,
    };

    if (adminUpdateFormStatus) {
      adminUpdateFormStatus.textContent = "Adding update...";
      adminUpdateFormStatus.classList.remove("success");
    }

    try {
      const response = await fetch("/api/admin/updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...auth.getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to add update");
      }

      adminUpdateForm.reset();
      if (adminUpdateFormStatus) {
        adminUpdateFormStatus.textContent = "Update added.";
        adminUpdateFormStatus.classList.add("success");
      }

      await adminLoadUpdates();
    } catch (error) {
      if (adminUpdateFormStatus) {
        adminUpdateFormStatus.textContent = error.message;
        adminUpdateFormStatus.classList.remove("success");
      }
    }
  });

  adminLoadUpdates();
}

