const newAmountInput = document.querySelector('#new-amount');
const newDateInput = document.querySelector('#new-date');
const newAmountTypeInput = document.querySelector('#amount-type');
const newDescriptionInput = document.querySelector('#new-description');
const tableHeading = document.querySelector('#table-heading');
const tableBody = document.querySelector('#table-body');
const koperfiConfig = JSON.parse(localStorage.getItem('koperfi-config') || '{}');
const currentBalanceHead = document.querySelector('#current-balance-head');
const currentBalanceBody = document.querySelector('#current-balance-body');
const upcomingExpenses = document.querySelector('#upcoming-expenses');
const asOfDateInput = document.querySelector('#as-of-date');

const today = new Date();
asOfDateInput.valueAsDate = today;

const CONFIG = {
    START_DATE: new Date(2026, 0, 2),
    CATEGORIES: koperfiConfig.fluctuatingExpenses.reduce((current, next) => {
        current[next.description] = next.description
        return current;
    }, {})
};
const YEARLY_ALLOCATION = koperfiConfig.fluctuatingExpenses.reduce((current, next) => {
    current[next.description] = new Decimal(next.amount)
    return current;
}, {})
const EXPECTED_SPENDING = koperfiConfig.expectedSpendingItems.reduce((current, next) => {
    if (!current[next.category]) {
        current[next.category] = []
    }
    current[next.category].push([new Date(next.date), new Decimal(next.amount), next.description])
    return current;
}, {})
for (const category of Object.values(CONFIG.CATEGORIES)) {
    const option = document.createElement('option');
    const heading = document.createElement('td');
    option.textContent = category;
    heading.textContent = category;
    newAmountTypeInput.appendChild(option);
    tableHeading.appendChild(heading)
}

function calculate() {
    const AMORTIZATION = {}
    tableBody.replaceChildren();
    currentBalanceHead.replaceChildren();
    currentBalanceBody.replaceChildren();
    upcomingExpenses.replaceChildren();
    for (const category of Object.values(CONFIG.CATEGORIES)) {
        AMORTIZATION[category] = []
        let currentDate = new Date(CONFIG.START_DATE);
        let currentBalance = new Decimal(0);

        for (let i = 0; i < 26; i++) {
            const allocation = YEARLY_ALLOCATION[category].div(26);
            const priorDate = new Date(currentDate);
            priorDate.setDate(currentDate.getDate() - 14);
            const expectedSpending = EXPECTED_SPENDING[category]?.filter(([date]) => date >= priorDate && date < currentDate);
            const expectedSpendingAmount = expectedSpending?.reduce((total, [, amount]) => total.add(amount), new Decimal(0)) || new Decimal(0);

            const newAmount = new Decimal(currentBalance).add(allocation).sub(expectedSpendingAmount);

            if (newAmount.lessThan(0)) {
                console.warn(`Warning: Negative balance for category ${category} on ${priorDate.toDateString()}: ${newAmount}. Calculated by ${currentBalance} + ${allocation} - ${expectedSpendingAmount}.`);
            }
            currentBalance = newAmount;
            AMORTIZATION[category].push([currentDate, currentBalance]);
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + 14)
            currentDate = nextDate;
        }
    }

    let containsNegative = true;
    let loop = 0;
    while (containsNegative && loop < 100) {
        for (const category in AMORTIZATION) {
            const schedule = AMORTIZATION[category];
            const negatives = schedule.filter(([, balance]) => balance.lessThan(0));
            const negative = negatives[negatives.length - 1];

            if (negative) {
                const [date, balance] = negative;
                const datesBeforeNegative = schedule.filter(([d]) => d <= date);
                const datesAfterNegative = schedule.filter(([d]) => d > date);
                const adjustAmountBefore = new Decimal(balance).negated().div(datesBeforeNegative.length);
                const adjustAmountAfter = new Decimal(balance).div(datesAfterNegative.length);

                for (let i = 1; i <= datesBeforeNegative.length; i++) {
                    const dateBeforeNegative = datesBeforeNegative[i - 1];
                    dateBeforeNegative[1] = new Decimal(dateBeforeNegative[1]).add(new Decimal(adjustAmountBefore).mul(i));
                }
                for (let i = 1; i < datesAfterNegative.length; i++) {
                    const dateAfterNegative = datesAfterNegative[i - 1];
                    dateAfterNegative[1] = new Decimal(dateAfterNegative[1]).add(new Decimal(adjustAmountAfter).mul(i));
                }

                const otherCategories = Object.keys(AMORTIZATION).filter(c => c !== category);
                const adjustAmountBeforeOtherCategories = new Decimal(adjustAmountBefore).negated().div(otherCategories.length);
                const adjustAmountAfterOtherCategories = new Decimal(adjustAmountAfter).negated().div(otherCategories.length);

                for (const otherCategory of otherCategories) {
                    const otherSchedule = AMORTIZATION[otherCategory];
                    const otherDatesBeforeNegative = otherSchedule.filter(([d]) => d <= date);
                    const otherDatesAfterNegative = otherSchedule.filter(([d]) => d > date);

                    for (let i = 1; i <= otherDatesBeforeNegative.length; i++) {
                        const otherDateBeforeNegative = otherDatesBeforeNegative[i - 1];
                        otherDateBeforeNegative[1] = new Decimal(otherDateBeforeNegative[1]).add(new Decimal(adjustAmountBeforeOtherCategories).mul(i));
                    }
                    for (let i = 1; i < otherDatesAfterNegative.length; i++) {
                        const otherDateAfterNegative = otherDatesAfterNegative[i - 1];
                        otherDateAfterNegative[1] = new Decimal(otherDateAfterNegative[1]).add(new Decimal(adjustAmountAfterOtherCategories).mul(i));
                    }
                }
            }
        }
        containsNegative = Object.values(AMORTIZATION).reduce((containsNegative, schedule) => containsNegative || schedule.some(([, balance]) => balance.lessThan(0)), false);
        loop++;
    }

    if (loop >= 100) {
        throw new Error('Could not complete amortization')
    }

    const eachDateTotal = [];
    const eachDateIncrease = [];
    for (let i = 0; i < 26; i++) {
        const date = AMORTIZATION[Object.values(CONFIG.CATEGORIES)[0]][i][0];
        const total = Object.values(CONFIG.CATEGORIES).reduce((total, category) => total.add(AMORTIZATION[category][i][1]), new Decimal(0));
        const previousTotal = i > 0 ? eachDateTotal[i - 1][1] : new Decimal(0);
        const change = new Decimal(total).sub(previousTotal);
        eachDateTotal.push([date, total]);
        eachDateIncrease.push([date, change]);
    }

    const usdFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    for (let i = 0; i < eachDateTotal.length; i++) {
        const total = eachDateTotal[i]
        const row = document.createElement('tr');
        const date = document.createElement('td');
        const amount = document.createElement('td');

        date.textContent = total[0].toLocaleDateString();
        amount.textContent = usdFormatter.format(total[1].toNumber());
        row.append(date, amount);

        for (const category of Object.values(CONFIG.CATEGORIES)) {
            const td = document.createElement('td');
            td.textContent = usdFormatter.format(AMORTIZATION[category][i][1])
            row.appendChild(td)
        }
        tableBody.appendChild(row);
    }

    const currentWindowStartingAmounts = {};
    const currentWindowExpenses = [];
    const currentWindowEndingAmounts = {};

    for (let i = 0; i < eachDateTotal.length; i++) {
        const [date] = eachDateTotal[i];
        const [nextDate] = eachDateTotal[i + 1] || [];
        if (date <= new Date(asOfDateInput.value) && (!nextDate || nextDate > new Date(asOfDateInput.value))) {
            currentWindowStartingAmounts['Total'] = eachDateTotal[i][1];
            for (const key in AMORTIZATION) {
                const [, amount] = AMORTIZATION[key][i];
                currentWindowStartingAmounts[key] = amount;
            }
            for (const key in EXPECTED_SPENDING) {
                for (const expense of EXPECTED_SPENDING[key]) {
                    const [expenseDate, expenseAmount, expenseDescription] = expense;
                    if (expenseDate >= date && (!nextDate || expenseDate < nextDate)) {
                        currentWindowExpenses.push({
                            category: key,
                            date: expenseDate,
                            amount: expenseAmount,
                            description: expenseDescription
                        });
                    }
                }
            }
            for (const key in currentWindowStartingAmounts) {
                const startingAmount = currentWindowStartingAmounts[key];
                const expenseAmount = currentWindowExpenses.filter(expense => expense.category === key || key === 'Total').reduce((total, expense) => total.add(expense.amount), new Decimal(0));
                const endingAmount = startingAmount.sub(expenseAmount);
                currentWindowEndingAmounts[key] = endingAmount;
            }
            break;
        }
    }

    for (const key in currentWindowEndingAmounts) {
        const amount = currentWindowEndingAmounts[key];
        const tdHead = document.createElement('td');
        const tdBody = document.createElement('td');
        tdHead.textContent = key;
        tdBody.textContent = usdFormatter.format(amount.toNumber());
        currentBalanceHead.appendChild(tdHead);
        currentBalanceBody.appendChild(tdBody);
    }

    for (const expense of currentWindowExpenses.sort((a, b) => a.date - b.date)) {
        const row = document.createElement('tr');
        const date = document.createElement('td');
        const category = document.createElement('td');
        const description = document.createElement('td');
        const amount = document.createElement('td');

        date.textContent = expense.date.toLocaleDateString();
        category.textContent = expense.category;
        description.textContent = expense.description;
        amount.textContent = usdFormatter.format(expense.amount.toNumber());
        row.append(date, amount, category, description);
        upcomingExpenses.appendChild(row);
    }
}


function calculateNewAmount() {
    if (!EXPECTED_SPENDING[newAmountTypeInput.value]) {
        EXPECTED_SPENDING[newAmountTypeInput.value] = []
    }
    EXPECTED_SPENDING[newAmountTypeInput.value].push([new Date(newDateInput.value), new Decimal(newAmountInput.value), newDescriptionInput.value]);
    calculate();
}

function saveNewAmount() {
    koperfiConfig.expectedSpendingItems.push({
        category: newAmountTypeInput.value,
        date: newDateInput.value,
        amount: newAmountInput.value,
        description: newDescriptionInput.value
    })
    localStorage.setItem('koperfi-config', JSON.stringify(koperfiConfig))
    calculateNewAmount();
    newAmountInput.value = '';
    newDateInput.value = '';
    newAmountTypeInput.selectedIndex = 0;
    newDescriptionInput.value = '';
}

function refresh() {
    location.reload();
}

calculate();