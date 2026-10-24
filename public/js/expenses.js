const expenseList = document.getElementById("expenseList");
const message = document.getElementById("message");
const paginationContainer = document.getElementById("pagination");
const rowsPerPageSelect = document.getElementById("rowsPerPage");

const savedLimit = localStorage.getItem("rowsPerPage") || "10";
if (rowsPerPageSelect) {
    rowsPerPageSelect.value = savedLimit;
}

if (rowsPerPageSelect) {
    rowsPerPageSelect.addEventListener("change", (e) => {
        localStorage.setItem("rowsPerPage", e.target.value);
        window.loadExpenses(1); 
    });
}

window.loadExpenses = async (page = 1) => {
    try {
        const limit = localStorage.getItem("rowsPerPage") || 10;
        
        const response = await axios.get(`/expense/get-expenses?page=${page}&limit=${limit}`, {
            headers: { "Authorization": window.token }
        });
        
        expenseList.innerHTML = ""; 
        
        response.data.expenses.forEach(expense => {
            const li = document.createElement("li");
            
            // NEW: Added note to the UI display string
            const noteDisplay = expense.note ? ` | Note: ${expense.note}` : '';
            li.textContent = `${expense.category} - ${expense.description}${noteDisplay}: $${expense.amount} `;
            
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.style.marginLeft = "10px";
            deleteBtn.style.backgroundColor = "red";
            deleteBtn.style.color = "white";
            
            deleteBtn.onclick = async () => {
                try {
                    await axios.delete(`/expense/delete-expense/${expense.id}`, {
                        headers: { "Authorization": window.token }
                    });
                    
                    li.remove();
                    if (message) message.textContent = "Expense deleted.";
                    
                    window.loadExpenses(page);
                } catch (error) {
                    console.error("Failed to delete expense:", error);
                    if (message) message.textContent = "Could not delete expense.";
                }
            };

            li.appendChild(deleteBtn);
            expenseList.appendChild(li);
        });

        showPagination(response.data);

    } catch (error) {
        console.error("Failed to fetch expenses:", error);
        if (message) message.textContent = "Could not load expenses.";
    }
};

function showPagination({ currentPage, hasNextPage, nextPage, hasPreviousPage, previousPage, lastPage }) {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = ""; 

    if (currentPage > 2) {
        const firstBtn = document.createElement("button");
        firstBtn.textContent = "First (1)";
        firstBtn.onclick = () => window.loadExpenses(1);
        paginationContainer.appendChild(firstBtn);

        const dots = document.createElement("span");
        dots.textContent = " ... ";
        paginationContainer.appendChild(dots);
    }

    if (hasPreviousPage) {
        const prevBtn = document.createElement("button");
        prevBtn.textContent = previousPage;
        prevBtn.onclick = () => window.loadExpenses(previousPage);
        paginationContainer.appendChild(prevBtn);
    }

    const currBtn = document.createElement("button");
    currBtn.textContent = currentPage;
    currBtn.style.backgroundColor = "black";
    currBtn.style.color = "white";
    currBtn.onclick = () => window.loadExpenses(currentPage);
    paginationContainer.appendChild(currBtn);

    if (hasNextPage) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = nextPage;
        nextBtn.onclick = () => window.loadExpenses(nextPage);
        paginationContainer.appendChild(nextBtn);
    }

    if (lastPage > 0 && lastPage !== currentPage && lastPage !== nextPage) {
        const dots = document.createElement("span");
        dots.textContent = " ... ";
        paginationContainer.appendChild(dots);

        const lastBtn = document.createElement("button");
        lastBtn.textContent = `Last (${lastPage})`;
        lastBtn.onclick = () => window.loadExpenses(lastPage);
        paginationContainer.appendChild(lastBtn);
    }
}

document.getElementById("expenseForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const amount = e.target.elements.amount.value;
    const description = e.target.elements.description.value;
    const category = e.target.elements.category.value;
    const note = e.target.elements.note.value; // NEW: Capture note

    submitBtn.disabled = true;
    submitBtn.textContent = "Thinking...";
    e.target.reset(); 

    try {
        const response = await axios.post("/expense/add",
            { amount, description, category, note }, // NEW: Send note
            { headers: { "Authorization": window.token } }
        );

        if (message) message.textContent = response.data.message;    
        
        window.loadExpenses(1);

    } catch (error) {
        console.error("Failed to add expense:", error);
        if (message) message.textContent = "Error adding expense.";
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
    }
});