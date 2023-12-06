//STORE A GLOBAL VARIABLE FOR THE DECKID SO A NEW DECK IS NOT GENERATED EVERY RELOAD

let globalDeckId = sessionStorage.getItem("deckId");

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
      return 0;
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
        // console.log(`${user} has won!`);
        elementToModify.innerHTML = ` 21`;
        gameOver = true;
        return Promise.resolve(handTotal);
      } else if (handTotal > 21) {
        console.log(`${user} has busted!`);

        flipDealerHand(sessionStorage.getItem("deckId"), true);
        elementToModify.innerHTML = ` ${handTotal} / BUST`;
        gameOver = true;
        const otherUser = user == users.PLAYER ? users.DEALER : users.PLAYER;
        writeNewBetAndShowRestartScreen(otherUser);
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
  const dealerContainer = document.getElementById("dealer-cards-container");
  const playerContainer = document.getElementById("player1-cards-container");

  dealerContainer.innerHTML = "";
  playerContainer.innerHTML = "";

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
    const dealerHandTotalElement = document.getElementById("dealerHandTotal");
    const playerHandTotalElement = document.getElementById("playerHandTotal");
    if (dealerRes === 21) {
      dealerHandTotalElement.textContent = dealerRes + " - Blackjack, Won!";
      // console.log("Dealer Has Blackjack, Dealer Wins");
      playerHandTotalElement.textContent = playerRes;
      if (playerRes === 21) {
        playerHandTotalElement.textContent += " - Blackjack, Lost!";
      } else {
        playerHandTotalElement.textContent += " - Lost!";
      }
      writeNewBetAndShowRestartScreen(users.DEALER);
    } else {
      // console.log("Player Has Blackjack, Player Wins!");
      playerHandTotalElement.textContent = playerRes + " - Blackjack, Won!";
      dealerHandTotalElement.textContent = dealerRes + " - Lost!";
      writeNewBetAndShowRestartScreen("", false, true);
    }
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

        // console.log(res);
        if (res === 100) {
          await calcHandTotal(newDeck, users.DEALER);
          flipDealerHand(newDeck, true);
          const hand = await getUserHand(newDeck, users.DEALER);
          const handVal = await hand.json();
          // console.log(handVal);
          writeNewBetAndShowRestartScreen(users.DEALER);
        } else if (res === 21) {
          const dealerTotal = await calcHandTotal(newDeck, users.DEALER);
          const playerTotal = await calcHandTotal(newDeck, users.PLAYER);
          flipDealerHand(newDeck, true);

          const dealerHandTotalElement =
            document.getElementById("dealerHandTotal");
          const playerHandTotalElement =
            document.getElementById("playerHandTotal");
          if (dealerTotal === 21) {
            // console.log("Dealer Blackjack, Dealer Wins");
            playerHandTotalElement.textContent = playerTotal;
            if (playerTotal === 21)
              playerHandTotalElement.textContent += " - Blackjack, Lost";

            dealerHandTotalElement.textContent =
              dealerTotal + " - Blackjack, Won!";

            writeNewBetAndShowRestartScreen(users.DEALER);
          } else {
            playerHandTotalElement.textContent =
              playerTotal + " - Blackjack, Won!";
            dealerHandTotalElement.textContent = dealerTotal + " - Lost!";
            writeNewBetAndShowRestartScreen("", false, true);
          }
        }
      }, 200);

      // flipSelectedCards(card, true);
      // console.log(lastIndex);
    }
  });

  stayBtn.addEventListener("click", async () => {
    if (!gameOver) {
      flipDealerHand(newDeck, true);
      // vv This part is a mess, I could not figure out how to pull the value of the dealer hand total.

      //very much was correct, except instead of parsing the value from the innerhtml
      //the calcHandTotal() returns a resolved promise, so as long as it is awaited/.then chained
      //it will return the number back which can then be assigned to a var, look at the very bottom
      //of the calcHandTotal function to see how I did so with an async awaited function, it must return
      //some sort of promise there will be data at that location rather than an actual value being directly passed

      //looking at the innerHTML and parsing it from there generally works but in specific
      //cases can be a little buggy, if it were a single value that is written to once then
      //parsing from HTML would be perfect, but because these objects are dynamic and update
      //immediatley with no pomise that the number that is there currently is the new hand total
      //(especially if there are aces, if it is originally 11 but then deals to make the ace 1,
      //if the last HTML value is parsed with the ace total still being 11 it could do some strange things)

      //This code is very indiscript and for that I'm sorry, there isn't really any
      //documentation or comments or anything that say this function returns a value, the only
      //way to tell is just hovering over it and even then it just says ({...args}) => Promise<number | error>
      //(basically, will return a promisified number or an error message) but besides that there's no definition
      //to what the return is nor is it explicitally stated in the code anywhere.
      const dealerHandTotalElement = document.getElementById("dealerHandTotal");
      const playerHandTotalElement = document.getElementById("playerHandTotal");
      const dealerHandTotal = await calcHandTotal(newDeck, users.DEALER);
      const playerHandTotal = await calcHandTotal(newDeck, users.PLAYER);
      while (dealerHandTotal < 17) {
        if (!gameOver) {
          await drawCard(newDeck, 1, users.DEALER);
          flipDealerHand(newDeck, true);
          const handTotal = await calcHandTotal(newDeck, users.DEALER);

          if (handTotal === 21) {
            // console.log(
            //   "Dealer has blackjack, no matter what the player has this is a dealer win!"
            // );

            const playerHandTot = await calcHandTotal(newDeck, users.PLAYER);
            dealerHandTotalElement.textContent =
              handTotal + " - Blackjack, Won!";
            playerHandTotalElement.textContent = playerHandTot + " - Lost!";

            if (playerHandTot === 21) {
              playerHandTotalElement.textContent =
                playerHandTot + " - Blackjack, Lost!";
            }
            writeNewBetAndShowRestartScreen(users.DEALER);
          }
          const updatedDealerHandTotal = parseInt(
            document.getElementById("dealerHandTotal").innerHTML
          );
          if (updatedDealerHandTotal >= 17) {
            break;
          }
        }
      }
      // console.log(gameOver);
      // console.log(parseInt(dealerHandTotalElement.innerHTML));
      // console.log(playerHandTotal);
      if (!gameOver) {
        let playerDif = 21 - playerHandTotal;
        let dealerDif = 21 - parseInt(dealerHandTotalElement.innerHTML);
        if (playerDif < dealerDif) {
          // console.log("player has won smaller dif");
          playerHandTotalElement.textContent = playerHandTotal + " - Won!";
          dealerHandTotalElement.textContent =
            parseInt(dealerHandTotalElement.innerHTML) + " - Lost!";
          writeNewBetAndShowRestartScreen(users.PLAYER);
        } else if (dealerDif < playerDif) {
          // console.log("dealer has won smaller dif");
          playerHandTotalElement.textContent = playerHandTotal + " - Lost!";
          dealerHandTotalElement.textContent =
            parseInt(dealerHandTotalElement.innerHTML) + " - Won!";
          writeNewBetAndShowRestartScreen(users.DEALER);
        } else if (dealerDif == playerDif) {
          // console.log("push");
          playerHandTotalElement.textContent = playerHandTotal + " - Push!";
          dealerHandTotalElement.textContent =
            parseInt(dealerHandTotalElement.innerHTML) + " - Push!";
          writeNewBetAndShowRestartScreen(users.PLAYER, true);
        }
      }
    }
  });
};

const parseCookie = (str) =>
  str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});

var expirationDate = new Date();
expirationDate.setFullYear(expirationDate.getFullYear() + 1);
const placeBetAndHideStartScreen = () => {
  if (document.cookie) {
    const cookie = parseCookie(document.cookie);

    if (cookie["chips"] == "NaN") {
      document.cookie = `chips=5000; expires=${expirationDate.toUTCString()}`;
    }

    let flag = false;
    Object.keys(cookie).forEach((key) => {
      if (key === "chips") flag = true;
    });

    let currentChips = 0;
    if (flag) {
      currentChips = cookie["chips"];
    } else {
      document.cookie = `chips=5000; expires=${expirationDate.toUTCString()}`;
      currentChips = parseCookie(document.cookie)["chips"];
    }
  } else {
    document.cookie = `chips=5000; expires=${expirationDate.toUTCString()}`;
    currentChips = parseCookie(document.cookie)["chips"];
  }

  const betEntry = document.getElementById("betChipInput");
  const betEntryVal = betEntry.value;
  betEntry.value = "";

  if (betEntryVal > Number(parseCookie(document.cookie)["chips"])) {
    console.log("Bet cannot be higher than remaining chips");
    return Promise.resolve(false);
  }

  // console.log(cookie["chips"]);
  const newChipVal =
    Number(parseCookie(document.cookie)["chips"]) - betEntryVal;

  document.cookie = `chips=${newChipVal}; expires=${expirationDate.toUTCString()}`;
  // console.log(parseCookie(document.cookie)["chips"]);

  const currentBetSpan = document.getElementById("current-bet");
  currentBetSpan.innerHTML = betEntryVal;

  const startScreenWrapper = document.getElementById("startScreenWrapper");
  startScreenWrapper.classList.add("hidden");

  console.log(document.cookie);
  return Promise.resolve(betEntryVal);
};

const writeNewBetAndShowRestartScreen = (
  winningUser = "",
  push = false,
  blackjack = false
) => {
  setTimeout(async () => {
    await shuffleDeck(sessionStorage.getItem("deckId"), false);
    const startScreenWrapper = document.getElementById("startScreenWrapper");
    startScreenWrapper.classList.remove("hidden");

    const dealerHandTotal = document.getElementById("dealerHandTotal");
    dealerHandTotal.innerHTML = "";
    const playerHandTotal = document.getElementById("playerHandTotal");
    playerHandTotal.innerHTML = "";

    const chipsLeft = Number(sessionStorage.getItem("remainingChips"));
    const chipsBet = Number(sessionStorage.getItem("currentBet"));

    const startScreenChipCounter = document.getElementById("startScreenChips");
    // console.log(chipsLeft, chipsBet);

    if (push) {
      document.cookie = `chips=${
        chipsLeft + chipsBet
      }; expires=${expirationDate.toUTCString()}`;
      // console.log(document.cookie);
      sessionStorage.setItem("won", "push");
      return;
    } else if (blackjack) {
      document.cookie = `chips=${
        chipsLeft + chipsBet * 3
      }; expires=${expirationDate.toUTCString()}`;
      // console.log(document.cookie);
      sessionStorage.setItem("won", "blackjack");
      return;
    } else if (winningUser === users.DEALER) {
      document.cookie = `chips=${chipsLeft}; expires=${expirationDate.toUTCString()}`;
      // console.log(document.cookie);
      sessionStorage.setItem("won", "dealer");
      return;
    } else if (winningUser === users.PLAYER) {
      document.cookie = `chips=${
        chipsLeft + chipsBet * 2
      }; expires=${expirationDate.toUTCString()}`;
      // console.log(document.cookie);
      sessionStorage.setItem("won", "player");
      return;
    }

    startScreenChipCounter.innerHTML = parseCookie(document.cookie)["chips"];
  }, 3000);

  setTimeout(() => {
    location.reload();
  }, 3500);
};

const startGameButton = document.getElementById("startGameButton");

startGameButton.addEventListener("click", async () => {
  const chipBet = await placeBetAndHideStartScreen();
  if (chipBet) {
    const remainingChips = parseCookie(document.cookie)["chips"];
    sessionStorage.setItem("currentBet", chipBet);
    sessionStorage.setItem("remainingChips", remainingChips);
    startGame();
  }
});

if (
  parseCookie(document.cookie)["chips"] &&
  parseCookie(document.cookie)["chips"] != "NaN"
) {
  document.getElementById("startScreenChips").innerHTML = parseCookie(
    document.cookie
  )["chips"];
} else {
  document.getElementById("startScreenChips").innerHTML = 5000;
}

if (sessionStorage.getItem("won")) {
  const winCondition = sessionStorage.getItem("won");
  const currentBet = Number(sessionStorage.getItem("currentBet"));
  if (winCondition == "player") {
    document.getElementById("roundResult").innerHTML = `Player has won, ${
      currentBet * 2
    } chips returned!`;
  } else if (winCondition == "dealer") {
    document.getElementById(
      "roundResult"
    ).innerHTML = `Dealer has won, lost ${currentBet} chips!`;
  } else if (winCondition == "push") {
    document.getElementById(
      "roundResult"
    ).innerHTML = `Push, ${currentBet} chips returned!`;
  } else if (winCondition == "blackjack") {
    document.getElementById("roundResult").innerHTML = `Player has won, ${
      currentBet * 3
    } chips returned!`;
  }
}
