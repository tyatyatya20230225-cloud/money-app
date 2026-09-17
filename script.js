javascript;
// ==========================
// データを読み込む
// ==========================

let money = Number(localStorage.getItem("money")) || 0;

let historyList = JSON.parse(localStorage.getItem("historyList")) || [];

// ==========================
// HTMLの要素を取得
// ==========================

const moneyElement = document.getElementById("money");

const incomeButton = document.getElementById("incomeButton");

const expenseButton = document.getElementById("expenseButton");

const formArea = document.getElementById("formArea");

const formTitle = document.getElementById("formTitle");

const amountInput = document.getElementById("amount");

const nameInput = document.getElementById("name");

const categoryInput = document.getElementById("category");

const addButton = document.getElementById("addButton");

const cancelButton = document.getElementById("cancelButton");

const historyElement = document.getElementById("history");

const monthlyIncomeElement = document.getElementById("monthlyIncome");

const monthlyExpenseElement = document.getElementById("monthlyExpense");

const monthlyBalanceElement = document.getElementById("monthlyBalance");

const categoryChart = document.getElementById("categoryChart");

// ==========================
// 現在の入力タイプ
// ==========================

let currentType = "income";

// ==========================
// 編集中の履歴番号
// ==========================

let editingIndex = null;

// ==========================
// お金を日本円で表示
// ==========================

function formatMoney(number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(number);
}

// ==========================
// 所持金を表示
// ==========================

function updateMoney() {
  moneyElement.textContent = formatMoney(money);
}

// ==========================
// 履歴を表示
// ==========================

function updateHistory() {
  historyElement.innerHTML = "";

  if (historyList.length === 0) {
    historyElement.innerHTML = "<p>まだ履歴がありません。</p>";

    return;
  }

  historyList.forEach(function (item, index) {
    const div = document.createElement("div");

    div.className = "history-item";

    let dateText = "";

    if (item.date) {
      const date = new Date(item.date);

      dateText = `${date.getMonth() + 1}/${date.getDate()}`;
    }

    div.innerHTML = `

                <div class="history-left">

                    <span class="history-name">

                        ${item.name}

                    </span>


                    <span class="history-info">

                        ${dateText}
                        ・
                        ${item.category}

                    </span>

                </div>


                <div>

                    <span
                        class="${item.type === "+" ? "income" : "expense"}"
                    >

                        ${item.type}
                        ${formatMoney(item.amount)}

                    </span>


                    <div
                        style="
                            margin-top: 6px;
                        "
                    >

                        <button
                            onclick="
                                editHistory(${index})
                            "

                            style="
                                border:none;
                                background:#ddd;
                                border-radius:6px;
                                padding:5px 8px;
                                cursor:pointer;
                            "
                        >

                            ✏️ 編集

                        </button>


                        <button
                            onclick="
                                deleteHistory(${index})
                            "

                            style="
                                border:none;
                                background:#ffd6d6;
                                border-radius:6px;
                                padding:5px 8px;
                                cursor:pointer;
                            "
                        >

                            🗑️ 削除

                        </button>

                    </div>

                </div>

            `;

    historyElement.appendChild(div);
  });
}

// ==========================
// データを保存
// ==========================

function saveData() {
  localStorage.setItem("money", money);

  localStorage.setItem("historyList", JSON.stringify(historyList));
}

// ==========================
// 今月の収支
// ==========================

function updateMonthlySummary() {
  const now = new Date();

  const currentYear = now.getFullYear();

  const currentMonth = now.getMonth();

  let monthlyIncome = 0;

  let monthlyExpense = 0;

  historyList.forEach(function (item) {
    if (!item.date) {
      return;
    }

    const date = new Date(item.date);

    if (
      date.getFullYear() === currentYear &&
      date.getMonth() === currentMonth
    ) {
      if (item.type === "+") {
        monthlyIncome += item.amount;
      } else {
        monthlyExpense += item.amount;
      }
    }
  });

  const balance = monthlyIncome - monthlyExpense;

  monthlyIncomeElement.textContent = formatMoney(monthlyIncome);

  monthlyExpenseElement.textContent = formatMoney(monthlyExpense);

  monthlyBalanceElement.textContent = formatMoney(balance);
}

// ==========================
// カテゴリ別支出
// ==========================

function updateCategoryChart() {
  const now = new Date();

  const currentYear = now.getFullYear();

  const currentMonth = now.getMonth();

  const categoryTotals = {};

  historyList.forEach(function (item) {
    if (item.type !== "-") {
      return;
    }

    if (!item.date) {
      return;
    }

    const date = new Date(item.date);

    if (
      date.getFullYear() === currentYear &&
      date.getMonth() === currentMonth
    ) {
      if (!categoryTotals[item.category]) {
        categoryTotals[item.category] = 0;
      }

      categoryTotals[item.category] += item.amount;
    }
  });

  categoryChart.innerHTML = "";

  if (Object.keys(categoryTotals).length === 0) {
    categoryChart.innerHTML = "<p>今月の支出はありません。</p>";

    return;
  }

  const maxAmount = Math.max(...Object.values(categoryTotals));

  Object.entries(categoryTotals).forEach(function ([category, amount]) {
    const item = document.createElement("div");

    item.className = "category-item";

    const percentage = (amount / maxAmount) * 100;

    item.innerHTML = `

                <div
                    class="category-title"
                >

                    <span>
                        ${category}
                    </span>


                    <strong>
                        ${formatMoney(amount)}
                    </strong>

                </div>


                <div
                    class="bar-background"
                >

                    <div
                        class="bar"
                        style="
                            width:${percentage}%
                        "
                    ></div>

                </div>

            `;

    categoryChart.appendChild(item);
  });
}

// ==========================
// 入力フォームを開く
// ==========================

function openForm(type) {
  currentType = type;

  editingIndex = null;

  formArea.style.display = "block";

  amountInput.value = "";

  nameInput.value = "";

  if (type === "income") {
    formTitle.textContent = "💰 収入を追加";

    categoryInput.innerHTML = `

            <option value="給料">
                給料
            </option>

            <option value="お小遣い">
                お小遣い
            </option>

            <option value="その他">
                その他
            </option>

        `;
  } else {
    formTitle.textContent = "💸 支出を追加";

    categoryInput.innerHTML = `

            <option value="食費">
                🍚 食費
            </option>

            <option value="交通費">
                🚃 交通費
            </option>

            <option value="服">
                👕 服
            </option>

            <option value="娯楽">
                🎮 娯楽
            </option>

            <option value="その他">
                📦 その他
            </option>

        `;
  }

  addButton.textContent = "追加する";

  amountInput.focus();
}

// ==========================
// 収入ボタン
// ==========================

incomeButton.addEventListener("click", function () {
  openForm("income");
});

// ==========================
// 支出ボタン
// ==========================

expenseButton.addEventListener("click", function () {
  openForm("expense");
});

// ==========================
// 追加・編集ボタン
// ==========================

addButton.addEventListener("click", function () {
  const amount = Number(amountInput.value);

  const name = nameInput.value.trim();

  const category = categoryInput.value;

  if (amount <= 0) {
    alert("金額を入力してください。");

    return;
  }

  if (name === "") {
    alert("内容を入力してください。");

    return;
  }

  // ======================
  // 新規追加
  // ======================

  if (editingIndex === null) {
    if (currentType === "expense" && amount > money) {
      alert("所持金より多い金額は使えません。");

      return;
    }

    if (currentType === "income") {
      money += amount;
    } else {
      money -= amount;
    }

    historyList.unshift({
      name: name,

      category: category,

      type: currentType === "income" ? "+" : "-",

      amount: amount,

      date: new Date().toISOString(),
    });
  }

  // ======================
  // 編集
  // ======================
  else {
    const oldItem = historyList[editingIndex];

    if (oldItem.type === "+") {
      money -= oldItem.amount;
    } else {
      money += oldItem.amount;
    }

    if (currentType === "expense" && amount > money) {
      alert("所持金より多い金額には変更できません。");

      if (oldItem.type === "+") {
        money += oldItem.amount;
      } else {
        money -= oldItem.amount;
      }

      return;
    }

    if (currentType === "income") {
      money += amount;
    } else {
      money -= amount;
    }

    historyList[editingIndex] = {
      name: name,

      category: category,

      type: currentType === "income" ? "+" : "-",

      amount: amount,

      date: oldItem.date,
    };

    editingIndex = null;
  }

  saveData();

  updateMoney();

  updateHistory();

  updateMonthlySummary();

  updateCategoryChart();

  formArea.style.display = "none";
});

// ==========================
// キャンセル
// ==========================

cancelButton.addEventListener("click", function () {
  editingIndex = null;

  formArea.style.display = "none";
});

// ==========================
// 履歴を編集
// ==========================

function editHistory(index) {
  const item = historyList[index];

  editingIndex = index;

  currentType = item.type === "+" ? "income" : "expense";

  formArea.style.display = "block";

  if (currentType === "income") {
    formTitle.textContent = "✏️ 収入を編集";

    categoryInput.innerHTML = `

            <option value="給料">
                給料
            </option>

            <option value="お小遣い">
                お小遣い
            </option>

            <option value="その他">
                その他
            </option>

        `;
  } else {
    formTitle.textContent = "✏️ 支出を編集";

    categoryInput.innerHTML = `

            <option value="食費">
                🍚 食費
            </option>

            <option value="交通費">
                🚃 交通費
            </option>

            <option value="服">
                👕 服
            </option>

            <option value="娯楽">
                🎮 娯楽
            </option>

            <option value="その他">
                📦 その他
            </option>

        `;
  }

  amountInput.value = item.amount;

  nameInput.value = item.name;

  categoryInput.value = item.category;

  addButton.textContent = "変更を保存";

  amountInput.focus();
}

// ==========================
// 履歴を削除
// ==========================

function deleteHistory(index) {
  const item = historyList[index];

  const result = confirm(
    `${item.name}（${formatMoney(item.amount)}）を削除しますか？`,
  );

  if (!result) {
    return;
  }

  if (item.type === "+") {
    money -= item.amount;
  } else {
    money += item.amount;
  }

  historyList.splice(index, 1);

  saveData();

  updateMoney();

  updateHistory();

  updateMonthlySummary();

  updateCategoryChart();
}

// ==========================
// 最初に画面を更新
// ==========================

updateMoney();

updateHistory();

updateMonthlySummary();

updateCategoryChart();
