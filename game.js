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
      // console.log(json);
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
      // console.log(json);
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
      // console.log(json);
      if (handToAssign == users.PLAYER) {
        getUserHand(deck, handToAssign);
      } else {
        const li = document.createElement("li");
        li.id = `dealerCard${json.piles.dealer.remaining - 1}`;
        li.classList = "card dealerCard";
        li.innerHTML = `<img src="https://www.deckofcardsapi.com/static/img/back.png" class="cardBack"/><img src="" class="cardFront"/>`;
        dealerHand.appendChild(li);
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
      if (user == users.PLAYER) {
        const li = document.createElement("li");
        li.id = `playerCard${json.piles.player.cards.length - 1}`;
        li.classList = "card playerCard";
        li.innerHTML = `<img src="https://www.deckofcardsapi.com/static/img/back.png" class="cardBack"/><img src="${
          json.piles.player.cards[json.piles.player.cards.length - 1].image
        }" class="cardFront"/>`;
        userHand.appendChild(li);
      } else if (user == users.DEALER) {
        for (let i = 0; i < json.piles.dealer.cards.length; i++) {
          const currentCardWrapper = document.getElementById(`dealerCard${i}`);
          // console.log(json.piles.dealer.cards);
          currentCardWrapper.children[1].src = json.piles.dealer.cards[i].image;
        }
      }
    } else {
      return new Error("Error Getting Hand");
    }
  } else {
    return new Error("Error Getting Hand");
  }
};

const flipDealerHand = (deck, show = true) => {
  getUserHand(deck, users.DEALER);

  //SELECT ALL ELEMENTS THAT HAVE CLASS .CARD AND RUN A FUNCTION ON THEM
  const dealerCards = gsap.utils.toArray(".dealerCard");
  flipSelectedCards(dealerCards, show);
};

const flipSelectedCards = (card, show = true) => {
  if (card.length > 1) {
    console.log("running array");
    card.forEach((card) => {
      gsap.set(card, {
        transformStyle: "preserve-3d",
        transformPerspective: 1000,
      });
      //SELECT THE FRONT AND BACK IMAGES FROM THE CARD
      const q = gsap.utils.selector(card);
      const front = q(".cardFront");
      const back = q(".cardBack");

      gsap.set(back, { rotationY: 0 });
      gsap.set(front, { rotationY: 180 });
      const tl = gsap
        .timeline({ paused: true })
        .to(front, { duration: 1, rotationY: 0 })
        .to(back, { duration: 1, rotationY: -180 }, 0)
        .to(card, { z: 50 }, 0)
        .to(card, { z: 0 }, 0.5);

      if (show) {
        tl.play();
      } else {
        tl.reverse(0);
      }
    });
  } else {
    gsap.set(card, {
      transformStyle: "preserve-3d",
      transformPerspective: 1000,
    });
    //SELECT THE FRONT AND BACK IMAGES FROM THE CARD
    const q = gsap.utils.selector(card);
    const front = q(".cardFront");
    const back = q(".cardBack");

    //
    gsap.set(back, { rotationY: 0 });
    gsap.set(front, { rotationY: 180 });
    const tl = gsap
      .timeline({ paused: true })
      .to(front, { duration: 1, rotationY: 0 })
      .to(back, { duration: 1, rotationY: -180 }, 0)
      .to(card, { z: 50 }, 0)
      .to(card, { z: 0 }, 0.5);

    if (show) {
      console.log("showing");
      tl.play();
    } else {
      console.log("reversing");
      tl.reverse(0);
    }
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

  setTimeout(() => {
    flipDealerHand(newDeck, true);

    setTimeout(() => {
      const dealerCard2 = document.getElementById("dealerCard1");
      flipSelectedCards(dealerCard2, false);
    }, 3000);
  }, 500);
};

startGame();
