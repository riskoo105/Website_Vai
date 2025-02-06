# Návod na inštaláciu a spustenie projektu

---

## Požiadavky
Pre úspešné spustenie projektu je potrebné mať nainštalované nasledujúce nástroje:
- [Node.js](https://nodejs.org/)  
- [npm](https://www.npmjs.com/) (automaticky sa inštaluje s Node.js)  
- [MySQL](https://www.mysql.com/)  

---

## Nastavenie a spustenie frontendu
1. Otvorte terminál a presmerujte sa do priečinka **client**:
   cd client
2. Nainštalujte všetky potrebné závislosti pomocou príkazu:
   npm install
3. Po úspešnej inštalácii závislostí spustite vývojový server pomocou:
   npm run dev
   Teraz by mal byť frontend prístupný na adrese http://localhost:5173.

---

## Nastavenie a spustenie backendu
1. Otvorte terminál a presmerujte sa do priečinka **server**:
   cd server
2. Nainštalujte všetky potrebné závislosti pomocou príkazu:
   npm install
3. Vytvorte súbor .env v priečinku server. Tento súbor bude obsahovať nastavenia databázy a
   bezpečnostné premenné. Príklad obsahu súboru:
   
   DB_HOST=localhost
   DB_USER=reservation_user
   DB_PASSWORD=secure_password
   DB_NAME=reservation_system
   JWT_SECRET=mojTajnyKluc
   
   DB_HOST: Adresa databázového servera (typicky localhost pre lokálne projekty).
   DB_USER: Používateľ databázy, ktorý má prístup k projektu (napr. reservation_user).
   DB_PASSWORD: Heslo k databázovému používateľovi (napr. secure_password).
   DB_NAME: Názov databázy, ktorá sa použije pre aplikáciu (napr. reservation_system).
   JWT_SECRET: Náhodne vygenerovaný tajný kľúč používaný na generovanie a overovanie tokenov JWT.
   
5. Spustite backend server pomocou:
   npm run dev
   Backend by mal byť spustený na adrese http://localhost:8080.
   

