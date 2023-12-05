//STORE A GLOBAL VARIABLE FOR THE DECKID SO A NEW DECK IS NOT GENERATED EVERY RELOAD



const globalDeckId = sessionStorage.getItem("deckId");

let gameOver = false;

const users = {
  PLAYER: "player",
  DEALER: "dealer",
};

const userHand = document.getElementById("player1-cards-container");
const dealerHand = document.getElementById("dealer-cards-container");

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
      return new Response(json);
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
      return new Response(json);
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
        return new Response(await getUserHand(deck, handToAssign));
      } else {
        const li = document.createElement("li");
        li.id = `dealerCard${json.piles.dealer.remaining - 1}`;
        li.classList = "card dealerCard hidden";
        li.innerHTML = `<img src="https://www.deckofcardsapi.com/static/img/back.png" class="cardBack"/><img src="" class="cardFront"/>`;
        dealerHand.appendChild(li);
        return new Response(json.piles.dealer.remaining - 1);
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
          if (!currentCardWrapper.classList.contains("hidden")) {
            currentCardWrapper.children[1].src =
              json.piles.dealer.cards[i].image;
          }
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

const flipSelectedCards = async (card, show = true) => {
  if (Array.isArray(card) && card.length && card.length > 1) {
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
        card.classList.remove("hidden");
        tl.play();
      } else {
        card.classList.add("hidden");
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
      card.classList.remove("hidden");
      tl.play();
    } else {
      card.classList.add("hidden");
      tl.reverse(0);
    }
  }
};

const convertCardCodeToNumber = (cardCode, runningTotal = 0) => {
  switch (cardCode) {
    case "0":
    case "JACK":
    case "QUEEN":
    case "KING":
      return 10;
    case "ACE":
      return 1;
    default:
      return Number(cardCode);
  }
};

const calcHandTotal = async (deck = "", user = users.PLAYER) => {
  if (!deck || !user) {
    return new Error("Error Getting Hand, DECK ID AND USER MUST BE DECLARED");
  }
  const res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deck}/pile/${user}/list/`
  );
  if (res.ok) {
    const json = await res.json();

    let showingHandTotal = 0;
    let handTotal = 0;

    if (json.success) {
      if (user === users.DEALER) {
        for (let i = 0; i < json.piles.dealer.cards.length; i++) {
          if (
            document
              .getElementById(`dealerCard${i}`)
              .classList.contains("hidden")
          ) {
            handTotal += convertCardCodeToNumber(
              json.piles.dealer.cards[i].value,
              handTotal
            );
          } else {
            showingHandTotal += convertCardCodeToNumber(
              json.piles.dealer.cards[i].value,
              showingHandTotal
            );
            handTotal += convertCardCodeToNumber(
              json.piles.dealer.cards[i].value,
              handTotal
            );
          }
        }
      } else {
        for (let i = 0; i < json.piles.player.cards.length; i++) {
          showingHandTotal += convertCardCodeToNumber(
            json.piles.player.cards[i].value,
            showingHandTotal
          );
          handTotal += convertCardCodeToNumber(
            json.piles.player.cards[i].value,
            handTotal
          );
        }
      }

      const elementToModify = document.getElementById(`${user}HandTotal`);
      elementToModify.innerHTML = showingHandTotal;

      if (user == users.DEALER) {
        const dealerCardContainer = document.getElementById(
          "dealer-cards-container"
        );

        let flag = false;
        Object.values(dealerCardContainer.children).forEach((li) => {
          if (li.classList.contains("hidden")) {
            flag = true;
          }
        });

        if (flag) elementToModify.innerHTML += ` ???`;
      }

      if (handTotal == 21) {
        console.log(`${user} has won!`);
        elementToModify.innerHTML = 21;
        gameOver = true;
        return Promise.resolve(handTotal);
      } else if (handTotal > 21) {
        console.log(`${user} has busted!`);
        elementToModify.innerHTML = `${handTotal} / BUST`;
        gameOver = true;
        return Promise.resolve(100);
      } else {
        return Promise.resolve(showingHandTotal);
      }
    } else {
      return new Error("Error Getting Hand");
    }
  } else {
    return new Error("Error Getting Hand");
  }
};

const startGame = async () => {
  const newDeck = await getNewDeck();

  await shuffleDeck(newDeck, false);

  await drawCard(newDeck, 1, users.PLAYER);
  await drawCard(newDeck, 1, users.DEALER);
  await drawCard(newDeck, 1, users.PLAYER);
  await drawCard(newDeck, 1, users.DEALER);

  const card0 = document.getElementById("dealerCard0");
  await flipSelectedCards(card0);
  await getUserHand(newDeck, users.DEALER);

  await flipSelectedCards(gsap.utils.toArray(".playerCard"));

  const dealerRes = await calcHandTotal(newDeck, users.DEALER);
  const playerRes = await calcHandTotal(newDeck, users.PLAYER);

  if (dealerRes === 21 || playerRes === 21) {
    gameOver = true;
    flipDealerHand(newDeck, true);
    await calcHandTotal(newDeck, users.DEALER);
  }

  const hitBtn = document.getElementById("play-again-button");

  const playerCardContainer = document.getElementById(
    "player1-cards-container"
  );

  hitBtn.addEventListener("click", async () => {
    if (!gameOver) {
      await drawCard(newDeck, 1, users.PLAYER);

      setTimeout(async () => {
        await flipSelectedCards(
          playerCardContainer.children[playerCardContainer.children.length - 1]
        );

        const res = await calcHandTotal(newDeck, users.PLAYER);

        console.log(res);
        if (res === 100) {
          setTimeout(async () => {
            flipDealerHand(newDeck, true);
            await calcHandTotal(newDeck, users.DEALER);
          }, 1000);
        } else if (res === 21) {
          flipDealerHand(newDeck, true);
          await calcHandTotal(newDeck, users.DEALER);
        }
      }, 200);

      // flipSelectedCards(card, true);
      // console.log(lastIndex);
    }
  });
};

startGame();


