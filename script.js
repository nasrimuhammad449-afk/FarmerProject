// =====================================================
// Soko la Wakulima – Responsive Client-Side Engine
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSlideshow();
  initMarketPrices();
  initWeatherAndCultivation();
  initUssdSimulator();
});

// 1. MOBILE NAVBAR TOGGLER
function initNavbar() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
    
    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navLinks.querySelectorAll('a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }
}

// 2. HERO SLIDESHOW LOGIC
function initSlideshow() {
  const slides = document.querySelectorAll('#heroSlideshow .slide');
  const dotsContainer = document.getElementById('slideshowDots');
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  
  if (slides.length === 0) return;
  
  // Preload all slide background images to ensure smooth, flicker-free transitions
  slides.forEach(slide => {
    const bgStyle = slide.style.backgroundImage || window.getComputedStyle(slide).backgroundImage;
    if (bgStyle && bgStyle !== 'none') {
      const urlMatch = bgStyle.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        const img = new Image();
        img.src = urlMatch[1];
      }
    }
  });
  
  let currentIndex = 0;
  let autoplayTimer = null;
  const autoplayDelay = 6000;

  // Create dot indicators
  dotsContainer.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `slideshow-dot ${i === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => {
      goToSlide(i);
      resetAutoplay();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.slideshow-dot');

  function goToSlide(index) {
    slides[currentIndex].classList.remove('is-active');
    dots[currentIndex].classList.remove('active');
    
    currentIndex = (index + slides.length) % slides.length;
    
    slides[currentIndex].classList.add('is-active');
    dots[currentIndex].classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });
    nextSlideBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });
  }

  function startAutoplay() {
    autoplayTimer = setInterval(nextSlide, autoplayDelay);
  }

  function resetAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    startAutoplay();
  }

  startAutoplay();
}

// 3. REAL-TIME TRENDING CROPS & PRICES
const MOCK_PRICES = [
  { crop: 'Kahawa (Coffee)', price: 4800, region: 'Kilimanjaro', trend: 'rising' },
  { crop: 'Kahawa (Coffee)', price: 4600, region: 'Mbeya', trend: 'rising' },
  { crop: 'Korosho (Cashew)', price: 3200, region: 'Mtwara', trend: 'stable' },
  { crop: 'Korosho (Cashew)', price: 3400, region: 'Lindi', trend: 'rising' },
  { crop: 'Chai (Tea)', price: 2100, region: 'Tanga', trend: 'falling' },
  { crop: 'Chai (Tea)', price: 2300, region: 'Iringa', trend: 'stable' },
  { crop: 'Pamba (Cotton)', price: 1800, region: 'Shinyanga', trend: 'falling' },
  { crop: 'Pamba (Cotton)', price: 1950, region: 'Mwanza', trend: 'rising' },
  { crop: 'Karafuu (Cloves)', price: 16500, region: 'Zanzibar', trend: 'rising' },
  { crop: 'Sisal (Katani)', price: 2900, region: 'Tanga', trend: 'stable' },
  { crop: 'Alizeti (Sunflower)', price: 1500, region: 'Dodoma', trend: 'rising' },
  { crop: 'Mpunga (Rice)', price: 1400, region: 'Morogoro', trend: 'rising' }
];

function initMarketPrices() {
  const pricesList = document.getElementById('realtimePricesList');
  const regionFilter = document.getElementById('regionFilter');
  const marketTrendMessage = document.getElementById('marketTrendMessage');
  
  if (!pricesList) return;

  function renderPrices() {
    const selectedRegion = regionFilter.value;
    const filtered = selectedRegion === 'all' 
      ? MOCK_PRICES 
      : MOCK_PRICES.filter(p => p.region.toLowerCase() === selectedRegion.toLowerCase());

    if (filtered.length === 0) {
      pricesList.innerHTML = `<div class="price-loader">Hakuna mazao yaliyosajiliwa mkoa wa ${selectedRegion}.</div>`;
      return;
    }

    pricesList.innerHTML = filtered.map(item => {
      const trendSymbol = item.trend === 'rising' ? '↑ Inapanda' : item.trend === 'falling' ? '↓ Inashuka' : '→ Imekaa';
      const cleanCrop = item.crop.replace(/'/g, "\\'");
      return `
        <div class="price-row" style="cursor: pointer;" onclick="showSvgChart('${cleanCrop}', '${item.region}', ${item.price})">
          <div>
            <div class="crop-name">${item.crop}</div>
            <div class="crop-region">📍 ${item.region}</div>
          </div>
          <div>
            <span class="trend-tag trend-${item.trend}">${trendSymbol}</span>
          </div>
          <div class="crop-price">${item.price.toLocaleString()} TZS</div>
        </div>
      `;
    }).join('');

  }

  // Handle region filter change
  regionFilter.addEventListener('change', renderPrices);
  renderPrices();

  // Simulate price changes on interval to represent "Real-time"
  setInterval(() => {
    MOCK_PRICES.forEach(item => {
      // Random fluctuation between -100 and +150 TZS
      const change = Math.floor(Math.random() * 250) - 100;
      item.price = Math.max(800, item.price + change);
      
      // Randomly change trend tags
      if (change > 80) item.trend = 'rising';
      else if (change < -40) item.trend = 'falling';
      else item.trend = 'stable';
    });
    
    // Smooth update
    renderPrices();
    
    // Update national trend advisory message
    const risingCount = MOCK_PRICES.filter(p => p.trend === 'rising').length;
    if (risingCount > 6) {
      marketTrendMessage.textContent = 'Mwelekeo wa soko la kitaifa: Bei za korosho na kahawa zinaongezeka. Wakulima wanashauriwa kuanza kupeleka mazao ghalani.';
    } else {
      marketTrendMessage.textContent = 'Mwelekeo wa soko la kitaifa: Hali ya bei ni tulivu. Hakikisha mazao yamekauka vizuri kabla ya kusafirisha sokoni.';
    }
  }, 10000);
}

// 4. WEATHER & TEMPERATURE CULTIVATION ENGINE
const DISTRICTS_MAP = {
  'Arusha': ['Arumeru', 'Karatu', 'Monduli', 'Ngorongoro', 'Arusha Mjini'],
  'Mwanza': ['Ilemela', 'Nyamagana', 'Sengerema', 'Magu', 'Kwimba'],
  'Kilimanjaro': ['Hai', 'Same', 'Moshi Vijijini', 'Rombo', 'Siha'],
  'Dodoma': ['Chamwino', 'Mpwapwa', 'Kongwa', 'Kondoa', 'Bahi'],
  'Mbeya': ['Rungwe', 'Kyela', 'Mbarali', 'Chunya', 'Busokelo'],
  'Morogoro': ['Kilombero', 'Kilosa', 'Mvomero', 'Ulanga', 'Morogoro Mjini'],
  'Tanga': ['Lushoto', 'Muheza', 'Korogwe', 'Pangani', 'Handeni']
};

const MOCK_WEATHER = {
  'Arusha': { temp: '19°C', condition: 'Partly Cloudy (Mawingu)', humidity: '72%', rain: '0.8mm', icon: '🌤️', suitableCrops: 'Kahawa (Coffee), Chai (Tea), Viazi, Mboga za majani.' },
  'Mwanza': { temp: '26°C', condition: 'Sunny (Jua kali)', humidity: '55%', rain: '0mm', icon: '☀️', suitableCrops: 'Pamba (Cotton), Mpunga (Rice - mabondeni), Mahindi.' },
  'Kilimanjaro': { temp: '21°C', condition: 'Cloudy (Mawingu)', humidity: '68%', rain: '0mm', icon: '☁️', suitableCrops: 'Kahawa, Chai, Ndizi, Maharage ya koti.' },
  'Dodoma': { temp: '29°C', condition: 'Dry (Ukame)', humidity: '38%', rain: '0mm', icon: '🌵', suitableCrops: 'Alizeti (Sunflower), Mtama (Sorghum), Uwele, Karanga.' },
  'Mbeya': { temp: '17°C', condition: 'Cold Rain (Mvua ya Baridi)', humidity: '85%', rain: '4.5mm', icon: '🌧️', suitableCrops: 'Chai, Ngano (Wheat), Viazi Mviringo, Kahawa.' },
  'Morogoro': { temp: '28°C', condition: 'Humid Rainy (Mvua na Joto)', humidity: '80%', rain: '12mm', icon: '⛈️', suitableCrops: 'Mpunga (Rice), Miwa (Sugarcane), Mahindi ya haraka.' },
  'Tanga': { temp: '30°C', condition: 'Hot Sunny (Jua la Pwani)', humidity: '76%', rain: '0mm', icon: '☀️', suitableCrops: 'Katani (Sisal), Nazi (Coconut), Korosho, Mihogo.' }
};

function initWeatherAndCultivation() {
  const regionSelect = document.getElementById('weatherRegion');
  const districtSelect = document.getElementById('weatherDistrict');
  const wIcon = document.getElementById('wIcon');
  const wTemp = document.getElementById('wTemp');
  const wCond = document.getElementById('wCond');
  const wRain = document.getElementById('wRain');
  const wHumidity = document.getElementById('wHumidity');
  const suitabilityText = document.getElementById('suitabilityText');
  const tipsList = document.getElementById('cultivationTipsList');
  
  if (!regionSelect || !districtSelect) return;

  function populateDistricts() {
    const region = regionSelect.value;
    const districts = DISTRICTS_MAP[region] || [];
    
    districtSelect.innerHTML = '';
    districts.forEach(dist => {
      const opt = document.createElement('option');
      opt.value = dist;
      opt.textContent = dist;
      districtSelect.appendChild(opt);
    });
  }

  function updateWeatherDetails() {
    const region = regionSelect.value;
    const weather = MOCK_WEATHER[region];
    
    if (!weather) return;
    
    wIcon.textContent = weather.icon;
    wTemp.textContent = weather.temp;
    wCond.textContent = weather.condition;
    wRain.textContent = weather.rain;
    wHumidity.textContent = weather.humidity;
    
    suitabilityText.textContent = `Hali ya hewa katika eneo la ${region} inafaa zaidi kwa kilimo cha: ${weather.suitableCrops}`;
    
    // Update Swahili tips list dynamically depending on weather
    if (weather.condition.includes('Rainy') || weather.condition.includes('Rain')) {
      tipsList.innerHTML = `
        <li>🌧️ Hakikisha njia za maji shambani ziko wazi ili kuzuia mafuriko kuoza mizizi.</li>
        <li>🌱 Wakati mzuri wa kuweka mbolea ya kukuzia kwa kuwa udongo una unyevu wa kutosha.</li>
        <li>🛡️ Angalia wadudu wanaoenezwa na unyevu mkubwa kama vile Kuvu (fungus).</li>
      `;
    } else if (weather.condition.includes('Dry') || weather.temp.replace('°C','') > 28) {
      tipsList.innerHTML = `
        <li>🌵 Zidisha matandazo (mulching) ili kupunguza joto la udongo na unyevu usipotee.</li>
        <li>💧 Umwagiliaji wa matone unashauriwa kuokoa maji. Mwagilia nyakati za jioni.</li>
        <li>🚫 Usipige dawa ya wadudu wakati wa jua kali ili usichome majani ya zao lako.</li>
      `;
    } else {
      tipsList.innerHTML = `
        <li>☀️ Matayarisho ya shamba na upandaji kulingana na kalenda ya mkoa yanashauriwa.</li>
        <li>🔍 Kagua shamba mara kwa mara ili kubaini dalili za mwanzo za magonjwa.</li>
        <li>🌱 Pogoa matawi yasiyo na tija ili kuruhusu mwanga wa kutosha wa jua kufikia mazao.</li>
      `;
    }
  }

  regionSelect.addEventListener('change', () => {
    populateDistricts();
    updateWeatherDetails();
  });
  
  districtSelect.addEventListener('change', updateWeatherDetails);

  // Initial load
  populateDistricts();
  updateWeatherDetails();
}

// 5. INTERACTIVE Swahili USSD STATE SIMULATOR
function initUssdSimulator() {
  const dialBtn = document.getElementById('dialBtn');
  const dialerView = document.getElementById('dialerView');
  const menuView = document.getElementById('menuView');
  const ussdOutputText = document.getElementById('ussdOutputText');
  const ussdResponseInput = document.getElementById('ussdResponseInput');
  const sendUssdBtn = document.getElementById('sendUssdBtn');
  const cancelUssdBtn = document.getElementById('cancelUssdBtn');
  const phoneHomeBtn = document.getElementById('phoneHomeBtn');
  const ussdDialInput = document.getElementById('ussdDialInput');

  if (!dialBtn) return;

  // Simulator State variables
  let sessionActive = false;
  let currentLevel = 0; // matching ussd_handler level
  let sessionData = {}; 
  let phoneNumber = "+255715888999";
  let sessionId = "sim_" + Math.random().toString(36).substr(2, 9);

  // Sway USSD State Machine logic in JS (acts as fallback if server is offline)
  const SwahiliUSSD = {
    // 0: Main Menu
    0: {
      text: `KARIBU SOKO LA WAKULIMA\n1. Mavuno Yangu\n2. Wateja\n3. Bei Sokoni\n4. Hali ya Hewa\n5. Maagizo\n6. Usajili\n7. Msaada\n0. Ondoka`,
      handle: (input) => {
        if (input === '1') {
          currentLevel = 10;
          return SwahiliUSSD[10].text;
        } else if (input === '2') {
          currentLevel = 20;
          return SwahiliUSSD[20].text;
        } else if (input === '3') {
          currentLevel = 30;
          return SwahiliUSSD[30].text;
        } else if (input === '4') {
          currentLevel = 40;
          return SwahiliUSSD[40].text;
        } else if (input === '5') {
          currentLevel = 50;
          return SwahiliUSSD[50].text;
        } else if (input === '6') {
          currentLevel = 60;
          sessionData = { step: 'first_name' };
          return `USAjILI\nJina la kwanza:`;
        } else if (input === '7') {
          currentLevel = 70;
          return `MSAADA\nSoko la Wakulima linakusaidia kuuza mazao yako bila dalali.\nSimu: 0800123456\n0. Rudi`;
        } else if (input === '0') {
          closeUssdSession("Asante kwa kutembelea. Kwa heri!");
          return "";
        }
        return `Chaguo sio sahihi.\n\n` + SwahiliUSSD[0].text;
      }
    },
    // 10: Mavuno Yangu (My Harvest)
    10: {
      text: `MAVUNO YANGU\n1. Onyesha Mavuno\n2. Ongeza Mzigo\n3. Badilisha Bei\n0. Rudi`,
      handle: (input) => {
        if (input === '1') {
          if (sessionData.registeredCrops && sessionData.registeredCrops.length > 0) {
            let msg = "MAVUNO YANGU:\n";
            sessionData.registeredCrops.forEach((c, idx) => {
              msg += `${idx+1}. ${c.crop}: ${c.weight}kg @ ${c.price} TZS\n`;
            });
            msg += "\n0. Rudi";
            return msg;
          }
          return `Huna mzigo wowote ghalani.\n\n1. Ongeza Mzigo sasa\n0. Rudi`;
        } else if (input === '2' || (input === '1' && !sessionData.registeredCrops)) {
          currentLevel = 11;
          sessionData.newCrop = {};
          return `ONGEZA MZIGO\nJina la zao (mfano: Korosho):`;
        } else if (input === '3') {
          return `Huna ruhusa ya kubadilisha bei kwa sasa.\n\n0. Rudi`;
        } else if (input === '0') {
          currentLevel = 0;
          return SwahiliUSSD[0].text;
        }
        return `Chaguo sio sahihi.\n` + SwahiliUSSD[10].text;
      }
    },
    // 11: Adding crop step 1
    11: {
      handle: (input) => {
        if (!sessionData.newCrop) sessionData.newCrop = {};
        sessionData.newCrop.crop = input;
        currentLevel = 12;
        return `Weka Uzito (kg):`;
      }
    },
    // 12: Adding crop weight
    12: {
      handle: (input) => {
        const weight = parseInt(input);
        if (isNaN(weight) || weight <= 0) return `Tafadhali weka uzito kwa namba.\nUzito (kg):`;
        sessionData.newCrop.weight = weight;
        currentLevel = 13;
        return `Weka Bei kwa Kilo (TZS):`;
      }
    },
    // 13: Adding crop price
    13: {
      handle: (input) => {
        const price = parseInt(input);
        if (isNaN(price) || price <= 0) return `Tafadhali weka bei kwa namba.\nBei kwa Kilo (TZS):`;
        sessionData.newCrop.price = price;
        
        // Save
        if (!sessionData.registeredCrops) sessionData.registeredCrops = [];
        sessionData.registeredCrops.push(sessionData.newCrop);
        
        currentLevel = 10;
        return `Mzigo umesajiliwa kikamilifu!\n\n${SwahiliUSSD[10].text}`;
      }
    },
    // 20: Wateja
    20: {
      text: `WATEJA\n1. Wanaohitaji Mazao\n2. Karibu Nami\n0. Rudi`,
      handle: (input) => {
        if (input === '1') {
          return `WATEJA TAYARI:\n1. Juma (Dodoma) - Alizeti\n2. Amina (Dar) - Mpunga\n3. Bahati (Mwanza) - Pamba\n\n0. Rudi`;
        } else if (input === '2') {
          return `WATEJA KARIBU NAMI:\n1. Cooperatives (Mtwara) - Korosho\n2. Export Co (Tanga) - Chai\n\n0. Rudi`;
        } else if (input === '0') {
          currentLevel = 0;
          return SwahiliUSSD[0].text;
        }
        return SwahiliUSSD[20].text;
      }
    },
    // 30: Bei Sokoni
    30: {
      text: `BEI SOKONI\n1. Bei za Mazao Yangu\n2. Yenye Bei Njema\n0. Rudi`,
      handle: (input) => {
        if (input === '1') {
          return `BEI YAKO:\nKahawa: 4,800 TZS\nKorosho: 3,200 TZS\n\n0. Rudi`;
        } else if (input === '2') {
          return `BEI NJEMA TZS/KG:\n1. Karafuu: 16,500\n2. Kahawa: 4,800\n3. Korosho: 3,400\n\n0. Rudi`;
        } else if (input === '0') {
          currentLevel = 0;
          return SwahiliUSSD[0].text;
        }
        return SwahiliUSSD[30].text;
      }
    },
    // 40: Hali ya hewa
    40: {
      text: `HALI YA HEWA\n1. Leo\n2. Kesho\n3. Maelekezo ya Kupanda\n0. Rudi`,
      handle: (input) => {
        if (input === '1') {
          return `LEO (Arusha):\nJoto: 19-24C\nHali: Mawingu mepesi\nMvua: Inawezekana\n\n0. Rudi`;
        } else if (input === '2') {
          return `KESHO:\nJoto: 20-25C\nHali: Jua la wastani\n\n0. Rudi`;
        } else if (input === '3') {
          return `KUPANDA:\nKilimanjaro: Kahawa/Maharage\nDodoma: Alizeti/Mtama\n\n0. Rudi`;
        } else if (input === '0') {
          currentLevel = 0;
          return SwahiliUSSD[0].text;
        }
        return SwahiliUSSD[40].text;
      }
    },
    // 50: Maagizo (Orders)
    50: {
      text: `MAAGIZO YAKO\n1. Mapya (Pending)\n2. Yaliyotolewa (Delivered)\n0. Rudi`,
      handle: (input) => {
        if (input === '1') {
          return `HUNA AGIZO JIPYA KWA SASA.\n\n0. Rudi`;
        } else if (input === '2') {
          return `MAAGIZO YALIYOPITA:\n- Sacks 10 za Mahindi (Completed)\n\n0. Rudi`;
        } else if (input === '0') {
          currentLevel = 0;
          return SwahiliUSSD[0].text;
        }
        return SwahiliUSSD[50].text;
      }
    },
    // 60: Registration Swahili Flow
    60: {
      handle: (input) => {
        const step = sessionData.step;
        if (step === 'first_name') {
          sessionData.first_name = input;
          sessionData.step = 'last_name';
          return `Jina la mwisho:`;
        } else if (step === 'last_name') {
          sessionData.last_name = input;
          sessionData.step = 'region';
          return `Mkoa wako (e.g. Arusha):`;
        } else if (step === 'region') {
          sessionData.region = input;
          sessionData.step = 'district';
          return `Wilaya yako:`;
        } else if (step === 'district') {
          sessionData.district = input;
          sessionData.step = 'farm_size';
          return `Ukubwa wa Shamba (Ekari, mfano: 5):`;
        } else if (step === 'farm_size') {
          sessionData.farm_size = input;
          sessionData.step = 'crops';
          return `Mazao makuu unayolima (Kahawa, Mpunga):`;
        } else if (step === 'crops') {
          sessionData.crops = input;
          const fullName = `${sessionData.first_name} ${sessionData.last_name}`;
          currentLevel = 0;
          return `USAJILI UMEKAMILIKA!\n\nKaribu ${fullName} wa ${sessionData.district}, ${sessionData.region}.\n\nBonyeza Tuma kurejea orodha kuu.`;
        }
        currentLevel = 0;
        return SwahiliUSSD[0].text;
      }
    },
    // 70: Help back route
    70: {
      handle: (input) => {
        if (input === '0') {
          currentLevel = 0;
          return SwahiliUSSD[0].text;
        }
        return `MSAADA\nSoko la Wakulima linakusaidia kuuza mazao yako bila dalali.\nSimu: 0800123456\n0. Rudi`;
      }
    }
  };

  // Dialing Action
  dialBtn.addEventListener('click', async () => {
    const inputVal = ussdDialInput.value.trim();
    if (inputVal === '*384*1234#') {
      dialerView.classList.add('hidden');
      menuView.classList.remove('hidden');
      sessionActive = true;
      currentLevel = 0;
      
      // Try to sync with backend if running under Python Flask environment
      try {
        const response = await fetch('/api/ussd/receive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId,
            phoneNumber: phoneNumber,
            text: ''
          })
        });
        if (response.ok) {
          const data = await response.json();
          ussdOutputText.textContent = data.USSDResponse;
          return;
        }
      } catch (err) {
        console.log("Backend offline, loading client-side simulation.");
      }
      
      // Fallback local simulation
      ussdOutputText.textContent = SwahiliUSSD[0].text;
      ussdResponseInput.focus();
    }
  });

  // Sending USSD Response Action
  async function handleUssdSend() {
    if (!sessionActive) return;
    
    const val = ussdResponseInput.value.trim();
    ussdResponseInput.value = '';
    
    if (val === '') return;

    // Try to sync with backend if running
    try {
      const response = await fetch('/api/ussd/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          phoneNumber: phoneNumber,
          text: val
        })
      });
      if (response.ok) {
        const data = await response.json();
        ussdOutputText.textContent = data.USSDResponse;
        if (!data.continueSession) {
          closeUssdSession("Session imeisha. Asante!");
        }
        return;
      }
    } catch (err) {
      // Local fallback
    }

    // Local simulation logic
    let nextText = "";
    if (SwahiliUSSD[currentLevel] && SwahiliUSSD[currentLevel].handle) {
      nextText = SwahiliUSSD[currentLevel].handle(val);
    } else {
      nextText = SwahiliUSSD[0].handle(val);
    }

    if (sessionActive) {
      ussdOutputText.textContent = nextText;
      ussdResponseInput.focus();
    }
  }

  sendUssdBtn.addEventListener('click', handleUssdSend);
  
  ussdResponseInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUssdSend();
    }
  });

  // Cancel Session Action
  cancelUssdBtn.addEventListener('click', () => {
    closeUssdSession("Session imebatilishwa.");
  });

  // Home Screen / Physical Power button simulator resets
  phoneHomeBtn.addEventListener('click', () => {
    closeUssdSession();
  });

  function closeUssdSession(msg = "") {
    sessionActive = false;
    currentLevel = 0;
    ussdOutputText.textContent = msg || "Piga namba kuanza tena.";
    
    setTimeout(() => {
      dialerView.classList.remove('hidden');
      menuView.classList.add('hidden');
    }, 1500);
  }
}

// =====================================================
// PREMIUM EXTENDED CAPABILITIES (DARK MODE, SVG, PERSONA, LOGISTICS)
// =====================================================

// Global State
window.currentPersona = {
  id: 1,
  role: 'farmer',
  name: 'Juma Moshi',
  phone: '+255712345678',
  balance: 120000
};

// Initialize premium elements on load
document.addEventListener('DOMContentLoaded', () => {
  restoreDarkModeState();
  updateNavWalletDisplay();
  initTransportersConsole();
  initEscrowContractsMonitor();
});

// 1. DYNAMIC DARK MODE STATE MANAGEMENT
function restoreDarkModeState() {
  const checkboxTheme = document.getElementById('checkboxTheme');
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');
    if (checkboxTheme) checkboxTheme.checked = true;
  }
}

function toggleDarkMode() {
  const checkboxTheme = document.getElementById('checkboxTheme');
  if (checkboxTheme && checkboxTheme.checked) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
}

// 2. SIMULATED PERSONA AND WALLET SWITCHER
function togglePersonaDropdown() {
  const dropdown = document.getElementById('personaDropdown');
  if (dropdown) dropdown.classList.toggle('show');
}

// Close persona switcher when clicking outside
document.addEventListener('click', (e) => {
  const wrapper = document.querySelector('.persona-switcher-wrapper');
  const dropdown = document.getElementById('personaDropdown');
  if (dropdown && wrapper && !wrapper.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

function selectPersona(id, role, name, phone, balance) {
  window.currentPersona = { id, role, name, phone, balance };
  
  // Update nav buttons
  const personaNameText = document.getElementById('currentPersonaName');
  if (personaNameText) personaNameText.textContent = `${name} (${role.toUpperCase()})`;
  
  // Highlight active option
  const options = document.querySelectorAll('.persona-option');
  options.forEach((opt, idx) => {
    opt.classList.remove('active');
    if (idx + 1 === id) opt.classList.add('active');
  });
  
  updateNavWalletDisplay();
  
  // Close dropdown
  const dropdown = document.getElementById('personaDropdown');
  if (dropdown) dropdown.classList.remove('show');
  
  // Reset active USSD phone session to match new phone number!
  const simulator = document.getElementById('ussdScreenContent');
  if (simulator) {
    // Dynamically update simulated phone details
    const label = document.querySelector('.dialer-label');
    if (label) label.textContent = `Piga namba ya USSD (${name}):`;
  }
}

function updateNavWalletDisplay() {
  const balanceText = document.getElementById('navWalletBalance');
  if (balanceText) {
    balanceText.textContent = parseInt(window.currentPersona.balance).toLocaleString();
  }
}

// 3. INTERACTIVE SVG PRICE CHART GENERATOR
function showSvgChart(crop, region, basePrice) {
  const modal = document.getElementById('svgChartModal');
  const title = document.getElementById('svgChartTitle');
  
  if (!modal || !title) return;
  
  title.innerHTML = `📈 Historia ya Bei – ${crop} (${region})`;
  modal.classList.add('show');
  
  // Generate simulated 7-day historical prices based on today's price
  const prices = [];
  let currentVal = basePrice;
  
  for (let i = 0; i < 7; i++) {
    // Generate slight standard deviations representing historical trends
    const fluctuation = (Math.random() - 0.4) * (basePrice * 0.05); // -2% to +3% deviation
    currentVal = Math.max(500, Math.round(currentVal - fluctuation));
    prices.unshift(currentVal); // Add to beginning to represent progression
  }
  
  renderSvgTrendChart(prices);
}

function closeSvgChartModal() {
  const modal = document.getElementById('svgChartModal');
  if (modal) modal.classList.remove('show');
}

function closeSvgChartModalOnBackdrop(event) {
  if (event.target.id === 'svgChartModal') closeSvgChartModal();
}

function renderSvgTrendChart(prices) {
  const svg = document.getElementById('trendSvg');
  if (!svg) return;
  
  // Clear any existing svg drawings except <defs>
  const defs = svg.querySelector('defs');
  svg.innerHTML = '';
  svg.appendChild(defs);
  
  const width = 500;
  const height = 220;
  const paddingX = 45;
  const paddingY = 30;
  
  const minPrice = Math.min(...prices) * 0.95;
  const maxPrice = Math.max(...prices) * 1.05;
  const priceRange = maxPrice - minPrice;
  
  // 1. Draw horizontal grid lines and Y-axis labels
  const gridCount = 4;
  for (let i = 0; i <= gridCount; i++) {
    const y = paddingY + (height - 2 * paddingY) * (i / gridCount);
    const priceVal = Math.round(maxPrice - (priceRange * (i / gridCount)));
    
    // Grid Line
    const grid = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    grid.setAttribute('x1', paddingX);
    grid.setAttribute('y1', y);
    grid.setAttribute('x2', width - paddingX);
    grid.setAttribute('y2', y);
    grid.setAttribute('class', 'chart-grid');
    svg.appendChild(grid);
    
    // Y-Axis Label text
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', paddingX - 8);
    label.setAttribute('y', y + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('class', 'chart-axis-text');
    label.textContent = priceVal.toLocaleString();
    svg.appendChild(label);
  }
  
  // 2. Map coordinates for price trend points
  const points = [];
  const totalDays = prices.length;
  
  for (let i = 0; i < totalDays; i++) {
    const x = paddingX + (width - 2 * paddingX) * (i / (totalDays - 1));
    const y = height - paddingY - ((prices[i] - minPrice) / priceRange) * (height - 2 * paddingY);
    points.push({ x, y, price: prices[i], dayIndex: i });
  }
  
  // 3. Create smooth cubic bezier or direct path
  let pathD = '';
  let areaD = `M ${points[0].x} ${height - paddingY} `;
  
  points.forEach((p, idx) => {
    if (idx === 0) {
      pathD += `M ${p.x} ${p.y} `;
      areaD += `L ${p.x} ${p.y} `;
    } else {
      pathD += `L ${p.x} ${p.y} `;
      areaD += `L ${p.x} ${p.y} `;
    }
  });
  
  areaD += `L ${points[points.length - 1].x} ${height - paddingY} Z`;
  
  // Area fill under graph
  const areaElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  areaElement.setAttribute('d', areaD);
  areaElement.setAttribute('class', 'chart-area');
  svg.appendChild(areaElement);
  
  // Primary Trend Line path
  const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  lineElement.setAttribute('d', pathD);
  lineElement.setAttribute('class', 'chart-line');
  svg.appendChild(lineElement);
  
  // 4. Draw interactive circles and X-axis labels
  const daysLabels = ['Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi', 'Jumapili'];
  
  points.forEach((p) => {
    // Circle Dot
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', p.x);
    dot.setAttribute('cy', p.y);
    dot.setAttribute('r', '6');
    dot.setAttribute('class', 'chart-dot');
    
    // Setup mouse interactions for premium tooltips!
    dot.addEventListener('mouseenter', (e) => {
      const tooltip = document.getElementById('chartTooltip');
      if (tooltip) {
        tooltip.innerHTML = `<strong>${daysLabels[p.dayIndex]}</strong><br/>💰 ${p.price.toLocaleString()} TZS/kg`;
        tooltip.style.opacity = '1';
        tooltip.style.left = `${e.offsetX + 15}px`;
        tooltip.style.top = `${e.offsetY - 20}px`;
      }
    });
    
    dot.addEventListener('mouseleave', () => {
      const tooltip = document.getElementById('chartTooltip');
      if (tooltip) tooltip.style.opacity = '0';
    });
    
    svg.appendChild(dot);
    
    // X-Axis day text label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', p.x);
    label.setAttribute('y', height - paddingY + 18);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('class', 'chart-axis-text');
    // Short labels
    label.textContent = daysLabels[p.dayIndex].substring(0, 4);
    svg.appendChild(label);
  });
}

// 4. LOGISTICS & TRANSPORTERS REGISTRATION ENGINE
const MOCK_TRANSPORTERS = [
  { first_name: 'Hamis', last_name: 'Bakari', phone_number: '+255700000003', vehicle_type: 'Fuso Truck', license_plate: 'T 882 DGA', region: 'Mtwara', status: 'active' },
  { first_name: 'Idd', last_name: 'Salum', phone_number: '+255711223344', vehicle_type: 'Canter Truck', license_plate: 'T 119 CKM', region: 'Arusha', status: 'active' },
  { first_name: 'Mussa', last_name: 'Juma', phone_number: '+255715888123', vehicle_type: 'Pickup Truck', license_plate: 'T 432 ASB', region: 'Dodoma', status: 'pending' }
];

async function initTransportersConsole() {
  const listContainer = document.getElementById('transportersList');
  if (!listContainer) return;
  
  let transporters = [...MOCK_TRANSPORTERS];
  
  // Attempt to fetch from active Flask backend API
  try {
    const response = await fetch('/api/transporter/list');
    if (response.ok) {
      const dbTransporters = await response.json();
      if (dbTransporters && dbTransporters.length > 0) {
        // Merge list with unique database registers
        dbTransporters.forEach(dbTp => {
          if (!transporters.some(tp => tp.phone_number === dbTp.phone_number)) {
            transporters.unshift(dbTp);
          }
        });
      }
    }
  } catch (err) {
    console.log("Transporters backend offline, utilizing simulated static registries.");
  }
  
  renderTransporters(transporters);
}

function renderTransporters(transporters) {
  const listContainer = document.getElementById('transportersList');
  if (!listContainer) return;
  
  listContainer.innerHTML = transporters.map(tp => {
    const statusLabel = tp.status === 'active' ? '✓ Thabiti' : tp.status === 'pending' ? '⏳ Pending' : '🚫 Inactive';
    return `
      <div class="transporter-row">
        <div class="tp-info">
          <h4>🚚 ${tp.first_name} ${tp.last_name} (${tp.license_plate})</h4>
          <span>Aina: ${tp.vehicle_type} • Mkoa: <strong>${tp.region}</strong></span>
        </div>
        <div>
          <span class="tp-badge-status tp-status-${tp.status}">${statusLabel}</span>
        </div>
      </div>
    `;
  }).join('');
}

function showTpRegModal() {
  const modal = document.getElementById('tpRegModal');
  if (modal) modal.classList.add('show');
}

function closeTpRegModal() {
  const modal = document.getElementById('tpRegModal');
  if (modal) modal.classList.remove('show');
}

function closeTpRegModalOnBackdrop(event) {
  if (event.target.id === 'tpRegModal') closeTpRegModal();
}

async function handleTpRegSubmit(event) {
  event.preventDefault();
  
  const firstName = document.getElementById('tpFirstName').value.trim();
  const lastName = document.getElementById('tpLastName').value.trim();
  const phone = document.getElementById('tpPhone').value.trim();
  const license = document.getElementById('tpLicense').value.trim();
  const vehicle = document.getElementById('tpVehicle').value;
  const region = document.getElementById('tpRegion').value;
  const district = document.getElementById('tpDistrict').value.trim();
  
  const errorBox = document.getElementById('tpRegError');
  const successBox = document.getElementById('tpRegSuccess');
  
  if (errorBox) errorBox.classList.add('hidden');
  if (successBox) successBox.classList.add('hidden');
  
  const payload = {
    first_name: firstName,
    last_name: lastName,
    phone_number: phone,
    license_plate: license,
    vehicle_type: vehicle,
    region: region,
    district: district
  };
  
  // Submit to Flask API
  try {
    const response = await fetch('/api/transporter/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      if (successBox) {
        successBox.textContent = "Usajili umewasilishwa! Wasafirishaji wanasubiri idhini ya Admin.";
        successBox.classList.remove('hidden');
      }
      setTimeout(() => {
        closeTpRegModal();
        initTransportersConsole();
      }, 2000);
      return;
    } else {
      const data = await response.json();
      if (errorBox) {
        errorBox.textContent = data.error || "Kosa limejitokeza. Tafadhali jaribu tena.";
        errorBox.classList.remove('hidden');
      }
      return;
    }
  } catch (err) {
    // Fallback simulation register if server is offline
    MOCK_TRANSPORTERS.unshift({
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
      license_plate: license,
      vehicle_type: vehicle,
      region: region,
      status: 'pending'
    });
    
    if (successBox) {
      successBox.textContent = "Mfanowe: Msafirishaji amesajiliwa kikamilifu katika Virtual Sandbox.";
      successBox.classList.remove('hidden');
    }
    setTimeout(() => {
      closeTpRegModal();
      initTransportersConsole();
    }, 2000);
  }
}

// 5. ACTIVE ESCROW CONTRACTS MONITOR & MOBILE MONEY SIMULATOR
const MOCK_ESCROWS = [
  { id: 104, buyer: 'Neema Shayo', crop: 'Kahawa (Coffee)', amount: 480000, status: 'held' },
  { id: 102, buyer: 'Juma Traders', crop: 'Alizeti (Sunflower)', amount: 150000, status: 'released' }
];

function initEscrowContractsMonitor() {
  const list = document.getElementById('activeEscrowList');
  if (!list) return;
  
  list.innerHTML = MOCK_ESCROWS.map(esc => {
    const statusText = esc.status === 'held' ? '🔒 Locked (Held)' : '✓ Released';
    const statusClass = esc.status === 'held' ? 'escrow-val-held' : 'escrow-val-released';
    return `
      <div class="escrow-row">
        <div>
          <strong>Mkataba #${esc.id}</strong><br/>
          <small>Mteja: ${esc.buyer} • Bidhaa: ${esc.crop}</small>
        </div>
        <div class="text-right">
          <span class="${statusClass}">${statusText}</span><br/>
          <small>${parseInt(esc.amount).toLocaleString()} TZS</small>
        </div>
      </div>
    `;
  }).join('');
}

// Mobile Money push dialog sandbox triggers
let currentPaymentCallback = null;
let currentPaymentAmount = 0;

function triggerPushPaymentSimulation(amount, callback) {
  const modal = document.getElementById('pushPromptModal');
  const msg = document.getElementById('pushPromptMessage');
  
  if (!modal || !msg) return;
  
  currentPaymentAmount = amount;
  currentPaymentCallback = callback;
  
  msg.innerHTML = `Tafadhali ingiza PIN yako ya Vodacom M-Pesa kuidhinisha malipo ya <strong>${parseInt(amount).toLocaleString()} TZS</strong> kwenda kwa <strong>Soko la Wakulima</strong> (Escrow Service).`;
  
  modal.classList.add('show');
  
  const pin = document.getElementById('pushPinField');
  if (pin) {
    pin.value = '';
    pin.focus();
  }
}

function closePushPromptModal() {
  const modal = document.getElementById('pushPromptModal');
  if (modal) modal.classList.remove('show');
}

function closePushPromptModalOnBackdrop(event) {
  if (event.target.id === 'pushPromptModal') closePushPromptModal();
}

function confirmPushPayment() {
  const pin = document.getElementById('pushPinField').value;
  if (pin.length !== 4) {
    alert("Tafadhali ingiza PIN sahihi yenye namba 4.");
    return;
  }
  
  closePushPromptModal();
  
  // Deduct from virtual persona balance
  if (window.currentPersona.balance >= currentPaymentAmount) {
    window.currentPersona.balance -= currentPaymentAmount;
    updateNavWalletDisplay();
    
    // Add to simulated active escrows
    MOCK_ESCROWS.unshift({
      id: Math.floor(Math.random() * 500) + 200,
      buyer: window.currentPersona.name,
      crop: 'Mazao ya Shamba',
      amount: currentPaymentAmount,
      status: 'held'
    });
    
    initEscrowContractsMonitor();
    
    if (typeof currentPaymentCallback === 'function') {
      currentPaymentCallback(true);
    }
  } else {
    alert("Salio lako halitoshi kwenye virtual wallet kukamilisha malipo.");
    if (typeof currentPaymentCallback === 'function') {
      currentPaymentCallback(false);
    }
  }
}

// Intercept payments inside client USSD simulator sandbox if they top up or escrow
// Let's monkey patch fetch requests to intercept payment checks!
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const url = args[0];
  const config = args[1];
  
  if (url === '/api/ussd/receive' && config && config.body) {
    const payload = JSON.parse(config.body);
    // If the input is '1' on active level 51 (payment action trigger)
    // We can show the interactive push notification modal!
    if (payload.text === '1' && typeof ussdOutputText !== 'undefined' && ussdOutputText.textContent.includes('1. Lipia sasa')) {
      const match = ussdOutputText.textContent.match(/Jumla:\s*([\d,]+)\s*TZS/);
      if (match) {
        const amount = parseInt(match[1].replace(/,/g, ''));
        // Trigger simulated push prompt!
        triggerPushPaymentSimulation(amount, () => {
          // Callback proceeds with sending payload to backend
          originalFetch.apply(this, args).then(res => {
            if (res.ok) {
              res.clone().json().then(data => {
                ussdOutputText.textContent = data.USSDResponse;
              });
            }
          });
        });
        
        // Return a mock response representing wait
        return new Response(JSON.stringify({
          USSDResponse: "Malipo yanashughulikiwa kwenye simu yako...",
          sessionId: payload.sessionId,
          continueSession: true
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    }
  }
  
  return originalFetch.apply(this, args);
};

