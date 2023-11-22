# Blackjack

So far this is a simple base framework that creates a new deck if there isn't a deck id found yet in the browser session, allows shuffling deck to reset game, drawing of cards for a specific user, and getting of hand for a particular user.

<a href="https://deckofcardsapi.com/?ref=hackernoon.com">API Reference</a>

## Basic wireframe
-----------------------------------------------
|                 Blackjack App               |
-----------------------------------------------
|  Deal  |  Bet: [_______]  |  Play Again  |
-----------------------------------------------
|                Card Play                    |
|                                           |
|   Player's Cards: [ ][ ][ ][ ] Total: [__] |
|                                           |
|   Dealer's Cards: [ ][ ] (Hidden)           |
-----------------------------------------------
|          Counter (Won/Lost Chips)           |
|                                           |
|   Current Chips: 100                         |
|   Chips Won/Lost: +10                         |
-----------------------------------------------
### Desription of the wireframe
The "Deal" button initiates the card dealing process, the "Bet" section allows the user to input their bet amount, the "Card Play" section displays the cards for both the player and the dealer, and the "Counter" section keeps track of the player's current chip count and any chips won or lost. The "Play Again" button allows the player to start a new round.
