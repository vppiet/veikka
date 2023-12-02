# Veikka

IRC-botti

## Ohjelmistovaatimukset

[Bun](https://bun.sh/)

## Käynnistys

`bun start`

## Ympäristömuuttujat

| Muuttuja | Esimerkki |
| -------- | --------- |
| `NICK`   | Veikka    |
| `USERNAME` | veikka |
| `GECOS` | Veikka The Bot |
| `SERVER_HOST` | irc.ircnet.com |
| `SERVER_PORT` | 6667 |
| `SERVER_AUTOJOIN` | '#mychannel, #otherchannel, #third' |
| `ADMIN_MASK` | user@example.com |
| `LOG_LEVEL` | info |
| `QUIT_MSG` | 'Cya!' |

Ympäristömuuttujat voi tallentaa `.env`-tiedostoon, jonka mukaan Bun luo ympäristön käynnistyksen aikana.

## Kiitokset
Suomen kielen sanat tarjoaa [*fi-words*](https://github.com/akx/fi-words) käyttäjältä [akx](https://github.com/akx/)
