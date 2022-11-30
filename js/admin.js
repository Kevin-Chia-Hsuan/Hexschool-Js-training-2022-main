/* global c3 */
/* global axios */
/* global Swal */

// 請代入自己的網址路徑
const apiPath = 'kevinapog47138';
const token = 'PlH6W1FHqORAJ8Y7JqaISlcf71a2';

// 後臺訂單
const OrderUrl = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`;

// 訂單相關
let orderData = [];

// DOM
const orderList = document.querySelector('.orderPage-table-body');
const discardAllBtn = document.querySelector('.discardAllBtn');

// C3 圖表LV1
// eslint-disable-next-line no-unused-vars
function renderC3(data) {
  // console.log(data);
  const total = {};
  data.forEach((item) => {
    item.products.forEach((productItem) => {
      if (total[productItem.category] === undefined) {
        total[productItem.category] = productItem.price * productItem.quantity;
      } else {
        total[productItem.category] += productItem.price * productItem.quantity;
      }
    });
  });
  // console.log(total);
  // 資料關聯
  const categoryAry = Object.keys(total);
  // console.log(categoryAry);
  const newData = [];
  categoryAry.forEach((item) => {
    const ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  });
  // console.log(newData);

  // eslint-disable-next-line no-unused-vars
  const chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: 'pie',
      columns: newData,
      colors: {
        收納: '#DACBFF',
        床架: '#9D7FEA',
        窗簾: '#5434A7',
        其他: '#301E5F',
      },
    },
  });
}

// C3 圖表LV2
function renderC3LV2(data) {
  // 物件資料蒐集
  const obj = {};
  data.forEach((item) => {
    item.products.forEach((productItem) => {
      if (obj[productItem.title] === undefined) {
        obj[productItem.title] = productItem.price * productItem.quantity;
      } else {
        obj[productItem.title] += productItem.price * productItem.quantity;
      }
    });
  });
  // console.log(total);

  // 做出資料關聯
  const originAry = Object.keys(obj);
  // console.log(categoryAry);
  const rankSortAry = [];
  originAry.forEach((item) => {
    const ary = [];
    ary.push(item);
    ary.push(obj[item]);
    rankSortAry.push(ary);
  });
  // console.log(rankSortAry);

  // 比大小，降冪排序(目的：取營收前三高的產品當作主色塊，其他剩餘品項加總成一個色塊顯示)
  rankSortAry.sort((a, b) => b[1] - a[1]);
  // a[1]、b[1] 是因為要取陣列的第2筆資料，也就是金額來作為排序比較的值，由大到小，所以是b[1] - a[1]

  // console.log(rankSortAry);
  // 如果超過4筆以上，就統整為其他區塊
  const len = rankSortAry.length;
  // 因為陣列是從0開始，超過4筆就是>3
  if (len > 3) {
    let otherTotal = 0;
    rankSortAry.forEach((item, index) => {
      // 第3筆資料開始，就把每一筆資料的金額加總
      if (index > 2) {
        otherTotal += rankSortAry[index][1];
      }
    });
    // 從第4筆資料開始移除
    rankSortAry.splice(3, rankSortAry.length - 1);
    // 新增一個其他資料，並把加總金額也一同push進去
    rankSortAry.push(['其他', otherTotal]);
  }

  // C3程式碼
  // eslint-disable-next-line no-unused-vars
  const chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: 'pie',
      columns: rankSortAry,
    },
    color: {
      pattern: ['#301E5F', '#5434A7', '#9D7FEA', '#DACBFF'],
    },
  });
}

// 渲染訂單列表
function renderOrderList(data) {
  // console.log(data);
  // 將orderData按照createdAt值重新依序排序
  orderData = orderData.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

  let str = '';
  data.forEach((item) => {
    let productDetail = '';
    // 彙整訂單內產品及數量
    item.products.forEach((productItem) => {
      productDetail += `<p>${productItem.title}X${productItem.quantity}</p>`;
    });
    // console.log(productDetail);

    // 時間戳轉換日期
    const timesTemp = new Date((item.createdAt) * 1000);
    const thisTime = `${timesTemp.getFullYear()}/${timesTemp.getMonth() + 1}/${timesTemp.getDate()}`;

    // 判斷訂單狀態
    let orderStatus = '';
    if (item.paid === true) {
      orderStatus = '已確認';
    } else {
      orderStatus = '未確認';
    }

    // 組訂單字串
    str += `<tr>
      <td>${item.id}</td>
      <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
      </td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td>
          ${productDetail}
      </td>
      <td>${thisTime}</td>
      <td class="orderStatus">
          <a href="#" class="confirmOrderBtn" data-id="${item.id}" data-paid="${item.paid}">${orderStatus}</a>
      </td>
      <td>
          <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
      </td>
    </tr>`;
  });
  orderList.innerHTML = str;
  // renderC3(orderData);
  renderC3LV2(orderData);
}

// 取得後台訂單內容
function getOrderList() {
  axios.get(OrderUrl, {
    headers: {
      Authorization: token,
    },
  }).then((res) => {
    // console.log(res.data.orders);
    orderData = res.data.orders;
    renderOrderList(orderData);
  }).catch((error) => {
    console.log(error);
  });
}

// 訂單修改為確認
function editConfirmOrder(orderId) {
  // console.log(orderId, '改為確認');
  axios.put(OrderUrl,
    {
      data: {
        id: orderId,
        paid: true,
      },
    }, {
    headers: {
      Authorization: token,
    },
  }).then((res) => {
    Swal.fire('成功', '訂單已確認', 'success');
    orderData = res.data.orders;
    // 直接使用response的資訊帶參數執行渲染購物車列表的function，減少 request
    renderOrderList(orderData);
  }).catch((error) => {
    console.log(error);
  });
}

// 訂單修改為未確認
function editUnConfirmOrder(orderId) {
  // console.log(orderId, '改為未確認');
  axios.put(OrderUrl,
    {
      data: {
        id: orderId,
        paid: false,
      },
    }, {
    headers: {
      Authorization: token,
    },
  }).then((res) => {
    Swal.fire('成功', '訂單修改為未確認', 'success');
    orderData = res.data.orders;
    // 直接使用response的資訊帶參數執行渲染購物車列表的function，減少 request
    renderOrderList(orderData);
  }).catch((error) => {
    console.log(error);
  });
}

// 刪除特定訂單
function deleteOrderItem(orderId) {
  axios.delete(`${OrderUrl}/${orderId}`, {
    headers: {
      Authorization: token,
    },
  }).then((res) => {
    Swal.fire('成功', '訂單刪除成功', 'success');
    orderData = res.data.orders;
    // 直接使用response的資訊帶參數執行渲染購物車列表的function，減少 request
    renderOrderList(orderData);
  });
}

// 監聽訂單列表內訂單狀態及刪除按鈕
orderList.addEventListener('click', (e) => {
  e.preventDefault();
  const confirmOrderBtn = e.target.getAttribute('class');
  const deleteOrderBtn = e.target.getAttribute('class');
  // console.log(confirmOrderBtn);
  if (
    confirmOrderBtn !== 'confirmOrderBtn'
    && deleteOrderBtn !== 'delSingleOrder-Btn'
  ) {
    // console.log('沒點擊到按鈕唷');
    return;
  }
  // 點擊確認訂單狀態按鈕後，取得該列data-id的產品id編號
  const orderId = e.target.getAttribute('data-id');
  const paidStatus = e.target.getAttribute('data-paid');
  // console.log(orderId, paidStatus);
  // 如果訂單狀態為未確認
  if (confirmOrderBtn === 'confirmOrderBtn' && paidStatus === 'false') {
    // console.log('未確認');
    editConfirmOrder(orderId);
    return;
  }
  if (confirmOrderBtn === 'confirmOrderBtn' && paidStatus === 'true') {
    // console.log('未確認');
    editUnConfirmOrder(orderId);
    return;
  }
  if (deleteOrderBtn === 'delSingleOrder-Btn') {
    // console.log('點擊到刪除按鈕', orderId);
    deleteOrderItem(orderId);
  }
});

// 清除全部訂單
function deleteAllOrderItem() {
  axios.delete(OrderUrl, {
    headers: {
      Authorization: token,
    },
  }).then((res) => {
    Swal.fire('成功', '清除全部訂單成功', 'success');
    orderData = res.data.orders;
    // 直接使用response的資訊帶參數執行渲染購物車列表的function，減少 request
    renderOrderList(orderData);
  }).catch((error) => {
    console.log(error);
  });
}

// 監聽清除全部訂單按鈕
discardAllBtn.addEventListener('click', (e) => {
  e.preventDefault();
  deleteAllOrderItem();
});

// 資料初始化
function init() {
  getOrderList();
}

init();
