//Budget data controller
////////////////////////////////////////////
var budgetController = (function() {
    //Object constructors
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value * 100) / totalIncome);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //Data structure
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 //we use -1 for a value that doesnt exist
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(current) {
            sum += current.value;

        });
        data.totals[type] = sum;
    }

    return {
        addItemToData: function(type, des, val) {
            var newItem, ID;
            //creat new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //creat new item based on the type parameter
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //we push our new item data into our datastructure and we return the new obj
            data.allItems[type].push(newItem);
            return newItem;
        },
        calculateBudget: function() {
            //calculate total income and espenses

            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget income - expense
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of the income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp * 100) / data.totals.inc);

            } else {
                data.percentage = -1;
            }
            
        },
        calculatePercentages: function() {
            //calc the perc for each expense list item
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function() {
            var allPerc;

            //we are looping trough the expenses array using the getpercentage method
            allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });

            return allPerc;
        }, 
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }, 
        deleteDataItem: function(type, id) {
            //we loop through the appropiate array to match the ids
            data.allItems[type].forEach(function(current, index) {
                if(id === current.id) {
                    data.allItems[type].splice(index, 1);
                }
            });

        },


        //store data into LS
        saveLSData: function() {
            localStorage.setItem('data', JSON.stringify(data));
        },
        //get items from LS
        getItemsFromLS: function() {
            let ls;
            if(localStorage.getItem('data') !== null) {
                ls = JSON.parse(localStorage.getItem('data'));
            } else {
                ls = data;
            }

            return ls;
        },
        data: data, 
    }

})();


//User interface controller
////////////////////////////////////////////
var UIController = (function() {
    //Selectors opject
    var DOMselectors = {
        inputTypeSwitch: '.add__switch',
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        itemContainer: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    
    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];
        
        return (type === '' ? '' : type === 'inc' ? '+ ' : '- ') + int + '.' + dec;
    };

    //UICTRL public methods
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMselectors.inputType).textContent, //the value of the option inc or exp
                description: document.querySelector(DOMselectors.inputDescription).value,
                value: parseFloat(document.querySelector(DOMselectors.inputValue).value)
            };
        },
        getDOMselectors: function() {
            return DOMselectors;
        },
        addItemToList: function(obj, type) {
            var html, element;
            //Create HTML strings from the new obj
            if(type === 'inc') {
                html = '<div class="item clearfix" id="inc-' + obj.id + '"><div class="item__description">' + obj.description + '</div><div class="right clearfix"><div class="item__value">' + formatNumber(obj.value, type) + '</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

                element = DOMselectors.incomeContainer;
            } else if(type === 'exp') {
                html = '<div class="item clearfix" id="exp-' + obj.id + '"><div class="item__description">' + obj.description + '</div><div class="right clearfix"><div class="item__value">' + formatNumber(obj.value, type) + '</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

                element = DOMselectors.expenseContainer;
            }

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },
        clearFields: function() {
            let fields, fieldsArr;

            //selectink the input fields together
            fields = document.querySelectorAll(DOMselectors.inputDescription + ', ' + DOMselectors.inputValue);

            //converting the nodelist into array
            fieldsArr = Array.prototype.slice.call(fields);

            //we loop trough the input array and clear the value
            fieldsArr.forEach(function(inp) {
                inp.value = '';
            });

            //set the focus back to tha input field
            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {
            let type;
            obj.budget === 0 ? type = '' : obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMselectors.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMselectors.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMselectors.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0) {
                document.querySelector(DOMselectors.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMselectors.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages) {
            let fields;

            fields = document.querySelectorAll(DOMselectors.expensePercLabel);

            fields.forEach(function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        displayDate: function() {
            let now, month, months, year;

            months = ['January', 'Fabruary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMselectors.dateLabel).textContent = months[month] + ' ' + year;
        },
        deleteListItem: function(id) {
            document.querySelector('#' + id).remove();
        },
        changedType: function(event) {
            let inpType, switchType;
            
        
            if(event.target.textContent === 'inc') {
                switchType = document.querySelector(DOMselectors.inputTypeSwitch)
                switchType.classList.remove('add__switch--inc');
                switchType.classList.add('add__switch--exp');
                inpType = document.querySelector(DOMselectors.inputType)
                inpType.classList.remove('add__type--inc');
                inpType.classList.add('add__type--exp');
                inpType.textContent = 'exp';

                document.querySelector(DOMselectors.addButton).classList.add('red');
                document.querySelector(DOMselectors.inputValue).classList.add('red-focus');
                document.querySelector(DOMselectors.inputDescription).classList.add('red-focus');

            } else {
                switchType = document.querySelector(DOMselectors.inputTypeSwitch)
                switchType.classList.remove('add__switch--exp');
                switchType.classList.add('add__switch--inc');
                inpType = document.querySelector(DOMselectors.inputType)
                inpType.classList.remove('add__type--exp');
                inpType.classList.add('add__type--inc');
                inpType.textContent = 'inc';

                document.querySelector(DOMselectors.addButton).classList.remove('red');
                document.querySelector(DOMselectors.inputValue).classList.remove('red-focus');
                document.querySelector(DOMselectors.inputDescription).classList.remove('red-focus');
            }
            
        }
    };
})();


//Aplication controller
////////////////////////////////////////////
var AppController = (function(budegetCtrl, uiCtrl) {
    //event  listeners
    const setEventListeners = function() {
        //retriving the selectors from UIcontroller
        const dom = uiCtrl.getDOMselectors();
        
        //listening for the click event on the add button
        document.querySelector(dom.addButton).addEventListener('click', addItemHandler);

        //listening for the keypress event on the document
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                addItemHandler();
            }
        });

        document.querySelector(dom.itemContainer).addEventListener('click', deleteItemHandler);

        document.querySelector(dom.inputType).addEventListener('click', uiCtrl.changedType);
        
    };

    //on page load check our database, retrieve data, and populate list items
    const pageInit = function() {
        let lsItems;
        //get items from LS
        lsItems = budgetController.getItemsFromLS();

        //loop trough the income array and creat incomes objects from the data
        lsItems.allItems.inc.forEach(current => {
            let newItem = budgetController.addItemToData('inc', current.description, current.value);
            uiCtrl.addItemToList(newItem, 'inc');
        });

        //loop trough the expenses array and creat expenses objects from the data
        lsItems.allItems.exp.forEach(current => {
            let newItem = budgetController.addItemToData('exp', current.description, current.value);
            uiCtrl.addItemToList(newItem, 'exp');
        });

        //calculate and display hte budget on the ui
        updateBudget();

        //calculate and display the percentage for each item
        updatePercentages();
    }

    const addItemHandler = function() {
        let newItem, input;

        //1. Get the field input data
        input = uiCtrl.getInput();
        
        if(input.description.trim() !== '' &&
           !isNaN(input.value) &&
           input.value > 0) {
            //2. Add the item to the budget controller
            newItem = budegetCtrl.addItemToData(input.type, input.description, input.value);

            //3. Add the item to the UI
            uiCtrl.addItemToList(newItem, input.type);

            //4. Clear the dom inout fields
            uiCtrl.clearFields();

            //5. Calculate the budget and Display the budget on the UI
            updateBudget();

            //calculate and display the percentage for each item
            updatePercentages();

            //save data to LS
            budegetCtrl.saveLSData();
        }
    };

    const deleteItemHandler = function(event) {
        let itemId, type, id;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(event.target.closest('i')) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);

            //delete item from the data structure
            budegetCtrl.deleteDataItem(type, id);

            //delete item from the dom
            uiCtrl.deleteListItem(itemId);

            //update and show the new budget
            updateBudget();

            //calculate and display the percentage for each item
            updatePercentages();

            //save data to LS
            budegetCtrl.saveLSData();
        }
    };

    const updatePercentages = function() {
        let percentages;
        //calculating each items percentage
        budegetCtrl.calculatePercentages();

        //getting back the data 
        percentages = budegetCtrl.getPercentages();

        //displaying on the UI
        uiCtrl.displayPercentages(percentages);
    };

    const updateBudget = function() {
        let budget;
        //Calculate budget
        budegetCtrl.calculateBudget();
        //Return budget
        budget = budgetController.getBudget();
        //Update budget
        uiCtrl.displayBudget(budget);
    };

    return {
        init: function() {
            setEventListeners();

            pageInit();

            uiCtrl.displayDate();
        }
    };
})(budgetController, UIController);

AppController.init();