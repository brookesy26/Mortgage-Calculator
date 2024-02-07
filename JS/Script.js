const housePriceInput = document.getElementById('house-price');
const depositAmountInput = document.getElementById('deposit-amount');
const interestRateInput = document.getElementById('interest-rate');
const mortgageTermInput = document.getElementById('mortgage-term');
const form = document.getElementById('mortgage-calculator-form');
const container = document.getElementById('mortgage-wrapper');

function mortgageFormula(price, deposit, interest, term){
let loanAmount = price - deposit;
let monthlyInterestRate = (interest / 12) / 100;
let totalPayments = term * 12;

let part1 = loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)
let part2 = Math.pow(1 + monthlyInterestRate, totalPayments) - 1;
let monthlyPayments = part1 / part2;

let totalInterestPaid = 0;
let paymentBreakDownArray = [];

for(let i = 0; i < totalPayments; i++){
  let interestPayment = loanAmount * monthlyInterestRate;
  let principlepayment = monthlyPayments - interestPayment;
  loanAmount -= principlepayment;
  totalInterestPaid += interestPayment;
  paymentBreakDownArray.push({principle: principlepayment.toFixed(2), interest: interestPayment.toFixed(2)})

}

console.log(paymentBreakDownArray)
console.log(monthlyPayments.toFixed(2))
return { monthlyPayments: monthlyPayments.toFixed(2), paymentBreakDownArray };
}

function currencyConvert(num){
  return num.toLocaleString('en-GB', {style: 'currency', currency:'GBP'});
}

function createHtml(repaymentCost, term, months, htmlContainer){
  const headingCheck = document.getElementById('repayment-heading');
  if(!headingCheck){
  const headingTwo = document.createElement('h2');
  headingTwo.id = 'repayment-heading';
  headingTwo.innerHTML = 'Monthly Repayment Breakdown';
  container.appendChild(headingTwo);

  const repaymentText = document.createElement('p');
  repaymentText.id = 'repaymentText';

  let MonthlyCost = currencyConvert(parseFloat(repaymentCost))
  let totalCost = repaymentCost * months;
  let CurrencyTotal = currencyConvert(totalCost);
  repaymentText.innerHTML = 
  `Monthly Repayments: ${MonthlyCost} <br>
  Term: ${term} years <br>
  Total repayments: ${months}<br>
  Total Cost: ${CurrencyTotal}`;
  container.appendChild(repaymentText);
}
}

function createGraph(){
  const ctx = document.createElement('canvas');
  ctx.id = 'myChart';
  container.appendChild(ctx);

  const TermYearButton = document.createElement('select');
  TermYearButton.id = 'TermYearButton';
  TermYearButton.innerHTML = 'Select Term Year'
  container.appendChild(TermYearButton);

  const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
let termLengthInMonths = 400
  const date = new Date();
  let currentMonth = date.getMonth();
  let labelsArray = [];
  for(let i = currentMonth; i < termLengthInMonths + currentMonth; i++){
    let allLabels = month[i % month.length];
    labelsArray.push(allLabels);
  }
console.log(labelsArray);

const data = {
  labels: labelsArray,
  datasets: [{
    label: 'Balance',
    data: [0, 22, 33, 55, 56, 55, 40, 55,67, 88, 99 ,100],
    fill: false,
    borderColor: 'rgb(234, 0, 255)',
    tension: 0.3
  }]
};

const config = {
  type: 'line',
  data: data,
  options:{
    scales:{
      x:{
        min:0,
        max: 11
      }
    }
  }
};

new Chart(ctx, config)}


form.addEventListener('submit', e => {
  e.preventDefault()
  const housePrice = housePriceInput.value;
  const depositAmount = depositAmountInput.value;
  const interestRate = interestRateInput.value;
  const mortgageTerm = mortgageTermInput.value;
  let repaymentCost = mortgageFormula(housePrice, depositAmount, interestRate, mortgageTerm);
  createHtml(repaymentCost, mortgageTerm, mortgageTerm * 12, container);
  createGraph();
  housePriceInput.value = '';
  depositAmountInput.value = '';
  interestRateInput.value = '';
  mortgageTermInput.value = '';
});

