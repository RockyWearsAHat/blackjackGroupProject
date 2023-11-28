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
      console.log(json);
      const cardCode = json.cards[0].code;
      await addCardToHand(deck, cardCode, handToAssign);
    } else {
      return new Error("Error Drawing Card");
    }
  } else {
    return new Error("Error Drawing Card");
  }
};

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
      if (handToAssign == users.PLAYER) {
        getUserHand(deck, handToAssign);
      }
    } else {
      return new Error("Error Adding Card To Hand");
    }
  } else {
    return new Error("Error Adding Card To Hand");
  }
};

const userHand = document.getElementById("player1-cards-container");
const dealerHand = document.getElementById("dealer-cards-container");
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
      if (user == users.PLAYER) {
        const li = document.createElement("li");
        li.id = `playerCard${json.piles.player.cards.length - 1}`;
        li.classList = "card hidden";
        li.innerHTML = `<img src="https://www.deckofcardsapi.com/static/img/back.png" class="cardBack"/><img src="${
          json.piles.player.cards[json.piles.player.cards.length - 1].image
        }" class="cardFront"/>`;
        userHand.appendChild(li);

        gsap.utils.toArray(".card").forEach(function (card) {
          gsap.set(card, {
            transformStyle: "preserve-3d",
            transformPerspective: 1000,
          });
          const q = gsap.utils.selector(card);
          const front = q(".cardFront");
          const back = q(".cardBack");

          gsap.set(back, { rotationY: -180 });

          const tl = gsap
            .timeline({ paused: true })
            .to(front, { duration: 1, rotationY: 180 })
            .to(back, { duration: 1, rotationY: 0 }, 0)
            .to(card, { z: 50 }, 0)
            .to(card, { z: 0 }, 0.5);
          card.addEventListener("mouseenter", function () {
            tl.play();
          });
          card.addEventListener("mouseleave", function () {
            tl.reverse();
          });
        });

        json.piles.player.cards[json.piles.player.cards.length - 1].image;
      } else if (user == users.DEALER) {
        console.log(json.piles.dealer.cards.length - 1);
        console.log(
          json.piles.dealer.cards[json.piles.dealer.cards.length - 1].image
        );
      }
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

  await shuffleDeck(newDeck, false);

  await drawCard(newDeck, 1, users.PLAYER);
  await drawCard(newDeck, 1, users.DEALER);
  await drawCard(newDeck, 1, users.PLAYER);
  await drawCard(newDeck, 1, users.DEALER);
};

startGame();
