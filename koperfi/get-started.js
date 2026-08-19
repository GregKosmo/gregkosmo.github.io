const incomeStreams = document.querySelector('#income-streams');
let incomeStream = document.querySelector('#income-stream').cloneNode(true);
const fixedExpenses = document.querySelector('#fixed-expenses');
let fixedExpense = document.querySelector('#fixed-expense').cloneNode(true);
const fluctuatingExpenses = document.querySelector('#fluctuating-expenses');
let fluctuatingExpense = document.querySelector('#fluctuating-expense').cloneNode(true);
const expectedSpendingItems = document.querySelector('#expected-spending-items');
let expectedSpendingItem = document.querySelector('#expected-spending-item').cloneNode(true);

incomeStream.id = undefined;
fixedExpense.id = undefined;
fluctuatingExpense.id = undefined;
expectedSpendingItem.id = undefined;

function addIncomeStream(description, amount, frequency) {
    incomeStream.children[0].children[0].value = description;
    incomeStream.children[1].children[0].value = amount;
    incomeStream.children[2].children[0].value = frequency;
    incomeStreams.appendChild(incomeStream)
    incomeStream = incomeStream.cloneNode(true)
}

function addFixedExpense(description, amount) {
    fixedExpense.children[0].children[0].value = description;
    fixedExpense.children[1].children[0].value = amount;
    fixedExpenses.appendChild(fixedExpense)
    fixedExpense = fixedExpense.cloneNode(true)
}

function addFluctuatingExpense(description, amount) {
    fluctuatingExpense.children[0].children[0].value = description;
    fluctuatingExpense.children[1].children[0].value = amount;
    fluctuatingExpenses.appendChild(fluctuatingExpense)
    fluctuatingExpense = fluctuatingExpense.cloneNode(true)
}

function addExpectedSpendingItem(category, date, amount, description) {
    expectedSpendingItem.children[0].children[0].value = category;
    expectedSpendingItem.children[1].children[0].value = date;
    expectedSpendingItem.children[2].children[0].value = amount;
    expectedSpendingItem.children[3].children[0].value = description;
    expectedSpendingItems.appendChild(expectedSpendingItem)
    expectedSpendingItem = expectedSpendingItem.cloneNode(true)
}

function removeIncomeStream(button) {
    const parent = button.parentElement;
    incomeStreams.removeChild(parent);
    updateConfig()
}

function removeFixedExpense(button) {
    const parent = button.parentElement;
    fixedExpenses.removeChild(parent);
    updateConfig()
}

function removeFluctuatingExpense(button) {
    const parent = button.parentElement;
    fluctuatingExpenses.removeChild(parent);
    updateConfig()
}

function removeExpectedSpendingItem(button) {
    const parent = button.parentElement;
    expectedSpendingItems.removeChild(parent);
    updateConfig()
}

function updateConfig() {
    const config = {
        incomeStreams: [],
        fixedExpenses: [],
        fluctuatingExpenses: [],
        expectedSpendingItems: []
    }
    for (const incomeStream of incomeStreams.children) {
        config.incomeStreams.push({
            description: incomeStream.children[0].children[0].value,
            amount: incomeStream.children[1].children[0].value,
            frequency: incomeStream.children[2].children[0].value
        })
    }
    for (const fixedExpense of fixedExpenses.children) {
        config.fixedExpenses.push({
            description: fixedExpense.children[0].children[0].value,
            amount: fixedExpense.children[1].children[0].value
        })
    }
    for (const fluctuatingExpense of fluctuatingExpenses.children) {
        config.fluctuatingExpenses.push({
            description: fluctuatingExpense.children[0].children[0].value,
            amount: fluctuatingExpense.children[1].children[0].value
        })
    }
    for (const expectedSpendingItem of expectedSpendingItems.children) {
        config.expectedSpendingItems.push({
            category: expectedSpendingItem.children[0].children[0].value,
            date: expectedSpendingItem.children[1].children[0].value,
            amount: expectedSpendingItem.children[2].children[0].value,
            description: expectedSpendingItem.children[3].children[0].value
        })
    }
    localStorage.setItem('koperfi-config', JSON.stringify(config))
}

function loadConfig() {
    const config = JSON.parse(localStorage.getItem('koperfi-config') || '{}');
    if (config.incomeStreams?.length) {
        incomeStreams.replaceChildren()
        for (const incomeStream of config.incomeStreams) {
            addIncomeStream(incomeStream.description, incomeStream.amount, incomeStream.frequency)
        }
    }
    if (config.fixedExpenses?.length) {
        fixedExpenses.replaceChildren()
        for (const fixedExpense of config.fixedExpenses) {
            addFixedExpense(fixedExpense.description, fixedExpense.amount)
        }
    }
    if (config.fluctuatingExpenses?.length) {
        fluctuatingExpenses.replaceChildren()
        for (const fluctuatingExpense of config.fluctuatingExpenses) {
            addFluctuatingExpense(fluctuatingExpense.description, fluctuatingExpense.amount)
        }
    }
    if (config.expectedSpendingItems?.length) {
        expectedSpendingItems.replaceChildren()
        for (const expectedSpendingItem of config.expectedSpendingItems) {
            addExpectedSpendingItem(expectedSpendingItem.category, expectedSpendingItem.date, expectedSpendingItem.amount, expectedSpendingItem.description);
        }
    }
}

loadConfig();