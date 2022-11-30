/* global axios */
/* global Swal */

// 請代入自己的網址路徑
const apiPath = 'kevinapog47138';

// 前台產品列表
const productUrl = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/products`;
// 前台購物車列表
const cartListUrl = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`;
// 前台增加訂單列表
const addOrderUrl = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/orders`;

// 產品列表相關
let productData = [];
// 購物車列表相關
let cartListData = [];
// 訂單相關
let orderData = {};

// 產品列表DOM
const productList = document.querySelector('.productWrap');
// 產品分類下拉DOM
const productCategory = document.querySelector('.productSelect');
// 購物車列表DOM
const cartList = document.querySelector('.shoppingCart-table');
// 訂單表單DOM
const addTicketForm = document.querySelector('.orderInfo-form');
// 送出訂單按鈕DOM
const sendOrder = document.querySelector('.orderInfo-btn');

// 數字千分位加,
function toThousands(x) {
  const parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// 渲染產品列表
// eslint-disable-next-line no-shadow
function renderProductList(data) {
  let str = '';
  data.forEach((item) => {
    // 組裝字串
    str += `
      <li class="productCard">
        <h4 class="productType">新品</h4>
        <img
          src="${item.images}"
          alt="${item.description}"
        />
        <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
        <p class="nowPrice">NT$${toThousands(item.price)}</p>
      </li>
    `;
  });
  productList.innerHTML = str;
}

// 取得產品列表
function getProductList() {
  axios.get(productUrl)
    .then((res) => {
      productData = res.data.products;
      // console.log(productData);
      renderProductList(productData);
    }).catch((error) => {
      console.log(error);
    });
}

// 篩選購物車列表
productCategory.addEventListener('change', (e) => {
  // console.log(e.target.value);
  // 抓取目前下拉選單的值
  const category = e.target.value;
  let newProductData = [];

  // 如果下拉選單選到的value值是全部，則newProductData帶入全產品列表內容
  if (category === '全部') {
    newProductData = productData;
  }
  productData.forEach((item) => {
    if (category === item.category) {
      // 將下拉篩選出來的資料push到newProductData陣列中
      newProductData.push(item);
    }
  });
  // 將篩選後的newProductData帶入渲染函式重新渲染畫面
  renderProductList(newProductData);
});

// 渲染購物車列表
function renderCartList(data) {
  let str = '';
  // 取得購物車內筆數
  const cartListDataLen = data.length;
  // 預設總金額為0
  let totalPrice = 0;
  // console.log(cartListDataLen);

  // 若購物車內筆數為0，則表示購物車內無品項資料
  if (cartListDataLen === 0) {
    str = '<h2>目前購物車中無任何品項</h2>';
    cartList.innerHTML = str;
    return;
  }
  // 若購物車內筆數不為0，則開始組裝字串
  data.forEach((item) => {
    // console.log(item);
    str += `
      <tr>
        <td>
          <div class="cardItem-title">
            <img src="${item.product.images}" alt="">
            <p>${item.product.title}</p>
          </div>
          </td>
          <td>
            NT$${toThousands(item.product.price)}</td>
          <td>${item.quantity === 1 ? `<button type="button" class="btn removeItem" data-id="${item.id}" disabled>-</button>` : `<button type="button" class="btn removeItem" data-id="${item.id}">-</button>`}
            <input type="text" class="inputQuantity" id="${item.id}" value="${item.quantity}" disabled>
            <button type="button" class="btn addItem" data-id="${item.id}">+</button>
          </td>
          <td>
            ${toThousands(item.product.price * item.quantity)}
          </td>
          <td class="discardBtn">
            <a href="#" class="material-icons removeCartItem" data-id="${item.id}">
                clear
            </a>
          </td>
        </tr>`;
    // 加總總金額
    totalPrice += item.product.price * item.quantity;
  });
  cartList.innerHTML = `<tr>
    <th width="40%">品項</th>
      <th width="15%">單價</th>
      <th width="15%">數量</th>
      <th width="15%">金額</th>
      <th width="15%"></th>
    </tr>
      ${str}
    <tr>
      <td>
        <a href="#" class="discardAllBtn">刪除所有品項</a>
      </td>
      <td></td>
      <td></td>
      <td>
        <p>總金額</p>
      </td>
      <td>
        NT$${toThousands(totalPrice)}
      </td>
  </tr>`;
}

function updateCartNum(status, id) {
  // 這個選擇器寫法對於id是數字開頭的會有問題
  // let num = Number(document.querySelector(`#${id}`).value);
  // 或使用這種宣告寫法
  let num = Number(document.querySelector(`[id='${id}']`).value);
  // console.log(num);
  if (status === 'add') {
    num += 1;
  } else if (num > 1) {
      num -= 1;
    }
  const data = {
    data: {
      id,
      quantity: num,
    },
  };
  axios.patch(cartListUrl, data)
    .then((res) => {
      // 取得購物車列表
      Swal.fire('成功', '購物車更新成功', 'success');
      cartListData = res.data.carts;
      renderCartList(cartListData);
    })
    .catch((error) => {
      console.log(error);
    });
}

// 取得購物車列表
function getCartList() {
  axios.get(cartListUrl)
    .then((res) => {
      // console.log(res.data.carts);
      cartListData = res.data.carts;
      renderCartList(cartListData);
    }).catch((error) => {
      console.log(error);
    });
}

// 加入購物車
function addCartItem(id) {
  // 因為預設送出的數量是 1，+=1的條件是購物車中有對應的資料，才會 +=1
  let numCheck = 1;
  cartListData.forEach((item) => {
    if (item.product.id === id) {
      // eslint-disable-next-line no-param-reassign
      item.quantity += 1;
      numCheck = item.quantity;
    }
  });
  axios.post(cartListUrl, {
    data: {
      productId: id,
      quantity: numCheck,
    },
  }).then((res) => {
    Swal.fire('成功', '加入購物車成功', 'success');
    // 直接使用response的資訊帶參數執行渲染購物車列表的function，減少 request
    cartListData = res.data.carts;
    renderCartList(cartListData);
  }).catch((error) => {
    console.log(error);
  });
}

// 加入購物車按鈕a，因為是渲染出來的結構沒辦法直接掛監聽，所以改為使用父元素做判斷
// 監聽產品列表加入購物車
productList.addEventListener('click', (e) => {
  e.preventDefault();
  const JsAddCart = e.target.getAttribute('class');
  const id = e.target.getAttribute('data-id');
  if (JsAddCart !== 'addCardBtn') {
    return;
  }
  addCartItem(id);
});

// 監聽購物車內各品項的加減數量按鈕
cartList.addEventListener('click', (e) => {
  const JsAddItem = e.target.getAttribute('class');
  const id = e.target.getAttribute('data-id');
  // console.log(JsAddItem, id);
  if (JsAddItem === 'btn addItem') {
    // console.log('點擊到數量+1', e);
    updateCartNum('add', id);
    return;
  }
  if (JsAddItem === 'btn removeItem') {
    // console.log('點擊到數量+1', e);
    updateCartNum('remove', id);
  }
});

// 移除購物車
function deleteCartItem(id) {
  // console.log(id);
  axios.delete(`${cartListUrl}/${id}`)
    .then((res) => {
      Swal.fire('成功', '刪除購物車成功', 'success');
      // 直接使用response的資訊帶參數執行渲染購物車列表的function，減少 request
      cartListData = res.data.carts;
      renderCartList(cartListData);
    }).catch((error) => {
      console.log(error);
    });
}

// // 購物車移除及刪除全部購物車按鈕a，因為是渲染出來的結構沒辦法直接掛監聽，所以改為使用父元素做判斷
// 監聽產品列表移除購物車
cartList.addEventListener('click', (e) => {
  e.preventDefault();
  const JsDeleteCart = e.target.getAttribute('class');
  const id = e.target.getAttribute('data-id');
  if (JsDeleteCart !== 'material-icons removeCartItem') {
    // console.log('未點擊到移除購物車');
    return;
  }
  deleteCartItem(id);
});

// 刪除全部購物車內容
function deleteAllCartList() {
  axios.delete(cartListUrl)
    .then((res) => {
      Swal.fire('成功', '刪除全部購物車成功', 'success');
      // 直接使用response的資訊帶參數執行渲染購物車列表的function，減少 request
      cartListData = res.data.carts;
      renderCartList(cartListData);
    }).catch((error) => {
      console.log(error);
    });
}

// 監聽產品列表刪除所有品項
cartList.addEventListener('click', (e) => {
  e.preventDefault();
  const JSDeleteAllCart = e.target.getAttribute('class');
  if (JSDeleteAllCart !== 'discardAllBtn') {
    // console.log('沒點擊到按鈕');
    return;
  }
  // console.log('點擊到按鈕');
  deleteAllCartList();
});

// 送出訂單
function creatOrderList(data) {
  // console.log(data);
  axios.post(addOrderUrl, {
    data: {
      user: {
        name: data.name,
        tel: data.tel,
        email: data.email,
        address: data.address,
        payment: data.payment,
      },
    },
  })
    .then(() => {
      Swal.fire('成功', '訂單建立成功', 'success');
      getCartList();
      // 一鍵清除表單
      addTicketForm.reset();
    }).catch((error) => {
      console.log(error);
    });
}

// 監聽送出訂單按鈕
sendOrder.addEventListener('click', (e) => {
  e.preventDefault();
  // 取得訂單表單欄位value值 DOM
  const orderNameValue = document.querySelector('#customerName').value.trim();
  const orderTelValue = document.querySelector('#customerPhone').value.trim();
  const orderEmailValue = document.querySelector('#customerEmail').value.trim();
  const orderAddressValue = document.querySelector('#customerAddress').value.trim();
  const orderPaymentValue = document.querySelector('#tradeWay').value;
  const dmPhone = '[data-message="電話"]';

  // 正規表達式，驗證室內電話、手機號碼規則
  // 室內電話格式: 0X-XXXXXXXX，X為任意數字
  const rePhone = /^(0\d+)-(\d{8})(?:(?:#)(\d+))?$/;
  // 手機號格式: 09XXXXXXXX，X為任意數字
  const reCellPhone = /^[09]{2}[0-9]{8}$/;

  if (
    !rePhone.test(orderTelValue)
    && !reCellPhone.test(orderTelValue)
  ) {
    document.querySelector(`${dmPhone}`).textContent = '電話格式不正確，0X-XXXXXXXX 或 09XXXXXXXX';
    return;
  }

  // 取得購物車內商品數量
  const cartLength = cartListData.length;
  if (cartLength === 0) {
    Swal.fire('失敗', '購物車內無任何商品', 'error');
    return;
  }
  // 檢驗表單資料是否有空白
  if (orderNameValue === '' || orderTelValue === '' || orderEmailValue === '' || orderAddressValue === '' || orderPaymentValue === '') {
    Swal.fire('失敗', '請完整填寫預定資訊', 'error');
    return;
  }
  // 如果都沒問題，組成訂單所需格式
  orderData = {
    name: orderNameValue,
    tel: orderTelValue,
    email: orderEmailValue,
    address: orderAddressValue,
    payment: orderPaymentValue,
  };
  // console.log(orderData);
  creatOrderList(orderData);
});

// 表單驗證
const constraints = {
  姓名: {
    presence: {
      message: '是必填欄位',
    },
  },
  電話: {
    presence: {
      message: '是必填欄位',
    },
  },
  Email: {
    presence: {
      message: '是必填欄位',
    },
    email: {
      message: '格式不正確，必須包括 @ 和 . ',
    },
  },
  寄送地址: {
    presence: {
      message: '是必填欄位',
    },
  },
};

/* global validate */
// 表單inputs DOM
const inputs = document.querySelectorAll('#customerName, #customerPhone, #customerEmail, #customerAddress');

inputs.forEach((item) => {
  // console.log(item);
  item.addEventListener('change', () => {
    // 預設為空值
    // console.log(item.nextElementSibling);
    const JsNextElementSibling = item.nextElementSibling;
    JsNextElementSibling.textContent = '';
    // 驗證回傳的內容
    const errors = validate(addTicketForm, constraints);
    // console.log(errors);
    // 呈現在畫面上
    if (errors) {
      // console.log(Object.keys(errors)) //keys -> 屬性
      Object.keys(errors).forEach((keys) => {
        // console.log(keys);
        document.querySelector(`.${keys}`).textContent = errors[keys];
      });
    }
  });
});

// 資料初始化
function init() {
  getProductList();
  getCartList();
}

init();
