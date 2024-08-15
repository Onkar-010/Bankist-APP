'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300, 232],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
    '2024-08-12T21:31:17.178Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementsDates = function (date, locale) {
  const calcdaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcdaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yeasterday';
  if (daysPassed < 7) return `${daysPassed} Days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth()}`.padStart(2, 0);
    // const year = `${date.getFullYear()}`;
    // return `${day}/${month}/${year}`;

    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formattMov = function (value, locale, currency) {
  const option = {
    style: 'currency',
    currency: currency,
  };
  return new Intl.NumberFormat(locale, option).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  let movs;

  if (sort) {
    console.log(acc.movements);
    movs = acc.movements.slice().sort((a, b) => a - b);
  } else {
    movs = acc.movements;
  }

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const now = new Date(acc.movementsDates[i]);
    const movementdate = formatMovementsDates(now, acc.locale);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
                <div class="movements__date">${movementdate}</div>
        <div class="movements__value">${formattMov(
          mov,
          acc.locale,
          acc.currency
        )}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formattMov(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formattMov(
    incomes.toFixed(2),
    acc.locale,
    acc.currency
  )}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formattMov(
    Math.abs(out).toFixed(2),
    acc.locale,
    acc.currency
  )}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${formattMov(
    interest.toFixed(2),
    acc.locale,
    acc.currency
  )}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogoutTimer = function () {
  const tick = function () {
    // Set timer for 5 mins
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // display it to USI
    labelTimer.textContent = `${min}:${sec}`;

    // stop the Timer when it reaches to zero
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }

    // drecrese the timeer by 1 sec
    time--;
    console.log('fuck of');
  };

  // set the timer
  let time = 120;

  // call the startLogouttimer Function every one second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);

    // diplay Currunt date and Time
    const now = new Date();

    const option = {
      hour: 'numeric',
      minutes: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };

    const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      option
    ).format(now);
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth()}`.padStart(2, 0);
    // const year = `${now.getFullYear()}`;
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const minutes = `${now.getMinutes()}`.padStart(2, 0);

    // labelDate.textContent = `${day}/${month}/${year} & ${hour}:${minutes}`;

    // impletment Timer
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // impletment Timer
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    currentAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
  // impletment Timer
  if (timer) clearInterval(timer);
  timer = startLogoutTimer();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*******************Converting and Creating Numbers  ******************************/

// Truth of Number
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(23 === 23.0);

//Conversion
console.log(Number('234'));
console.log(+'234');

// Parsing

// parseInt and parseFloat function
console.log(Number.parseInt(23.23)); //float to integer
// string to integer
console.log(Number.parseInt('2342'));
console.log(parseInt('23.42'));
// number and string mix
console.log(parseInt('29px'));
console.log(parseInt('pes89')); //Exception
console.log(parseFloat('8291.21psxa'));

// Checking if the value is NAN
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20px'));
console.log(Number.isNaN(20 / 0));

//Checking if the value is Finite
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20px'));
console.log(Number.isFinite(20 / 0));

/******************************************************************************* */

/**********************************Math and Rounding Numbers *********************/

//Basic Math Function

//Root
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2)); // ----> Squart root using Exponential
console.log(25 ** (1 / 3)); // -----> Cube Root using Exponential

//maximum Value
console.log(Math.max(2, 3, 4, 9, 10));
console.log(Math.max(2, 3, 4, 10, 10));
console.log(Math.max(2, 3, 4, `9`, 1));
console.log(Math.max(2, 3, 4, `9px`, 10));

// min
console.log(Math.min(2, 3, 4, `9`, 1));

// roandom  the Number
console.log(Math.random() * 6); //
console.log(Math.trunc(Math.random() * 6) + 1);

// Rounding Intergers

// Trunc method
console.log(Math.trunc(23.2)); // --> 23
console.log(Math.trunc(-23.2)); // -->-23

// floor method
console.log(Math.floor(23.2)); // --> 23
console.log(Math.floor(-23.2)); // --> 24

// ceil method
console.log(Math.ceil(23.9)); // --> 24
console.log(Math.ceil(-23.9)); // --> -23

// Ruounding the Decimal's
console.log((2.7).toFixed(0));
console.log((2.345).toFixed(2));
console.log((-2.7).toFixed(12));
// console.log(`2.7`.toFixed(2));

/****************************Numeric Seprator***************************/

const diameter = 295_212_121_000;
console.log(diameter);

const price = 15_00;
console.log(price);

const transactionFee1 = 15_00;
const transactionFee2 = 1_500;
console.log(transactionFee1, transactionFee2);

// Error's
// console.log(0_2);
// console.log(12._00);
// console.log(12_.00);
// console.log(12.00_)
// console.log(12.0__0)

/***********************************************************************/

/*****************Working with BigINT *****************************/

/*how much digit number can be reprsented 
by using Inter data type*/
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991

//  representing number biger than 9007199254740991 in integer
console.log(9007199254740991 + 1);
console.log(9007199254740991 + 2);
console.log(9007199254740991 + 3);
console.log(9007199254740991 + 4);

//  representing number biger than 9007199254740991 in BigInt
console.log(BigInt(9007199254740998));
console.log(900719925474099349241n);

// Operation on BigInt

// BigInt with Bigint Arithmaic
console.log(23912911224821412842n / 1241414212434734342n);
// Return Closes Bigint
console.log(23912911224821412842n + 1241414212434734342n);
console.log(23912911224821412842n - 1241414212434734342n);
console.log(23912911224821412842n * 1241414212434734342n);

// BigInt with Integer Arithmatic
// console.log(23912911224821412842n + 12312);
// console.log(23912911224821412842n / 12312);
// console.log(23912911224821412842n - 12312);
// console.log(23912911224821412842n * 12312);

// boolean
console.log(23n == 23); // as == does type coercion --> true
console.log(23n === 23);

// Exceptions
console.log(23n > 21); // 21 converted to bigint using BigInt constructor method
console.log(23912911224821412842n + `is A Really Big Number `);

// Division in BigInt
console.log(12n / 5n);
console.log(12 / 5);

/******************************************************************/

/********************************Creating Dates  *****************

// Creating dates there are total 4 ways

// 01
console.log(new Date());

//02
console.log(new Date('October 13, 2014 11:13:00'));

//03
const d = new Date(2018, 11, 24, 10, 33, 30, 10);
const e = new Date(2018, 11, 24);
const f = new Date(2018, 11);
const g = new Date(2018);
console.log(d);
console.log(e);
console.log(f);
console.log(g);

// 04
const h = new Date(100000000000);
const i = new Date(-100000000000);
const j = new Date(24 * 60 * 60 * 1000);
console.log(h, i, j);

//Operation on Dates
const date = new Date();
const day = date.getDate();
const month = date.getMonth();
const Year = date.getFullYear();
const timestamp = date.getTime();
const hour = date.getHours();
const minutes = date.getMinutes();
const second = date.getSeconds();

console.log(day, month, Year, hour, minutes, second, timestamp);

// setting Operation
const future = date.setFullYear(`2026`);
console.log(future);

****************************************************************/
/*******************************Operation on dates *************************/

// console.log(calcdaysPassed(new Date(2024, 3, 14), new Date(2024, 3, 24)));

/**************************************************************************/
