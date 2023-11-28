//STORE A GLOBAL VARIABLE FOR THE DECKID SO A NEW DECK IS NOT GENERATED EVERY RELOAD
const globalDeckId = sessionStorage.getItem("deckId");

const users = {
  PLAYER: "player",
  DEALER: "dealer",
};

const getNewDeck = async () => {
  if (globalDeckId) return globalDeckId;

  const res = await fetch(
    "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
  );
  if (res.ok) {
    const json = await res.json();

    if (json.success) {
      sessionStorage.setItem("deckId", json.deck_id);
      return json.deck_id;
    } else {
      return new Error("Error Creating Deck");
    }
  } else {
    return new Error("Error Creating Deck");
  }
};

const shuffleDeck = async (
  deck = new String(null),
  shuffleRemaining = false
) => {
  if (!deck) {
    return new Error("Error Shuffling Deck, DECK ID MUST BE DECLARED");
  }
  let res;
  if (!shuffleRemaining) {
    res = await fetch(`https://deckofcardsapi.com/api/deck/${deck}/shuffle/`);
  } else {
    res = await fetch(
      `https://deckofcardsapi.com/api/deck/${deck}/shuffle/?remaining=true`
    );
  }
  if (res.ok) {
    const json = await res.json();

    if (json.success) {
      console.log(json);
    } else {
      return new Error("Error Shuffling Deck");
    }
  } else {
    return new Error("Error Shuffling Deck");
  }
};

const drawCard = async (
  deck = new String(null),
  count = 1,
  handToAssign = users
) => {
  if (!deck) {
    return new Error("Error Drawing Card, DECK ID MUST BE DECLARED");
  }
  const res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deck}/draw/?count=${count}`
  );
  if (res.ok) {
    const json = await res.json();

    if (json.success) {
      const cardCode = json.cards[0].code;
      await addCardToHand(deck, cardCode, handToAssign);
    } else {
      return new Error("Error Drawing Card");
    }
  } else {
    return new Error("Error Drawing Card");
  }
};

const userHand = document.getElementById("player1-cards-container");
const dealerHand = document.getElementById("dealer-cards-container");
const addCardToHand = async (
  deck = "",
  cardCode = "",
  handToAssign = undefined
) => {
  if (!deck || !cardCode || !handToAssign)
    return new Error(
      "Error Adding Card To Hand, DECK, CARD CODE, AND HAND MUST BE PASSED"
    );

  const res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deck}/pile/${handToAssign}/add/?cards=${cardCode}`
  );
  if (res.ok) {
    const json = await res.json();

    if (json.success) {
      console.log(json);

      if (handToAssign === users.PLAYER) {
        let newCard = document.createElement("div");
        newCard.innerHTML = `<img src="${}"/><img src="${}"/>`
      } else {
        console.log("adding to dealer");
      }
    } else {
      return new Error("Error Adding Card To Hand");
    }
  } else {
    return new Error("Error Adding Card To Hand");
  }
};

const getUserHand = async (deck = "", user = users) => {
  if (!deck || !user) {
    return new Error("Error Getting Hand, DECK ID AND USER MUST BE DECLARED");
  }
  const res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deck}/pile/${user}/list/`
  );
  if (res.ok) {
    const json = await res.json();

    if (json.success) {
      console.log(json);
    } else {
      return new Error("Error Getting Hand");
    }
  } else {
    return new Error("Error Getting Hand");
  }
};

const getHand = async (deck = "") => {};

const startGame = async () => {
  const newDeck = await getNewDeck();
  console.log(newDeck);

  await shuffleDeck(newDeck, false);

  await drawCard(newDeck, 1, users.PLAYER);
  await drawCard(newDeck, 1, users.DEALER);
  await drawCard(newDeck, 1, users.PLAYER);
  await drawCard(newDeck, 1, users.DEALER);

  await getUserHand(newDeck, users.DEALER);
};

startGame();
