const BASE_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

const dropdowns = document.querySelectorAll(".dropdown select");
const form = document.querySelector("#converterForm");
const amountInput = document.querySelector("#amount");
const fromCurr = document.querySelector("#from");
const toCurr = document.querySelector("#to");
const fromFlag = document.querySelector("#fromFlag");
const toFlag = document.querySelector("#toFlag");
const msg = document.querySelector("#msg");
const btn = document.querySelector("#convertBtn");
const swapBtn = document.querySelector("#swap");


for (const select of dropdowns) {
  for (const currCode of Object.keys(countryList)) {
    const option = document.createElement("option");
    option.value = currCode;
    option.textContent = currCode;

    if (select.name === "from" && currCode === "USD") {
      option.selected = true;
    }
    if (select.name === "to" && currCode === "INR") {
      option.selected = true;
    }

    select.appendChild(option);
  }

  select.addEventListener("change", () => {
    updateFlag(select);
    updateExchangeRate();
  });
}


function updateFlag(selectElement) {
  const countryCode = countryList[selectElement.value];
  const flagURL = `https://flagsapi.com/${countryCode}/flat/64.png`;

  if (selectElement === fromCurr) {
    fromFlag.src = flagURL;
    fromFlag.alt = `${selectElement.value} flag`;
  } else {
    toFlag.src = flagURL;
    toFlag.alt = `${selectElement.value} flag`;
  }
}


async function updateExchangeRate() {
  const amountText = amountInput.value.trim();
  const amount = Number(amountText);

  if (amountText === "" || !Number.isFinite(amount) || amount <= 0) {
    msg.textContent = "Please enter an amount greater than 0.";
    return;
  }

  const from = fromCurr.value.toLowerCase();
  const to = toCurr.value.toLowerCase();

  btn.disabled = true;
  msg.textContent = "Getting exchange rate...";

  try {
    if (from === to) {
      msg.textContent = `${amount} ${fromCurr.value} = ${amount} ${toCurr.value}`;
      return;
    }

    const response = await fetch(`${BASE_URL}/${from}.json`);
    if (!response.ok) {
      throw new Error("Could not fetch exchange-rate data.");
    }

    const data = await response.json();
    const rate = data[from]?.[to];

    if (typeof rate !== "number" || !Number.isFinite(rate)) {
      throw new Error("Exchange rate not found.");
    }

    const result = amount * rate;
    const formattedResult = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 4
    }).format(result);

    msg.textContent =
      `${amount} ${fromCurr.value} = ${formattedResult} ${toCurr.value}`;
    msg.title = `1 ${fromCurr.value} = ${rate} ${toCurr.value}`;
  } catch (error) {
    console.error("Currency conversion error:", error);
    msg.textContent =
      "Could not get the exchange rate. Check your internet and try again.";
  } finally {
    btn.disabled = false;
  }
}


form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateExchangeRate();
});


function swapCurrencies() {
  const previousFrom = fromCurr.value;
  fromCurr.value = toCurr.value;
  toCurr.value = previousFrom;

  updateFlag(fromCurr);
  updateFlag(toCurr);
  updateExchangeRate();
}

swapBtn.addEventListener("click", swapCurrencies);
swapBtn.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    swapCurrencies();
  }
});


updateFlag(fromCurr);
updateFlag(toCurr);
updateExchangeRate();
