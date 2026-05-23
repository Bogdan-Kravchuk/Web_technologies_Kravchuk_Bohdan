// primary goods
const initialProducts = [
  { name: "Помідори", qty: 2, bought: false },
  { name: "Печиво",   qty: 3, bought: false },
  { name: "Сир",      qty: 1, bought: true  },
];

// counter ID
let nextId = 1;

// map (create new array new variable is ID)
let products = initialProducts.map(p => ({ ...p, id: nextId++ }));

// DOM from HTML to DOM
const inputFormAddProduct = document.querySelector(".input_field");
const addProductButton    = document.querySelector(".add_product_button");
const productList         = document.querySelector(".product-list");
const remainingList       = document.querySelector(".remainder-list-of-product");
const purchasedList       = document.querySelector(".purchased-list");

// ── Draw product list ───────────────────────────────
function drawProductInListHTML() {
  //clear list
  productList.innerHTML = "";
  //if array is empty
  if (products.length == 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "Список порожній";
    productList.appendChild(emptyMsg);
    drawStatusWindow();
    return;
  }
  //get product object from product list
  products.forEach(p => {
    //create product
    const item = document.createElement("article");
    item.className = "not-bought-product"; 
    item.dataset.id = p.id; // save ID в атрибут data-id
    //product name 
    const productName = document.createElement("span");
    if (p.bought) { productName.className = "product-name crossed-out-text" }
    else { productName.className = "product-name" }
    productName.textContent = p.name;
    //edit product name 
    if (!p.bought) {
      productName.title = "Натисніть, щоб редагувати назву товару";
      productName.addEventListener("click", () => startEditName(p.id, item, productName));
    }
    item.appendChild(productName);

    // not bought product ------------------------------------
    if (!p.bought) {
      //minus button 
      const minusButton = document.createElement("button");
      minusButton.className = "minus-button tooltip";
      minusButton.dataset.tooltips = "Зменшити";
      minusButton.textContent = "−";
      minusButton.disabled = p.qty <= 1;
      minusButton.addEventListener("click", () => changeQty(p.id, -1));
// input field for amount of products 
      const amountInput = document.createElement("input");
      amountInput.className = "amount-of-product";
      amountInput.type = "number";
      amountInput.min = 1;
      amountInput.max = 100;
      amountInput.value = p.qty;
      amountInput.addEventListener("change", () => {
        const v = parseInt(amountInput.value) || 1;
        if (v < 1) setQty(p.id, 1);
        else if (v > 100) setQty(p.id, 100);
        else setQty(p.id, v);
      });
// plus button 
      const plusButton = document.createElement("button");
      plusButton.className = "plus-button tooltip";
      plusButton.dataset.tooltips = "Збільшити";
      plusButton.textContent = "+";
      plusButton.addEventListener("click", () => changeQty(p.id, 1));

      item.appendChild(minusButton);
      item.appendChild(amountInput);
      item.appendChild(plusButton);
    }
    // status button
    const statusButton = document.createElement("button");
    statusButton.className = "status tooltip";
    statusButton.dataset.tooltips = p.bought ? "Зробити не купленим" : "Відмітити куплено";
    statusButton.textContent = p.bought ? "✓ Куплено" : "Купити";
    statusButton.addEventListener("click", () => toggleBought(p.id));
    item.appendChild(statusButton);
  
    // delete button
    if (!p.bought) {
      const deleteButton = document.createElement("button");
      deleteButton.className = "cancel-button tooltip";
      deleteButton.dataset.tooltips = "Видалити";
      deleteButton.innerHTML = "✕";
      deleteButton.addEventListener("click", () => deleteProduct(p.id));
      item.appendChild(deleteButton);
    }
    productList.appendChild(item);
  
  })
  drawStatusWindow();
}; 


function drawStatusWindow() {
  const remaining = products.filter(p => !p.bought);
  const purchased = products.filter(p => p.bought);

 
  const updateDOMList = (window, items, isBought) => {
    window.innerHTML = ""; //clear list

    if (items.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.textContent = "Немає";
      window.appendChild(emptyMsg);
      return;
    }

    // DocumentFragment 
    const fragment = document.createDocumentFragment();

    items.forEach(p => {
      const itemSpan = document.createElement("span");
      itemSpan.className = isBought ? "product-item crossed-out-text" : "product-item";
      itemSpan.textContent = p.name + " "; 

      const amountSpan = document.createElement("span");
      amountSpan.className = "amount";
      amountSpan.textContent = p.qty;

      itemSpan.appendChild(amountSpan);
      fragment.appendChild(itemSpan);
    });

    window.appendChild(fragment);
  };

  updateDOMList(remainingList, remaining, false);
  updateDOMList(purchasedList, purchased, true);
}

//edit name of product 
function startEditName(id, itemHTML, productName) {
  const p = products.find(x => x.id === id);
  if (!p) return;
//HTML input for edit ptoduct name 
   const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.maxLength = 50;
  editInput.value = p.name // назва в інпуті
  editInput.className = "edit-name-input";
  itemHTML.replaceChild(editInput, productName);
  editInput.focus();  // ставить курсор у поле автоматично
  editInput.select(); // виділяє весь текст одразу
  //new product name 
  function finish() {
    const newName = editInput.value.trim();
    if (newName) p.name = newName; // new text 
    drawProductInListHTML (); // input → span (з новою назвою)
  }
  // if click out of input field -> save changes 
  editInput.addEventListener("blur",    finish);
  editInput.addEventListener("keydown", e => {
    if (e.key === "Enter")  editInput.blur();          // зберегти
    if (e.key === "Escape") { editInput.value = p.name; editInput.blur(); } // скасувати
  });


}
//actions --------------------------------------------------------
//add product 
function addProduct(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  products.push({ id: nextId++, name: trimmed, qty: 1, bought: false });
  drawProductInListHTML ();
}
//delete product 
function deleteProduct(id) {
  products = products.filter(p => p.id !== id);
  drawProductInListHTML ();
}
//change status 
function toggleBought(id) {
  const p = products.find(x => x.id === id);
  if (p) p.bought = !p.bought;
  drawProductInListHTML ();
}
//change amount of products via +- buttons 
function changeQty(id, delta) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  p.qty = p.qty + delta;
  if (p.qty < 1)   p.qty = 1;
  if (p.qty > 100) p.qty = 100;
  drawProductInListHTML ();
}
//set amount of product
function setQty(id, val) {
  const p = products.find(x => x.id === id);
  if (p) p.qty = val;
  drawProductInListHTML ();
}
//draw function status 
function renderStats() {
  const remaining = products.filter(p => !p.bought);
  const purchased = products.filter(p => p.bought);

}
// ── Search input field ──────────────────────────────────────────────
      const formSearch = document.querySelector(".search"); 
formSearch.addEventListener("submit", (e) => {
  e.preventDefault(); // do not send get request 
  
  // add new product
  addProduct(inputFormAddProduct.value);
  
  // clear input field 
  inputFormAddProduct.value = "";
  inputFormAddProduct.focus();
});

drawProductInListHTML();

