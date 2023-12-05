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
        li.classList = "playingCard dealerCard hidden";
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
        li.classList = "playingCard playerCard hidden";
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

      return new Response(JSON.stringify(json));
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
      if (!card.classList.contains("hidden")) return;
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
      if (runningTotal <= 10) {
        return 11;
      }
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
    let aceCounter = 0;

    if (json.success) {
      if (user === users.DEALER) {
        for (let i = 0; i < json.piles.dealer.cards.length; i++) {
          if (json.piles.dealer.cards[i].value.substring(0, 1) == "A") {
            aceCounter++;
          } else {
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
        }

        if (handTotal + aceCounter * 11 > 21) {
          handTotal += aceCounter * 1;
        } else {
          handTotal += aceCounter * 11;
        }

        const dealerCardContainer = document.getElementById(
          "dealer-cards-container"
        );
        console.log(aceCounter);
        if (aceCounter > 0) {
          for (let i = 0; i < dealerCardContainer.children.length; i++) {
            //https://deckofcardsapi.com/static/img/AS.png
            if (!dealerCardContainer.children[i].classList.contains("hidden")) {
              if (
                dealerCardContainer.children[i].children[1].src
                  .substring(38, 39)
                  .toUpperCase() === "A"
              ) {
                console.log("card is unhidden ace!");
                if (showingHandTotal + aceCounter * 11 > 21) {
                  showingHandTotal += aceCounter * 1;
                } else {
                  showingHandTotal += aceCounter * 11;
                }
              }
            }
          }
        }

        aceCounter = 0;

        // console.log(aceCounter, handTotal);
      } else {
        for (let i = 0; i < json.piles.player.cards.length; i++) {
          if (json.piles.player.cards[i].value.substring(0, 1) == "A") {
            aceCounter++;
          } else {
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

        // console.log(handTotal);
        if (handTotal + aceCounter * 11 > 21) {
          handTotal += aceCounter * 1;
          showingHandTotal += aceCounter * 1;
        } else {
          handTotal += aceCounter * 11;
          showingHandTotal += aceCounter * 11;
        }
        aceCounter = 0;

        // console.log(aceCounter, handTotal);
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
        elementToModify.innerHTML = ` 21`;
        gameOver = true;
        return Promise.resolve(handTotal);
      } else if (handTotal > 21) {
        console.log(`${user} has busted!`);
        elementToModify.innerHTML = ` ${handTotal} / BUST`;
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
  const stayBtn = document.getElementById("end-game-button");

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
          flipDealerHand(newDeck, true);
          const hand = await getUserHand(newDeck, users.DEALER);
          const handVal = await hand.json();
          console.log(handVal);
          await calcHandTotal(newDeck, users.DEALER);
        } else if (res === 21) {
          flipDealerHand(newDeck, true);
          await calcHandTotal(newDeck, users.DEALER);
        }
      }, 200);

      // flipSelectedCards(card, true);
      // console.log(lastIndex);
    }
  });

  stayBtn.addEventListener("click", async () => {
    if (!gameOver) {
      flipDealerHand(newDeck, true);
      await calcHandTotal(newDeck, users.DEALER);
      // vv This part is a mess, I could not figure out how to pull the value of the dealer hand total.
      const dealerHandTotalElement = document.getElementById("dealerHandTotal");
      const dealerHandTotal = parseInt(dealerHandTotalElement.innerHTML);
      const playerHandTotalElement = document.getElementById("playerHandTotal");
      const playerHandTotal = parseInt(playerHandTotalElement.innerHTML);
      while (dealerHandTotal < 17 && !gameOver) {
        await drawCard(newDeck, 1, users.DEALER);
        flipDealerHand(newDeck, true);
        await calcHandTotal(newDeck, users.DEALER);
        const updatedDealerHandTotal = parseInt(
          document.getElementById("dealerHandTotal").innerHTML
        );
        if (updatedDealerHandTotal >= 17) {
          break;
        }
      }
      console.log(gameOver);
      console.log(parseInt(dealerHandTotalElement.innerHTML));
      console.log(playerHandTotal);
      if (!gameOver) {
        let playerDif = 21 - playerHandTotal;
        let dealerDif = 21 - parseInt(dealerHandTotalElement.innerHTML);
        if (playerDif < dealerDif) {
          console.log("player has won smaller dif");
          playerHandTotalElement.textContent = playerHandTotal + " - Won!";
          dealerHandTotalElement.textContent =
            parseInt(dealerHandTotalElement.innerHTML) + " - Lost!";
        } else if (dealerDif < playerDif) {
          console.log("dealer has won smaller dif");
          playerHandTotalElement.textContent = playerHandTotal + " - Lost!";
          dealerHandTotalElement.textContent =
            parseInt(dealerHandTotalElement.innerHTML) + " - Won!";
        } else if (dealerDif == playerDif) {
          console.log("push");
          playerHandTotalElement.textContent = playerHandTotal + " - Push!";
          dealerHandTotalElement.textContent =
            parseInt(dealerHandTotalElement.innerHTML) + " - Push!";
        }
      }
    }
  });
};
// END LANDON CODE INSERT

startGame();
