// Shorthand for getting ID element
function getId(id){
  const ele = document.getElementById(id);
  return ele;
}

// Shorthand for creating html element, takes in the element, classes, id, inner html returns that element
function createHtmlElement(element, allClasses = undefined, id = undefined, innerHTML = undefined){
  const createdElement = document.createElement(element);
  if(allClasses) createdElement.classList.add(...allClasses);
  if(id) createdElement.id = id;
  if(innerHTML) createdElement.innerHTML = innerHTML;

  return createdElement;
}

//mortgage calculations taking input values returns object { monthlyPayments: monthlyPayments, paymentBreakDownArray } for full payment breakdown
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
    totalInterestPaid += interestPayment;
    loanAmount -= principlepayment
    paymentBreakDownArray.push({principle: principlepayment.toFixed(2), interest: interestPayment.toFixed(2), loanAmount: loanAmount.toFixed(2)})
  }

  return { monthlyPayments: monthlyPayments, paymentBreakDownArray };
}

//converter for GB currency 
function currencyConvert(num){
  return num.toLocaleString('en-GB', {style: 'currency', currency:'GBP'});
}

//Generates html elements for table / appends to DOM - using breakdown object
function monthlySchedule(breakdownObject, container){
  console.log(breakdownObject)

  const details = createHtmlElement('details');
  const sum = createHtmlElement('summary');
  sum.innerHTML = 'Monthly Schedule';
  details.appendChild(sum);

  const tableFigures = breakdownObject.paymentBreakDownArray;
  const table = createHtmlElement('table');
  const row = table.insertRow(0);

  const rowNum = createHtmlElement('th');
  const pp = createHtmlElement('th');
  const interest = createHtmlElement('th');
  const balance = createHtmlElement('th');

  rowNum.innerHTML = 'Month';
  pp.innerHTML = 'Principle';
  interest.innerHTML = 'Interest';
  balance.innerHTML = 'Balance';

  row.appendChild(rowNum);
  row.appendChild(pp);
  row.appendChild(interest);
  row.appendChild(balance);

  let rows;
  let rowCount;
  let ppNum;
  let intNum;
  let balNum;
  
  for(let i = 0; i < tableFigures.length; i++){
      rows = table.insertRow(i + 1);
      rowCount = rows.insertCell(0);
      ppNum = rows.insertCell(1);
      intNum = rows.insertCell(2);
      balNum = rows.insertCell(3);

      rowCount.innerHTML = i;
      ppNum.innerHTML = tableFigures[i].principle;
      intNum.innerHTML = tableFigures[i].interest;
      balNum.innerHTML = tableFigures[i].loanAmount;    
  }
  details.appendChild(table);
  container.appendChild(details);
}

//Creates the graph using chart js - creates 2 lines - appends to DOM
function createGraph(dataArray, term, container){
  const dataA = dataArray.paymentBreakDownArray
  const ctx = createHtmlElement('canvas', undefined, 'myChart')
  container.appendChild(ctx);
  let principleData = []
  let interestData = []
  let loanRemainingData = []

  for(let i = 0; i < dataA.length; i += 11){
    principleData.push(dataA[i].principle)
    interestData.push(dataA[i].interest)
    loanRemainingData.push(dataA[i].loanAmount)
  }
  const date = new Date();
  let year = date.getFullYear()
  let labelsArray = [];
  for(let i = 0; i < term; i++){
    let allLabels = year + i;
    labelsArray.push(allLabels);
  }

  const data = {
    labels: labelsArray,
    datasets: [{
      label: 'Principle Payments',
      data: principleData,
      fill: false,
      backgroundColor: 'rgb(109, 0, 168)',
    },
  {
    label: 'Interest Payments',
      data: interestData,
      fill: false,
      backgroundColor: 'rgb(200, 20, 69)',
  },]
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      aspectRatio: 1/1,
      plugins: {
        title: {
          display: true,
          text: 'Term Year Breakdown'
        }
    }
  }
};

  new Chart(ctx, config)

}

// Restart button - clears inner html / resets to the original form view on click
function resetWidget(breakdownViewContainer, defaultFormView){
  const restartBut = getId('restartButton');
  restartBut.addEventListener('click', () => {
    breakdownViewContainer.innerHTML = '';
    breakdownViewContainer.innerHTML = defaultFormView;
    formSubmit();
  });
}

/*
changes intro html text
creates h2 & p elements for monthly payment visual / appends to DOM
Calls Monthly schedule
Calls creatGraph
Creates button element / appends to DOM
Calls resetWidget
*/
function breakdownView(widgetContantainer, repaymentCost, mortgageTerm, formViewHtml){
  const headingPara = getId('heading-para');
  headingPara.innerHTML = 'Breakdown Below';  
  const monthlyText = createHtmlElement('h2', undefined, undefined, 'Monthly Repayment');
  const monthlyDisplay = createHtmlElement('p', ['monthly-payments'], undefined, currencyConvert(repaymentCost.monthlyPayments));
  // order will be swaped in css visually 
  widgetContantainer.appendChild(monthlyText);
  widgetContantainer.appendChild(monthlyDisplay);

  monthlySchedule(repaymentCost, widgetContantainer)
  createGraph(repaymentCost, mortgageTerm, widgetContantainer);

  const resetButton = createHtmlElement('button', ['submit'], 'restartButton', 'Restart')
  widgetContantainer.appendChild(resetButton);
  resetWidget(widgetContantainer, formViewHtml)
}

/*
adds a listener for form submission
Sets form view state for useage in resetWidget
Calls mortgage Formula with values
Removes the form
Calls breakdownView function 
*/
function formSubmit(){
  const form = getId('mortgage-calculator-form');
  if (form){
    form.addEventListener('submit', e => {
      e.preventDefault();

      const container = getId('mortgage-wrapper');
      const formViewHtml = container.innerHTML;
      e.preventDefault()
      const housePrice = getId('house-price').value; 
      const depositAmount = getId('deposit-amount').value;
      const interestRate = getId('interest-rate').value;
      const mortgageTerm = getId('mortgage-term').value;
      const repaymentCost = mortgageFormula(housePrice, depositAmount, interestRate, mortgageTerm);
      form.remove();
      breakdownView(container, repaymentCost, mortgageTerm, formViewHtml);
    })
  }
};

formSubmit();
